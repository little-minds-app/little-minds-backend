import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpChallengeStatus, OtpDeliveryState } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
import {
  MAIL_SENDER,
  type MailSendResult,
  type MailSender,
} from '../mail/mail-sender';
import { IdentityResolveService } from '../resolve/identity-resolve.service';
import {
  throwInvalidRequest,
  throwMailUnavailable,
  throwOtpCooldown,
  throwOtpInvalid,
} from '../session/auth.errors';
import {
  SessionIssuerService,
  type TokenPair,
} from '../session/session-issuer.service';
import { OtpAbuseService } from './otp-abuse.service';
import { generateOtpCode, hashOtpCode, verifyOtpCode } from './otp-crypto';
import { emailSubjectKey, normalizeEmailV1 } from './email-norm';
import { isAcceptablePrivacyNoticePair } from './privacy-notice.catalog';
import { isUuidV4OrV7 } from './otp-uuid';
import { OTP_STALE_PENDING_SEND_MS } from './otp.constants';
import {
  EMAIL_OTP_MAX_WRONG_ATTEMPTS,
  EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
  EMAIL_OTP_TTL_SECONDS,
  EMAIL_PROVIDER,
} from './multi-provider.constants';

export type EmailStartInput = {
  email: string;
  noticeVersion: string;
  noticeLocale: string;
  clientSurface?: string | null;
};

export type EmailStartResult = {
  challenge_id: string;
  expires_in: typeof EMAIL_OTP_TTL_SECONDS;
  resend_after: typeof EMAIL_OTP_RESEND_COOLDOWN_SECONDS;
};

export type EmailVerifyInput = {
  challengeId: string;
  code: string;
  clientSurface?: string | null;
  deviceId?: string | null;
  userAgentSummary?: string | null;
};

/**
 * Email OTP (ADR-021 §7): LM-owned OTP + MailSender delivery-only.
 * Verify only when status=pending AND deliveryState=sent.
 */
