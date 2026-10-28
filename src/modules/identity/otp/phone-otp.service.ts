import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OtpChallengeStatus,
  OtpDeliveryState,
  ParentAccountLifecycle,
  type Prisma,
} from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
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
import {
  SMS_SENDER,
  type SmsSendResult,
  type SmsSender,
} from '../sms/sms-sender';
import { OtpAbuseService } from './otp-abuse.service';
import {
  generateOtpCode,
  hashOtpCode,
  phoneSubjectKey,
  verifyOtpCode,
} from './otp-crypto';
import { normalizeTrMobileE164 } from './phone-normalize';
import { isActivePrivacyNoticePair } from './privacy-notice.catalog';
import { isUuidV4OrV7 } from './otp-uuid';
import {
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

/**
 * Ambiguous SMS send policy (ADR-020):
 * - Challenge is committed **before** SMS (locks not held during send).
 * - If the adapter throws or returns failure → delivery_attempt=failed,
 *   challenge delivery_state=failed, HTTP `503 sms_unavailable`.
 * - If send succeeds but the HTTP response is lost, the challenge may still
 *   be pending/sent; clients must honor cooldown / start a new challenge
 *   rather than assuming the code was never issued.
 */
@Injectable()
export class PhoneOtpService {
  private readonly logger = new Logger(PhoneOtpService.name);

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
    if (!isActivePrivacyNoticePair(version, locale)) {
      // Uniform invalid_request — same shape for all callers (U12 / Option A).
      throwInvalidRequest('Invalid request');
    }
  }

  private renderTrSmsBody(code: string): string {
    // Vendor-neutral TR template (U11). Never log the body with code.
    return `Little Minds dogrulama kodu: ${code}. ${OTP_TTL_SECONDS / 60} dk gecerli.`;
  }

  /** Stable advisory lock key for (provider, subject) — replica-safe via PG. */
  private subjectLockKey(subjectKey: string): number {
    const digest = createHash('sha256')
      .update(`${PHONE_PROVIDER}:${subjectKey}`)
      .digest();
    // Signed 32-bit int for pg_advisory_xact_lock(int4)
    return digest.readInt32BE(0);
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
    const lockKey = this.subjectLockKey(subjectKey);

    // Persist challenge + abuse counters under advisory lock; SMS outside txn.
    await this.prisma.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

      await this.abuse.assertAndIncrementSms({ subjectKey, ip, tx });

      const pending = await tx.otpChallenge.findFirst({
        where: {
          provider: PHONE_PROVIDER,
          subjectKey,
          status: OtpChallengeStatus.pending,
        },
      });
      if (pending) {
        // In-flight send (no lastSentAt yet) or within cooldown → otp_cooldown.
        // Prevents concurrent starts from superseding mid-SMS outside the txn.
        if (!pending.lastSentAt) {
          throwOtpCooldown();
        }
        const clock = await tx.$queryRaw<Array<{ now: Date }>>`
          SELECT clock_timestamp() AS now
        `;
        const dbNow = clock[0]?.now ?? now;
        const elapsed = dbNow.getTime() - pending.lastSentAt.getTime();
        if (elapsed < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
          throwOtpCooldown();
        }
        await tx.otpChallenge.update({
          where: { id: pending.id },
          data: {
            status: OtpChallengeStatus.superseded,
            deliveryState: OtpDeliveryState.superseded,
          },
        });
      }

      try {
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
      } catch (err) {
        // Partial unique index race — treat as cooldown/conflict (generic).
        if (
          err &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code?: string }).code === 'P2002'
        ) {
          throwOtpCooldown();
        }
        throw err;
      }
    });

    const sendResult = await this.safeSendSms({
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
      // Free the pending unique slot so callers may retry after sms_unavailable
      // (abuse counters still apply). Do not leave a forever-pending row.
      await this.prisma.db.otpChallenge.update({
        where: { id: challengeId },
        data: {
          status: OtpChallengeStatus.superseded,
          deliveryState: OtpDeliveryState.failed,
        },
      });
      throwSmsUnavailable();
    }

    await this.prisma.db.otpChallenge.updateMany({
      where: { id: challengeId, status: OtpChallengeStatus.pending },
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

  /**
   * Never let adapter exceptions escape as 500s with stack/PII.
   * Persist failure path is handled by the caller.
   */
  private async safeSendSms(input: {
    e164: string;
    body: string;
    challengeId: string;
  }): Promise<SmsSendResult> {
    try {
      return await this.sms.send(input);
    } catch {
      // Do not log e164, body, or exception message (may contain OTP).
      this.logger.warn(
        `sms_adapter_error adapter=${this.sms.adapterName} challenge=${input.challengeId}`,
      );
      return {
        ok: false,
        adapter: this.sms.adapterName,
        errorCode: 'adapter_error',
      };
    }
  }

  async verify(req: Request, input: PhoneVerifyInput): Promise<TokenPair> {
    if (!/^[0-9]{6}$/.test(input.code)) {
      throwInvalidRequest('Invalid request');
    }
    // Validate UUID before `::uuid` cast — malformed → generic otp_invalid.
    if (!isUuidV4OrV7(input.challengeId)) {
      throwOtpInvalid();
    }

    const ip = clientIp(req);
    await this.abuse.assertAndIncrementVerifyIp(ip);

    type VerifyOutcome =
      | {
          kind: 'ok';
          minted: { sessionId: string; parentId: string; refreshToken: string };
        }
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
            codeHash: '',
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
