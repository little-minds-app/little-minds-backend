import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OtpChallengeStatus,
  OtpDeliveryState,
  ParentAccountLifecycle,
  type Prisma,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
import type { Request } from 'express';
import {
  throwInvalidRequest,
  throwOtpInvalid,
  throwOtpCooldown,
  throwSmsUnavailable,
} from '../session/auth.errors';
import {
  SessionIssuerService,
  type TokenPair,
} from '../session/session-issuer.service';
import { SMS_SENDER, type SmsSender } from '../sms/sms-sender';
import { OtpAbuseService } from './otp-abuse.service';
import {
  generateOtpCode,
  hashOtpCode,
  phoneSubjectKey,
  verifyOtpCode,
} from './otp-crypto';
import { normalizeTrMobileE164 } from './phone-normalize';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
  OTP_MAX_WRONG_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  PHONE_PROVIDER,
} from './otp.constants';

export type PhoneStartInput = {
  phone: string;
  countryCode?: string | null;
  noticeVersion: string;
  noticeLocale: string;
  clientSurface?: string | null;
  deviceId?: string | null;
};

export type PhoneStartResult = {
  challenge_id: string;
  expires_in: typeof OTP_TTL_SECONDS;
  resend_after: typeof OTP_RESEND_COOLDOWN_SECONDS;
};

export type PhoneVerifyInput = {
  challengeId: string;
  code: string;
  clientSurface?: string | null;
  deviceId?: string | null;
  userAgentSummary?: string | null;
};

type TxClient = Prisma.TransactionClient;

