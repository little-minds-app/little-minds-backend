import { Injectable, Logger } from '@nestjs/common';
import {
  AccountLinkOutcome,
  ParentAccountLifecycle,
  type Prisma,
} from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
import {
  APPLE_PROVIDER,
  EMAIL_PROVIDER,
  GOOGLE_PROVIDER,
} from '../otp/multi-provider.constants';
import { PHONE_PROVIDER } from '../otp/otp.constants';
import { EmailOtpService } from '../otp/email-otp.service';
import { PhoneOtpService } from '../otp/phone-otp.service';
import { AppleIdentityService } from '../providers/apple-identity.service';
import { GoogleIdentityService } from '../providers/google-identity.service';
import {
  throwIdentityCollision,
  throwInvalidRequest,
  throwUnauthorized,
} from '../session/auth.errors';
import { AuthRateLimitService } from '../session/auth-rate-limit.service';
import { identitySubjectLockKey } from '../resolve/identity-subject-lock';
import {
  LINK_AUDIT_SUBJECT_PREFIX,
  type LinkableProvider,
} from './account-linking.constants';
import { StepUpService } from './step-up.service';

type TxClient = Prisma.TransactionClient;

export type LinkIdentityInput = {
  parentId: string;
  sessionId: string;
  /** Server-issued recent-auth token (proof of existing identity on this parent). */
  stepUpToken: string;
  provider: LinkableProvider;
  /** Apple / Google nonce path */
  idToken?: string | null;
  nonce?: string | null;
  /** Google PKCE path */
  authorizationCode?: string | null;
  codeVerifier?: string | null;
  redirectUri?: string | null;
  oauthState?: string | null;
  /** Email / phone OTP path */
  challengeId?: string | null;
  code?: string | null;
};

export type LinkIdentityResult = {
  parent_id: string;
  provider: LinkableProvider;
  identity_id: string;
  linked_at: string;
  already_linked: boolean;
};

type VerifiedProof = {
  provider: LinkableProvider;
  providerSubject: string;
  verifiedContact: string | null;
};

type LinkTxnOutcome =
  | {
      kind: 'ok';
      identityId: string;
      linkedAt: Date;
      alreadyLinked: boolean;
      outcome: AccountLinkOutcome;
    }
  | {
      kind: 'collision';
      outcome: AccountLinkOutcome;
    };

/**
 * Explicit account linking (LMP-36 / Blueprint §29.1).
 *
 * Requires:
 * 1. Active parent session
 * 2. Server-issued recent-auth / step-up (proof of an identity already on this parent)
 * 3. Fresh verified proof of the *target* provider to link
 *
 * Access-token refresh alone is NOT recent auth. Never merges by email/name/phone.
 *
 * Collision cases A–E (derived from unique `(provider, subject)` +
 * no silent merge / no silent relink):
 *   A free subject → link to authenticated parent
 *   B already linked to same parent → idempotent success
 *   C active on different parent → halt identity_collision
 *   D historical unlinked row → halt identity_collision (recovery deferred)
 *   E concurrent race / unique violation → one winner; loser collision
 *
 * Unlink + recovery ownership workflows are **deferred** (architecture review).
 */
@Injectable()
export class AccountLinkingService {
  private readonly logger = new Logger(AccountLinkingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly stepUp: StepUpService,
    private readonly apple: AppleIdentityService,
    private readonly google: GoogleIdentityService,
    private readonly emailOtp: EmailOtpService,
    private readonly phoneOtp: PhoneOtpService,
  ) {}

  private subjectAuditHash(provider: string, subject: string): string {
    return createHash('sha256')
      .update(`${LINK_AUDIT_SUBJECT_PREFIX}${provider}|${subject}`)
      .digest('hex');
  }

