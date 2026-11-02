import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
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
  throwInvalidRequest,
  throwUnauthorized,
} from '../session/auth.errors';
import { AuthRateLimitService } from '../session/auth-rate-limit.service';
import { SessionIssuerService } from '../session/session-issuer.service';
import type { LinkableProvider } from './account-linking.constants';
import {
  STEP_UP_PURPOSE_PARENT_GATE,
  STEP_UP_PURPOSE_IDENTITY_LINK,
  STEP_UP_TTL_SECONDS,
} from './step-up.constants';

export type StepUpProofInput = {
  parentId: string;
  sessionId: string;
  provider: LinkableProvider;
  idToken?: string | null;
  nonce?: string | null;
  authorizationCode?: string | null;
  codeVerifier?: string | null;
  redirectUri?: string | null;
  oauthState?: string | null;
  challengeId?: string | null;
  code?: string | null;
};

export type StepUpIssueResult = {
  step_up_token: string;
  expires_in: typeof STEP_UP_TTL_SECONDS;
  purpose: typeof STEP_UP_PURPOSE_IDENTITY_LINK | typeof STEP_UP_PURPOSE_PARENT_GATE;
};

/**
 * Server-issued recent-auth / step-up (LMP-36 P1).
 *
 * Proves control of an identity **already linked** to the authenticated parent,
 * then issues an opaque one-time token bound to parent + session + purpose
 * `identity_link` with short TTL. Access-token refresh alone is NOT sufficient.
 * Pattern mirrors ADR-021 oauth_state / OIDC nonce (hashed, single-use, fail-closed).
 */
@Injectable()
export class StepUpService {
  private readonly logger = new Logger(StepUpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly sessions: SessionIssuerService,
    private readonly apple: AppleIdentityService,
    private readonly google: GoogleIdentityService,
    private readonly emailOtp: EmailOtpService,
    private readonly phoneOtp: PhoneOtpService,
  ) {}

  static hashToken(plaintext: string): string {
    return createHash('sha256').update(plaintext, 'utf8').digest('hex');
  }

  async issueForIdentityLink(
    req: Request,
    input: StepUpProofInput,
  ): Promise<StepUpIssueResult> {
    return this.issueForPurpose(req, input, STEP_UP_PURPOSE_IDENTITY_LINK);
  }

  issueForParentGate(req: Request, input: StepUpProofInput): Promise<StepUpIssueResult> {
    return this.issueForPurpose(req, input, STEP_UP_PURPOSE_PARENT_GATE);
  }

  private async issueForPurpose(
    req: Request,
    input: StepUpProofInput,
    purpose: typeof STEP_UP_PURPOSE_IDENTITY_LINK | typeof STEP_UP_PURPOSE_PARENT_GATE,
  ): Promise<StepUpIssueResult> {
    const ip = clientIp(req);
    this.rateLimit.consumeStepUpIp(ip);
    this.rateLimit.consumeStepUpParent(input.parentId);

    // Session must still be active (revoked/expired → fail closed).
    await this.sessions.requireActiveSession(input.sessionId, input.parentId);

    const { provider, providerSubject } = await this.verifyExistingIdentityProof(
      req,
      input,
    );

    const owned = await this.prisma.db.parentIdentity.findFirst({
      where: {
        parentId: input.parentId,
        provider,
        providerSubject,
        unlinkedAt: null,
      },
      select: { id: true },
    });
    if (!owned) {
      // Uniform failure — do not disclose whether subject exists on another parent.
      this.logger.warn(
        `step_up_proof_not_owned provider=${provider}`,
      );
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    const plaintext = `lms1.${randomBytes(32).toString('base64url')}`;
    const tokenHash = StepUpService.hashToken(plaintext);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + STEP_UP_TTL_SECONDS * 1000);

    await this.prisma.db.authStepUpChallenge.create({
      data: {
        id: randomUUID(),
        tokenHash,
        parentId: input.parentId,
        sessionId: input.sessionId,
        purpose,
        provider,
        expiresAt,
      },
    });

    return {
      step_up_token: plaintext,
      expires_in: STEP_UP_TTL_SECONDS,
      purpose,
    };
  }

  /**
   * Atomically consume a step-up token for identity_link.
   * Binds parent + session + purpose; rejects stale / replayed / cross-parent.
   * Call inside the link transaction (or immediately before) so replay fails closed.
   */
  async consumeIdentityLinkTx(
    tx: Prisma.TransactionClient,
    args: {
      stepUpToken: string;
      parentId: string;
      sessionId: string;
    },
  ): Promise<void> {
    return this.consumePurposeTx(tx, args, STEP_UP_PURPOSE_IDENTITY_LINK);
  }

  consumeParentGateTx(tx: Prisma.TransactionClient, args: {
    stepUpToken: string;
    parentId: string;
    sessionId: string;
  }): Promise<void> {
    return this.consumePurposeTx(tx, args, STEP_UP_PURPOSE_PARENT_GATE);
  }

  private async consumePurposeTx(
    tx: Prisma.TransactionClient,
    args: { stepUpToken: string; parentId: string; sessionId: string },
    purpose: typeof STEP_UP_PURPOSE_IDENTITY_LINK | typeof STEP_UP_PURPOSE_PARENT_GATE,
  ): Promise<void> {
    if (
      typeof args.stepUpToken !== 'string' ||
      args.stepUpToken.length < 16
    ) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }
    const tokenHash = StepUpService.hashToken(args.stepUpToken);
    const clock = await tx.$queryRaw<Array<{ now: Date }>>`
      SELECT clock_timestamp() AS now
    `;
    const now = clock[0]?.now ?? new Date();

    const updated = await tx.$queryRaw<Array<{ id: string }>>`
      UPDATE auth_step_up_challenges
      SET consumed_at = ${now}
      WHERE token_hash = ${tokenHash}
        AND parent_id = ${args.parentId}::uuid
        AND session_id = ${args.sessionId}::uuid
        AND purpose = ${purpose}
        AND consumed_at IS NULL
        AND expires_at > ${now}
      RETURNING id
    `;
    if (updated.length !== 1) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }
  }

  private async verifyExistingIdentityProof(
    req: Request,
    input: StepUpProofInput,
  ): Promise<{ provider: string; providerSubject: string }> {
    switch (input.provider) {
      case 'apple': {
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
        return { provider: APPLE_PROVIDER, providerSubject: verified.sub };
      }
      case 'google': {
        const verified = await this.google.verifyProofForLink({
          idToken: input.idToken,
          nonce: input.nonce,
          authorizationCode: input.authorizationCode,
          codeVerifier: input.codeVerifier,
          redirectUri: input.redirectUri,
          oauthState: input.oauthState,
        });
        return { provider: GOOGLE_PROVIDER, providerSubject: verified.sub };
      }
      case 'email': {
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
        return { provider: EMAIL_PROVIDER, providerSubject: subject };
      }
      case 'phone': {
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
        return { provider: PHONE_PROVIDER, providerSubject: subject };
      }
      default:
        throwInvalidRequest('Invalid request');
    }
  }
}