@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionIssuerService,
    private readonly abuse: OtpAbuseService,
    private readonly resolve: IdentityResolveService,
    private readonly config: ConfigService<AppEnv, true>,
    @Inject(MAIL_SENDER) private readonly mail: MailSender,
  ) {}

  private otpPepper(): string {
    const pepper = this.config.get('OTP_PEPPER', { infer: true });
    if (!pepper || pepper.length < 16) {
      throw new Error('OTP_PEPPER must be set (≥16 chars)');
    }
    return pepper;
  }

  private emailPepper(): string {
    const pepper = this.config.get('EMAIL_SUBJECT_PEPPER', { infer: true });
    if (!pepper || pepper.length < 16) {
      throw new Error('EMAIL_SUBJECT_PEPPER must be set (≥16 chars)');
    }
    return pepper;
  }

  private assertNotice(version: string, locale: string): void {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    if (!isAcceptablePrivacyNoticePair(version, locale, appEnv)) {
      throwInvalidRequest('Invalid request');
    }
  }

  private subjectLockKey(subjectKey: string): number {
    const digest = createHash('sha256')
      .update(`${EMAIL_PROVIDER}:${subjectKey}`)
      .digest();
    return digest.readInt32BE(0);
  }

  private renderEmailBody(code: string): string {
    return `Little Minds dogrulama kodu: ${code}. ${EMAIL_OTP_TTL_SECONDS / 60} dk gecerli.`;
  }

  async start(req: Request, input: EmailStartInput): Promise<EmailStartResult> {
    const normalized = normalizeEmailV1(input.email);
    if (!normalized.ok) {
      throwInvalidRequest('Invalid request');
    }
    this.assertNotice(input.noticeVersion, input.noticeLocale);

    const subjectKey = emailSubjectKey(normalized.canonical, this.emailPepper());
    const ip = clientIp(req);
    const challengeId = randomUUID();
    // Local fake-mail manual UAT only. Never fix OTP codes for real mail or non-dev environments.
    const code = this.config.get('APP_ENV', { infer: true }) === 'development' &&
      this.config.get('MAIL_SENDER', { infer: true }) === 'fake' &&
      process.env.LM_DEV_FIXED_OTP === '123456'
      ? '123456' : generateOtpCode();
    const codeHash = hashOtpCode(
      this.otpPepper(),
      challengeId,
      subjectKey,
      code,
    );
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EMAIL_OTP_TTL_SECONDS * 1000);
    const lockKey = this.subjectLockKey(subjectKey);

    await this.prisma.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;
      await this.abuse.assertAndIncrementEmail({ subjectKey, ip, tx });

      const pending = await tx.otpChallenge.findFirst({
        where: {
          provider: EMAIL_PROVIDER,
          subjectKey,
          status: OtpChallengeStatus.pending,
        },
      });
      if (pending) {
        const clock = await tx.$queryRaw<Array<{ now: Date }>>`
          SELECT clock_timestamp() AS now
        `;
        const dbNow = clock[0]?.now ?? now;
        const inFlight =
          pending.deliveryState === OtpDeliveryState.pending_send ||
          !pending.lastSentAt;

        if (inFlight) {
          const ageMs = dbNow.getTime() - pending.createdAt.getTime();
          if (ageMs < OTP_STALE_PENDING_SEND_MS) {
            throwOtpCooldown();
          }
        } else {
          const elapsed = dbNow.getTime() - pending.lastSentAt!.getTime();
          if (elapsed < EMAIL_OTP_RESEND_COOLDOWN_SECONDS * 1000) {
            throwOtpCooldown();
          }
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
            provider: EMAIL_PROVIDER,
            subjectKey,
            codeHash,
            status: OtpChallengeStatus.pending,
            deliveryState: OtpDeliveryState.pending_send,
            attemptCount: 0,
            sendCount: 0,
            expiresAt,
            noticeVersion: input.noticeVersion,
            noticeLocale: input.noticeLocale,
            noticePresentedAt: now,
            presentationSurface: input.clientSurface ?? null,
          },
        });
      } catch (err) {
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

    const sendResult = await this.safeSendMail({
      to: normalized.canonical,
      body: this.renderEmailBody(code),
      challengeId,
    });

    if (!sendResult.ok) {
      await this.persistFailedDelivery(challengeId, sendResult);
      throwMailUnavailable();
    }

    await this.persistSuccessfulDelivery(challengeId, sendResult);

    return {
      challenge_id: challengeId,
      expires_in: EMAIL_OTP_TTL_SECONDS,
      resend_after: EMAIL_OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  private async persistFailedDelivery(
    challengeId: string,
    sendResult: MailSendResult,
  ): Promise<void> {
    try {
      await this.prisma.db.otpDeliveryAttempt.create({
        data: {
          id: randomUUID(),
          challengeId,
          challengeIdSnapshot: challengeId,
          adapter: sendResult.adapter,
          result: 'failed',
          providerMessageId: sendResult.providerMessageId ?? null,
        },
      });
    } catch {
      this.logger.warn(
        `email_delivery_attempt_persist_failed challenge=${challengeId} result=failed`,
      );
    }
    try {
      await this.prisma.db.otpChallenge.update({
        where: { id: challengeId },
        data: {
          status: OtpChallengeStatus.superseded,
          deliveryState: OtpDeliveryState.failed,
        },
      });
    } catch {
      this.logger.warn(
        `email_challenge_fail_mark_failed challenge=${challengeId}`,
      );
    }
  }

  private async persistSuccessfulDelivery(
    challengeId: string,
    sendResult: MailSendResult,
  ): Promise<void> {
    try {
      await this.prisma.db.otpDeliveryAttempt.create({
        data: {
          id: randomUUID(),
          challengeId,
          challengeIdSnapshot: challengeId,
          adapter: sendResult.adapter,
          result: 'sent',
          providerMessageId: sendResult.providerMessageId ?? null,
        },
      });
    } catch {
      this.logger.warn(
        `email_delivery_attempt_persist_failed challenge=${challengeId} result=sent`,
      );
      throwMailUnavailable();
    }

    try {
      const marked = await this.prisma.db.otpChallenge.updateMany({
        where: { id: challengeId, status: OtpChallengeStatus.pending },
        data: {
          deliveryState: OtpDeliveryState.sent,
          lastSentAt: new Date(),
          sendCount: { increment: 1 },
        },
      });
      if (marked.count !== 1) {
        this.logger.warn(
          `email_mark_sent_skipped challenge=${challengeId} count=${marked.count}`,
        );
        throwMailUnavailable();
      }
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 503) {
        throw err;
      }
      this.logger.warn(`email_mark_sent_failed challenge=${challengeId}`);
      throwMailUnavailable();
    }
  }

  private async safeSendMail(input: {
    to: string;
    body: string;
    challengeId: string;
  }): Promise<MailSendResult> {
    try {
      return await this.mail.send({
        to: input.to,
        subject: 'Little Minds dogrulama',
        body: input.body,
        challengeId: input.challengeId,
      });
    } catch {
      this.logger.warn(
        `mail_adapter_error adapter=${this.mail.adapterName} challenge=${input.challengeId}`,
      );
      return {
        ok: false,
        adapter: this.mail.adapterName,
        errorCode: 'adapter_error',
      };
    }
  }

  /** LMP-36 — consume email OTP and return subject for explicit linking (own txn). */
  async consumeVerifiedSubjectForLink(
    req: Request,
    input: { challengeId: string; code: string },
  ): Promise<string> {
    if (!/^[0-9]{6}$/.test(input.code)) {
      throwInvalidRequest('Invalid request');
    }
    if (!isUuidV4OrV7(input.challengeId)) {
      throwOtpInvalid();
    }

    const ip = clientIp(req);
    await this.abuse.assertAndIncrementEmailVerifyIp(ip);

    const outcome = await this.prisma.db.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<
        Array<{
          id: string;
          provider: string;
          subject_key: string;
          code_hash: string;
          status: OtpChallengeStatus;
          delivery_state: OtpDeliveryState;
          attempt_count: number;
          expires_at: Date;
        }>
      >`
        SELECT id, provider, subject_key, code_hash, status, delivery_state,
               attempt_count, expires_at
        FROM otp_challenges
        WHERE id = ${input.challengeId}::uuid
        FOR UPDATE
      `;
      if (locked.length === 0) {
        return { kind: 'invalid' as const };
      }
      const row = locked[0];
      if (row.provider !== EMAIL_PROVIDER) {
        return { kind: 'invalid' as const };
      }
      const clock = await tx.$queryRaw<Array<{ now: Date }>>`
        SELECT clock_timestamp() AS now
      `;
      const now = clock[0]?.now ?? new Date();
      if (row.status !== OtpChallengeStatus.pending) {
        return { kind: 'invalid' as const };
      }
      if (row.delivery_state !== OtpDeliveryState.sent) {
        return { kind: 'invalid' as const };
      }
      if (row.expires_at <= now) {
        await tx.otpChallenge.update({
          where: { id: row.id },
          data: { status: OtpChallengeStatus.expired },
        });
        return { kind: 'invalid' as const };
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
              nextAttempts >= EMAIL_OTP_MAX_WRONG_ATTEMPTS
                ? OtpChallengeStatus.locked
                : OtpChallengeStatus.pending,
          },
        });
        return nextAttempts >= EMAIL_OTP_MAX_WRONG_ATTEMPTS
          ? { kind: 'locked' as const }
          : { kind: 'invalid' as const };
      }
      await tx.otpChallenge.update({
        where: { id: row.id },
        data: {
          status: OtpChallengeStatus.consumed,
          consumedAt: now,
          codeHash: '',
        },
      });
      return { kind: 'ok' as const, subjectKey: row.subject_key };
    });

    if (outcome.kind !== 'ok') {
      throwOtpInvalid();
    }
    return outcome.subjectKey;
  }

  async verify(req: Request, input: EmailVerifyInput): Promise<TokenPair> {
    if (!/^[0-9]{6}$/.test(input.code)) {
      throwInvalidRequest('Invalid request');
    }
    if (!isUuidV4OrV7(input.challengeId)) {
      throwOtpInvalid();
    }

    const ip = clientIp(req);
    await this.abuse.assertAndIncrementEmailVerifyIp(ip);

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
            delivery_state: OtpDeliveryState;
            attempt_count: number;
            expires_at: Date;
            notice_version: string;
            notice_locale: string;
            notice_presented_at: Date;
            presentation_surface: string | null;
          }>
        >`
          SELECT id, subject_key, code_hash, status, delivery_state, attempt_count,
                 expires_at, notice_version, notice_locale, notice_presented_at,
                 presentation_surface
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
        if (row.delivery_state !== OtpDeliveryState.sent) {
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
                nextAttempts >= EMAIL_OTP_MAX_WRONG_ATTEMPTS
                  ? OtpChallengeStatus.locked
                  : OtpChallengeStatus.pending,
            },
          });
          return nextAttempts >= EMAIL_OTP_MAX_WRONG_ATTEMPTS
            ? { kind: 'locked' }
            : { kind: 'invalid' };
        }

        const parentId = await this.resolve.resolveOrCreateParentTx(tx, {
          provider: EMAIL_PROVIDER,
          providerSubject: row.subject_key,
          verifiedContact: null,
          noticeVersion: row.notice_version,
          noticeLocale: row.notice_locale,
          noticePresentedAt: row.notice_presented_at,
          presentationSurface: row.presentation_surface,
          now,
          otpStyleErrors: true,
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

}
