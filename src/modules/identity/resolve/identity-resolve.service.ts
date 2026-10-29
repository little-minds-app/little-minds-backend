import { Injectable, Logger } from '@nestjs/common';
import { ParentAccountLifecycle, type Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { throwOtpInvalid, throwUnauthorized } from '../session/auth.errors';

type TxClient = Prisma.TransactionClient;

export type ResolveIdentityInput = {
  provider: string;
  providerSubject: string;
  /** Optional minimized verified contact (never merge key). */
  verifiedContact?: string | null;
  noticeVersion: string;
  noticeLocale: string;
  noticePresentedAt: Date;
  presentationSurface: string | null;
  now: Date;
  /**
   * When true, map non-active / missing to otp_invalid (email OTP).
   * When false, map to invalid_token (Apple/Google).
   */
  otpStyleErrors?: boolean;
};

/**
 * U7 Option A identity resolve/create (ADR-021 §8).
 * No silent cross-provider merge / email link (LMP-36 owns linking).
 *
 * P1 race-safety: `pg_advisory_xact_lock` on (provider, subject) serializes
 * concurrent first-time creates so exactly one canonical parent wins.
 * All creates share the outer txn — failure rolls back (no orphan parent /
 * notice / identity). Unique violations map to uniform auth errors (no raw DB).
 */
@Injectable()
export class IdentityResolveService {
  private readonly logger = new Logger(IdentityResolveService.name);

  private subjectLockKey(provider: string, subject: string): number {
    const digest = createHash('sha256')
      .update(`identity:${provider}:${subject}`)
      .digest();
    return digest.readInt32BE(0);
  }

  private failAuth(otpStyle?: boolean): never {
    if (otpStyle) {
      throwOtpInvalid();
    }
    throwUnauthorized('invalid_token', 'Invalid token');
  }

  async resolveOrCreateParentTx(
    tx: TxClient,
    args: ResolveIdentityInput,
  ): Promise<string> {
    const lockKey = this.subjectLockKey(args.provider, args.providerSubject);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

    const existing = await tx.parentIdentity.findFirst({
      where: {
        provider: args.provider,
        providerSubject: args.providerSubject,
        unlinkedAt: null,
      },
      include: { parent: true },
    });

    if (existing) {
      if (
        existing.parent.deletedAt ||
        existing.parent.lifecycle !== ParentAccountLifecycle.active
      ) {
        this.failAuth(args.otpStyleErrors);
      }
      return existing.parentId;
    }

    // Unlinked historical row still occupies unique (provider, subject) —
    // do not silently relink (LMP-36). Uniform auth failure.
    const anyRow = await tx.parentIdentity.findFirst({
      where: {
        provider: args.provider,
        providerSubject: args.providerSubject,
      },
      select: { id: true },
    });
    if (anyRow) {
      this.failAuth(args.otpStyleErrors);
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
          provider: args.provider,
          providerSubject: args.providerSubject,
          verifiedContact: args.verifiedContact ?? null,
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
          surface: args.presentationSurface ?? `${args.provider}_auth`,
        },
      });
      return parentId;
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code?: string }).code
          : undefined;
      // Never leak Prisma / PG details. Outer txn rolls back partial creates.
      this.logger.warn(
        `identity_resolve_create_failed code=${code ?? 'unknown'}`,
      );
      this.failAuth(args.otpStyleErrors);
    }
  }
}
