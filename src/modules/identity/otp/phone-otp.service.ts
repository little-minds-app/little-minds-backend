import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
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
import { isAcceptablePrivacyNoticePair } from './privacy-notice.catalog';
import { isUuidV4OrV7 } from './otp-uuid';
import {
  OTP_MAX_WRONG_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_STALE_PENDING_SEND_MS,
  OTP_TTL_SECONDS,
  PHONE_PROVIDER,
} from './otp.constants';
import { identitySubjectLockKey } from '../resolve/identity-subject-lock';

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
 * Ambiguous SMS send / verify policy (ADR-020):
 * - Challenge is committed **before** SMS (locks not held during send).
 * - Adapter throw/fail → delivery_attempt=failed, challenge superseded/failed,
 *   HTTP `503 sms_unavailable` (no OTP leak).
 * - Adapter accept but post-send persistence fails → **no auto-resend** /
 *   no duplicate billable send; challenge may stay `pending_send`; HTTP
 *   `503 sms_unavailable`. Stale `pending_send` is superseded after
 *   `OTP_STALE_PENDING_SEND_MS` so a **new** start can proceed.
 * - Verify is allowed only when `status=pending` **and** `deliveryState=sent`
 *   (durable SMS acceptance). `pending_send` / `failed` → uniform `otp_invalid`.
 * - Lost HTTP after successful mark-sent: clients honor cooldown / new start;
 *   do not assume the code was never issued. Handset delivery is not confirmed.
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
    const appEnv = this.config.get('APP_ENV', { infer: true });
    // Exact catalog pair; staging/prod require THAT entry published (anti-enum).
    if (!isAcceptablePrivacyNoticePair(version, locale, appEnv)) {
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
        const clock = await tx.$queryRaw<Array<{ now: Date }>>`
          SELECT clock_timestamp() AS now
        `;
        const dbNow = clock[0]?.now ?? now;
        const inFlight =
          pending.deliveryState === OtpDeliveryState.pending_send ||
          !pending.lastSentAt;

        if (inFlight) {
          // Mid-SMS or post-send persistence gap — never auto-resend.
          // Fresh in-flight → cooldown; stale pending_send → free the slot.
          const ageMs = dbNow.getTime() - pending.createdAt.getTime();
          if (ageMs < OTP_STALE_PENDING_SEND_MS) {
            throwOtpCooldown();
          }
        } else {
          const elapsed = dbNow.getTime() - pending.lastSentAt!.getTime();
          if (elapsed < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
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

    // SMS outside the advisory-lock txn (never hold long locks across adapter I/O).
    const sendResult = await this.safeSendSms({
      e164: normalized.e164,
      body: this.renderTrSmsBody(code),
      challengeId,
    });

    if (!sendResult.ok) {
      await this.persistFailedDelivery(challengeId, sendResult);
      throwSmsUnavailable();
    }

    // Adapter accepted — persist durable acceptance. Never auto-resend on failure.
    await this.persistSuccessfulDelivery(challengeId, sendResult);

    return {
      challenge_id: challengeId,
      expires_in: OTP_TTL_SECONDS,
      resend_after: OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  /** Adapter failure path — free pending slot; no OTP/PII in logs. */
  private async persistFailedDelivery(
    challengeId: string,
    sendResult: SmsSendResult,
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
        `otp_delivery_attempt_persist_failed challenge=${challengeId} result=failed`,
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
        `otp_challenge_fail_mark_failed challenge=${challengeId}`,
      );
    }
  }

  /**
   * Durable SMS acceptance: delivery_attempt=sent + deliveryState=sent.
   * On persistence errors after adapter accept: **do not** call SMS again
   * (no duplicate billable send). Leave/repair without authorizing verify
   * until `deliveryState=sent`. Caller maps failures to `sms_unavailable`.
   */
  private async persistSuccessfulDelivery(
    challengeId: string,
    sendResult: SmsSendResult,
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
        `otp_delivery_attempt_persist_failed challenge=${challengeId} result=sent`,
      );
      // SMS may already be billable — never resend. Challenge stays pending_send
      // until stale timeout; verify remains unauthorized.
      throwSmsUnavailable();
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
          `otp_mark_sent_skipped challenge=${challengeId} count=${marked.count}`,
        );
        throwSmsUnavailable();
      }
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 503) {
        throw err;
      }
      // Mark-sent failed after adapter accept — no resend; pending_send + stale path.
      this.logger.warn(`otp_mark_sent_failed challenge=${challengeId}`);
      throwSmsUnavailable();
    }
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

  /** LMP-36 — consume phone OTP and return subject for explicit linking (own txn). */
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
    await this.abuse.assertAndIncrementVerifyIp(ip);

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
      if (row.provider !== PHONE_PROVIDER) {
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
              nextAttempts >= OTP_MAX_WRONG_ATTEMPTS
                ? OtpChallengeStatus.locked
                : OtpChallengeStatus.pending,
          },
        });
        return nextAttempts >= OTP_MAX_WRONG_ATTEMPTS
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
        // Durable SMS acceptance only — pending_send/failed never authorize verify.
        // Uniform otp_invalid (no delivery-state oracle / no OTP exposure).
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

  /**
   * Identity resolve/create under the shared `identity:provider:subject`
   * advisory lock (same family as LMP-35 resolve + LMP-36 link) so concurrent
   * GSM verify vs explicit link cannot create duplicate parents for one phone.
   */
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
    const lockKey = identitySubjectLockKey(PHONE_PROVIDER, args.subjectKey);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

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

    // Unlinked historical row still occupies unique (provider, subject) —
    // do not silently relink (LMP-36). Uniform otp_invalid.
    const anyRow = await tx.parentIdentity.findFirst({
      where: {
        provider: PHONE_PROVIDER,
        providerSubject: args.subjectKey,
      },
      select: { id: true },
    });
    if (anyRow) {
      throwOtpInvalid();
    }

    const parentId = randomUUID();
    try {
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
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code?: string }).code
          : undefined;
      this.logger.warn(
        `phone_identity_create_failed code=${code ?? 'unknown'}`,
      );
      throwOtpInvalid();
    }
  }
}
