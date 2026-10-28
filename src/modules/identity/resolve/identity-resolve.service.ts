import { Injectable } from '@nestjs/common';
import { ParentAccountLifecycle, type Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
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
 */
@Injectable()
export class IdentityResolveService {
  async resolveOrCreateParentTx(
    tx: TxClient,
    args: ResolveIdentityInput,
  ): Promise<string> {
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
        if (args.otpStyleErrors) {
          throwOtpInvalid();
        }
        throwUnauthorized('invalid_token', 'Invalid token');
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
  }
}