@Injectable()
export class PhoneOtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionIssuerService,
    private readonly abuse: OtpAbuseService,
    private readonly config: ConfigService<AppEnv, true>,
    @Inject(SMS_SENDER) private readonly sms: SmsSender,
  ) {}

  private otpPepper(): string {
    const pepper = this.config.get('OTP_PEPPER', { infer: true });
    if (!pepper || pepper.length < 16) {
      throw new Error('OTP_PEPPER must be set (≥16 chars)');
    }
    return pepper;
  }

  private phonePepper(): string {
    const pepper = this.config.get('PHONE_SUBJECT_PEPPER', { infer: true });
    if (!pepper || pepper.length < 16) {
      throw new Error('PHONE_SUBJECT_PEPPER must be set (≥16 chars)');
    }
    return pepper;
  }

  private assertNotice(version: string, locale: string): void {
    if (
      version !== ACTIVE_PRIVACY_NOTICE_VERSION ||
      locale !== ACTIVE_PRIVACY_NOTICE_LOCALE
    ) {
      // Uniform invalid_request — same shape for all callers (U12 / Option A).
      throwInvalidRequest('Invalid request');
    }
  }

  private renderTrSmsBody(code: string): string {
    // Vendor-neutral TR template (U11). Never log the body with code in prod logs.
    return `Little Minds dogrulama kodu: ${code}. ${OTP_TTL_SECONDS / 60} dk gecerli.`;
  }

  async start(req: Request, input: PhoneStartInput): Promise<PhoneStartResult> {
    const normalized = normalizeTrMobileE164(input.phone, input.countryCode);
    if (!normalized.ok) {
      throwInvalidRequest('Invalid request');
    }
    this.assertNotice(input.noticeVersion, input.noticeLocale);

    const subjectKey = phoneSubjectKey(normalized.e164, this.phonePepper());
    const ip = clientIp(req);
    const challengeId = randomUUID();
    const code = generateOtpCode();
    const codeHash = hashOtpCode(
      this.otpPepper(),
      challengeId,
      subjectKey,
      code,
    );
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);
    const noticePresentedAt = now;

    // Persist challenge + abuse counters; SMS outside locks (ADR-020 §9).
    await this.prisma.db.$transaction(async (tx) => {
      await this.abuse.assertAndIncrementSms({ subjectKey, ip, tx });

      const pending = await tx.otpChallenge.findFirst({
        where: {
          provider: PHONE_PROVIDER,
          subjectKey,
          status: OtpChallengeStatus.pending,
        },
      });
      if (pending?.lastSentAt) {
        const elapsed = now.getTime() - pending.lastSentAt.getTime();
        if (elapsed < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
          throwOtpCooldown();
        }
      }
      if (pending) {
        await tx.otpChallenge.update({
          where: { id: pending.id },
          data: {
            status: OtpChallengeStatus.superseded,
            deliveryState: OtpDeliveryState.superseded,
          },
        });
      }

      await tx.otpChallenge.create({
        data: {
          id: challengeId,
          provider: PHONE_PROVIDER,
          subjectKey,
          codeHash,
          status: OtpChallengeStatus.pending,
          deliveryState: OtpDeliveryState.pending_send,
          attemptCount: 0,
          sendCount: 0,
          expiresAt,
          noticeVersion: input.noticeVersion,
          noticeLocale: input.noticeLocale,
          noticePresentedAt,
          presentationSurface: input.clientSurface ?? null,
        },
      });
    });

    const sendResult = await this.sms.send({
      e164: normalized.e164,
      body: this.renderTrSmsBody(code),
      challengeId,
    });

    await this.prisma.db.otpDeliveryAttempt.create({
      data: {
        id: randomUUID(),
        challengeId,
        challengeIdSnapshot: challengeId,
        adapter: sendResult.adapter,
        result: sendResult.ok ? 'sent' : 'failed',
        providerMessageId: sendResult.providerMessageId ?? null,
      },
    });

    if (!sendResult.ok) {
      await this.prisma.db.otpChallenge.update({
        where: { id: challengeId },
        data: { deliveryState: OtpDeliveryState.failed },
      });
      throwSmsUnavailable();
    }

    await this.prisma.db.otpChallenge.update({
      where: { id: challengeId },
      data: {
        deliveryState: OtpDeliveryState.sent,
        lastSentAt: new Date(),
        sendCount: { increment: 1 },
      },
    });

    return {
      challenge_id: challengeId,
      expires_in: OTP_TTL_SECONDS,
      resend_after: OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  async verify(req: Request, input: PhoneVerifyInput): Promise<TokenPair> {
    if (!/^[0-9]{6}$/.test(input.code)) {
      throwInvalidRequest('Invalid request');
    }
    const ip = clientIp(req);
    await this.abuse.assertAndIncrementVerifyIp(ip);

    type VerifyOutcome =
      | { kind: 'ok'; minted: { sessionId: string; parentId: string; refreshToken: string } }
      | { kind: 'invalid' }
      | { kind: 'locked' };

    const outcome = await this.prisma.db.$transaction(
      async (tx): Promise<VerifyOutcome> => {
        const locked = await tx.$queryRaw<
          Array<{
            id: string;
            subject_key: string;
            code_hash: string;
            status: OtpChallengeStatus;
            attempt_count: number;
            expires_at: Date;
            notice_version: string;
            notice_locale: string;
            notice_presented_at: Date;
            presentation_surface: string | null;
          }>
        >`
          SELECT id, subject_key, code_hash, status, attempt_count, expires_at,
                 notice_version, notice_locale, notice_presented_at, presentation_surface
          FROM otp_challenges
          WHERE id = ${input.challengeId}::uuid
          FOR UPDATE
        `;
        if (locked.length === 0) {
          return { kind: 'invalid' };
        }
        const row = locked[0];

        // Authoritative time after lock (ADR-020 §11).
        const clock = await tx.$queryRaw<Array<{ now: Date }>>`
          SELECT clock_timestamp() AS now
        `;
        const now = clock[0]?.now ?? new Date();

        if (row.status !== OtpChallengeStatus.pending) {
          return { kind: 'invalid' };
        }
        if (row.expires_at <= now) {
          await tx.otpChallenge.update({
            where: { id: row.id },
            data: { status: OtpChallengeStatus.expired },
          });
          return { kind: 'invalid' };
        }

        const ok = verifyOtpCode(
          this.otpPepper(),
          row.id,
          row.subject_key,
          input.code,
          row.code_hash,
        );
        if (!ok) {
          const nextAttempts = row.attempt_count + 1;
          await tx.otpChallenge.update({
            where: { id: row.id },
            data: {
              attemptCount: nextAttempts,
              status:
                nextAttempts >= OTP_MAX_WRONG_ATTEMPTS
                  ? OtpChallengeStatus.locked
                  : OtpChallengeStatus.pending,
            },
          });
          return nextAttempts >= OTP_MAX_WRONG_ATTEMPTS
            ? { kind: 'locked' }
            : { kind: 'invalid' };
        }

        const parentId = await this.resolveOrCreateParentTx(tx, {
          subjectKey: row.subject_key,
          noticeVersion: row.notice_version,
          noticeLocale: row.notice_locale,
          noticePresentedAt: row.notice_presented_at,
          presentationSurface: row.presentation_surface,
          now,
        });

        await tx.otpChallenge.update({
          where: { id: row.id },
          data: {
            status: OtpChallengeStatus.consumed,
            consumedAt: now,
            codeHash: '', // scrub after consume
          },
        });

        const minted = await this.sessions.mintSessionTx(tx, {
          parentId,
          deviceId: input.deviceId ?? null,
          clientSurface: input.clientSurface ?? null,
          userAgentSummary: input.userAgentSummary ?? null,
        });
        return { kind: 'ok', minted };
      },
    );

    if (outcome.kind !== 'ok') {
      throwOtpInvalid();
    }
    // Post-commit JWT sign — no DB rollback if this fails (ADR-020 §9.4).
    return this.sessions.signTokenPair(outcome.minted);
  }

  private async resolveOrCreateParentTx(
    tx: TxClient,
    args: {
      subjectKey: string;
      noticeVersion: string;
      noticeLocale: string;
      noticePresentedAt: Date;
      presentationSurface: string | null;
      now: Date;
    },
  ): Promise<string> {
    const existing = await tx.parentIdentity.findFirst({
      where: {
        provider: PHONE_PROVIDER,
        providerSubject: args.subjectKey,
        unlinkedAt: null,
      },
      include: { parent: true },
    });

    if (existing) {
      if (
        existing.parent.deletedAt ||
        existing.parent.lifecycle !== ParentAccountLifecycle.active
      ) {
        throwOtpInvalid();
      }
      return existing.parentId;
    }

    // U7 Option A — create parent + phone identity + notice evidence.
    const parentId = randomUUID();
    await tx.parentAccount.create({
      data: {
        id: parentId,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
    });
    await tx.parentIdentity.create({
      data: {
        id: randomUUID(),
        parentId,
        provider: PHONE_PROVIDER,
        providerSubject: args.subjectKey,
        verifiedContact: null,
        verifiedAt: args.now,
      },
    });
    await tx.privacyNoticeAcknowledgment.create({
      data: {
        id: randomUUID(),
        parentId,
        noticeVersion: args.noticeVersion,
        locale: args.noticeLocale,
        presentedAt: args.noticePresentedAt,
        acknowledgedAt: args.now,
        surface: args.presentationSurface ?? 'phone_start',
      },
    });
    return parentId;
  }
}