  async link(
    req: Request,
    input: LinkIdentityInput,
  ): Promise<LinkIdentityResult> {
    const ip = clientIp(req);
    this.rateLimit.consumeLinkIp(ip);
    this.rateLimit.consumeLinkParent(input.parentId);

    if (
      typeof input.stepUpToken !== 'string' ||
      input.stepUpToken.length < 16
    ) {
      throwInvalidRequest('Invalid request');
    }

    // Target provider proof (independent of step-up — both required).
    const proof = await this.verifyFreshProof(req, input);

    const txnOutcome = await this.prisma.db.$transaction(async (tx) => {
      // Consume step-up first (single-use); replay / cross-parent / stale → 401.
      await this.stepUp.consumeIdentityLinkTx(tx, {
        stepUpToken: input.stepUpToken,
        parentId: input.parentId,
        sessionId: input.sessionId,
      });
      return this.linkVerifiedSubjectTx(tx, {
        parentId: input.parentId,
        sessionId: input.sessionId,
        proof,
      });
    });

    if (txnOutcome.kind === 'collision') {
      this.logger.warn(
        `account_link_collision outcome=${txnOutcome.outcome} provider=${proof.provider}`,
      );
      throwIdentityCollision();
    }

    return {
      parent_id: input.parentId,
      provider: proof.provider,
      identity_id: txnOutcome.identityId,
      linked_at: txnOutcome.linkedAt.toISOString(),
      already_linked: txnOutcome.alreadyLinked,
    };
  }

  /**
   * Core link under advisory lock — used by HTTP path and concurrency tests.
   * Caller must supply already-verified `(provider, subject)` (no inference).
   */
  async linkVerifiedSubjectTx(
    tx: TxClient,
    args: {
      parentId: string;
      sessionId: string | null;
      proof: VerifiedProof;
    },
  ): Promise<LinkTxnOutcome> {
    const { parentId, sessionId, proof } = args;
    const subjectHash = this.subjectAuditHash(
      proof.provider,
      proof.providerSubject,
    );

    const parent = await tx.parentAccount.findUnique({
      where: { id: parentId },
      select: { id: true, lifecycle: true, deletedAt: true },
    });
    if (
      !parent ||
      parent.deletedAt ||
      parent.lifecycle !== ParentAccountLifecycle.active
    ) {
      await this.writeAudit(tx, {
        parentId,
        sessionId,
        provider: proof.provider,
        subjectHash,
        outcome: AccountLinkOutcome.invalid_proof,
        identityId: null,
      });
      throwUnauthorized('invalid_token', 'Parent account is not active');
    }

    const lockKey = identitySubjectLockKey(
      proof.provider,
      proof.providerSubject,
    );
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

    const existing = await tx.parentIdentity.findFirst({
      where: {
        provider: proof.provider,
        providerSubject: proof.providerSubject,
      },
    });

    // Case B — already linked to this parent (active).
    if (existing && existing.unlinkedAt === null && existing.parentId === parentId) {
      await this.writeAudit(tx, {
        parentId,
        sessionId,
        provider: proof.provider,
        subjectHash,
        outcome: AccountLinkOutcome.already_linked,
        identityId: existing.id,
      });
      return {
        kind: 'ok',
        identityId: existing.id,
        linkedAt: existing.linkedAt,
        alreadyLinked: true,
        outcome: AccountLinkOutcome.already_linked,
      };
    }

    // Case C — active on a different parent.
    if (existing && existing.unlinkedAt === null && existing.parentId !== parentId) {
      await this.writeAudit(tx, {
        parentId,
        sessionId,
        provider: proof.provider,
        subjectHash,
        outcome: AccountLinkOutcome.collision_other_parent,
        identityId: null,
      });
      return {
        kind: 'collision',
        outcome: AccountLinkOutcome.collision_other_parent,
      };
    }

    // Case D — historical unlinked row occupies unique key (no silent relink).
    if (existing && existing.unlinkedAt !== null) {
      await this.writeAudit(tx, {
        parentId,
        sessionId,
        provider: proof.provider,
        subjectHash,
        outcome: AccountLinkOutcome.collision_unlinked,
        identityId: null,
      });
      return {
        kind: 'collision',
        outcome: AccountLinkOutcome.collision_unlinked,
      };
    }

    // Case A — free subject → create identity on authenticated parent.
    const clockRows = await tx.$queryRaw<Array<{ now: Date }>>`
      SELECT clock_timestamp() AS now
    `;
    const now = clockRows[0]?.now ?? new Date();
    const identityId = randomUUID();
    try {
      await tx.parentIdentity.create({
        data: {
          id: identityId,
          parentId,
          provider: proof.provider,
          providerSubject: proof.providerSubject,
          verifiedContact: proof.verifiedContact,
          verifiedAt: now,
          linkedAt: now,
        },
      });
    } catch (err) {
      // Case E — unique race after lock (should be rare); treat as collision.
      const code =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code?: string }).code
          : undefined;
      this.logger.warn(
        `account_link_create_failed code=${code ?? 'unknown'} provider=${proof.provider}`,
      );
      await this.writeAudit(tx, {
        parentId,
        sessionId,
        provider: proof.provider,
        subjectHash,
        outcome: AccountLinkOutcome.collision_race,
        identityId: null,
      });
      return {
        kind: 'collision',
        outcome: AccountLinkOutcome.collision_race,
      };
    }

    await this.writeAudit(tx, {
      parentId,
      sessionId,
      provider: proof.provider,
      subjectHash,
      outcome: AccountLinkOutcome.linked,
      identityId,
    });

    return {
      kind: 'ok',
      identityId,
      linkedAt: now,
      alreadyLinked: false,
      outcome: AccountLinkOutcome.linked,
    };
  }

  private async writeAudit(
    tx: TxClient,
    args: {
      parentId: string;
      sessionId: string | null;
      provider: string;
      subjectHash: string;
      outcome: AccountLinkOutcome;
      identityId: string | null;
    },
  ): Promise<void> {
    await tx.accountLinkAudit.create({
      data: {
        id: randomUUID(),
        parentId: args.parentId,
        sessionId: args.sessionId,
        provider: args.provider,
        providerSubjectHash: args.subjectHash,
        outcome: args.outcome,
        identityId: args.identityId,
      },
    });
  }

  private async verifyFreshProof(
    req: Request,
    input: LinkIdentityInput,
  ): Promise<VerifiedProof> {
    switch (input.provider) {
      case 'apple':
        return this.verifyApple(input);
      case 'google':
        return this.verifyGoogle(input);
      case 'email':
        return this.verifyEmailOtp(req, input);
      case 'phone':
        return this.verifyPhoneOtp(req, input);
      default:
        throwInvalidRequest('Invalid request');
    }
  }

  private async verifyApple(input: LinkIdentityInput): Promise<VerifiedProof> {
    if (
      typeof input.idToken !== 'string' ||
      typeof input.nonce !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    const verified = await this.apple.verifyProofForLink({
      idToken: input.idToken,
      nonce: input.nonce,
    });
    return {
      provider: APPLE_PROVIDER,
      providerSubject: verified.sub,
      verifiedContact: null,
    };
  }

  private async verifyGoogle(input: LinkIdentityInput): Promise<VerifiedProof> {
    const verified = await this.google.verifyProofForLink({
      idToken: input.idToken,
      nonce: input.nonce,
      authorizationCode: input.authorizationCode,
      codeVerifier: input.codeVerifier,
      redirectUri: input.redirectUri,
      oauthState: input.oauthState,
    });
    return {
      provider: GOOGLE_PROVIDER,
      providerSubject: verified.sub,
      verifiedContact: verified.verifiedContact,
    };
  }

  private async verifyEmailOtp(
    req: Request,
    input: LinkIdentityInput,
  ): Promise<VerifiedProof> {
    if (
      typeof input.challengeId !== 'string' ||
      typeof input.code !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    const subject = await this.emailOtp.consumeVerifiedSubjectForLink(req, {
      challengeId: input.challengeId,
      code: input.code,
    });
    return {
      provider: EMAIL_PROVIDER,
      providerSubject: subject,
      verifiedContact: null,
    };
  }

  private async verifyPhoneOtp(
    req: Request,
    input: LinkIdentityInput,
  ): Promise<VerifiedProof> {
    if (
      typeof input.challengeId !== 'string' ||
      typeof input.code !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    const subject = await this.phoneOtp.consumeVerifiedSubjectForLink(req, {
      challengeId: input.challengeId,
      code: input.code,
    });
    return {
      provider: PHONE_PROVIDER,
      providerSubject: subject,
      verifiedContact: null,
    };
  }
}
