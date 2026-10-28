import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JSONWebKeySet } from 'jose';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { isAcceptablePrivacyNoticePair } from '../otp/privacy-notice.catalog';
import {
  DEFAULT_GOOGLE_ISSUERS,
  DEFAULT_GOOGLE_JWKS_URL,
  GOOGLE_PROVIDER,
} from '../otp/multi-provider.constants';
import { IdentityResolveService } from '../resolve/identity-resolve.service';
import {
  SessionIssuerService,
  type TokenPair,
} from '../session/session-issuer.service';
import {
  throwInvalidRequest,
  throwUnauthorized,
} from '../session/auth.errors';
import { verifyOidcIdToken } from './oidc-id-token';
import { OidcNonceService } from './oidc-nonce.service';
import { GooglePkceTransactionService } from './google-pkce-transaction.service';
import {
  GOOGLE_TOKEN_EXCHANGER,
  type GoogleTokenExchanger,
} from './google-token-exchanger';

export type GoogleAuthInput = {
  /** Nonce path */
  idToken?: string | null;
  nonce?: string | null;
  /** PKCE path — requires server-issued oauth_state from pkce/start */
  authorizationCode?: string | null;
  codeVerifier?: string | null;
  redirectUri?: string | null;
  oauthState?: string | null;
  noticeVersion: string;
  noticeLocale: string;
  clientSurface?: string | null;
  deviceId?: string | null;
  userAgentSummary?: string | null;
};

/**
 * Google Sign-In (ADR-021 §5):
 * - Prefer ID token + mandatory nonce (verify-before-consume)
 * - Else authorization-code + PKCE with **server-issued** one-time OAuth
 *   transaction/state bound to clientId+redirect+challenge
 * - Never accept ID-token-without-nonce (fail-closed)
 */
@Injectable()
export class GoogleIdentityService {
  private readonly logger = new Logger(GoogleIdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionIssuerService,
    private readonly resolve: IdentityResolveService,
    private readonly nonces: OidcNonceService,
    private readonly pkceTx: GooglePkceTransactionService,
    private readonly config: ConfigService<AppEnv, true>,
    @Inject(GOOGLE_TOKEN_EXCHANGER)
    private readonly exchanger: GoogleTokenExchanger,
  ) {}

  private clientIds(): string[] {
    const raw = this.config.get('GOOGLE_CLIENT_IDS', { infer: true }) as
      | string[]
      | string
      | undefined;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  private jwksConfig(): { url?: string; local?: JSONWebKeySet } {
    const localJson = this.config.get('GOOGLE_JWKS_JSON', { infer: true });
    if (localJson) {
      return { local: JSON.parse(localJson) as JSONWebKeySet };
    }
    const url =
      this.config.get('GOOGLE_JWKS_URL', { infer: true }) ??
      DEFAULT_GOOGLE_JWKS_URL;
    return { url };
  }

  private issuers(): string[] {
    const raw = this.config.get('GOOGLE_ISSUERS', { infer: true });
    if (raw && raw.length > 0) {
      return raw;
    }
    return [...DEFAULT_GOOGLE_ISSUERS];
  }

  private assertNotice(version: string, locale: string): void {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    if (!isAcceptablePrivacyNoticePair(version, locale, appEnv)) {
      throwInvalidRequest('Invalid request');
    }
  }

  async authenticate(
    _req: Request,
    input: GoogleAuthInput,
  ): Promise<TokenPair> {
    this.assertNotice(input.noticeVersion, input.noticeLocale);

    const audiences = this.clientIds();
    if (audiences.length === 0) {
      this.logger.warn('google_auth_misconfigured missing_client_ids');
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    const hasNoncePath =
      typeof input.idToken === 'string' &&
      input.idToken.length >= 20 &&
      typeof input.nonce === 'string' &&
      input.nonce.length >= 8;
    const hasPkcePath =
      typeof input.authorizationCode === 'string' &&
      input.authorizationCode.length >= 8 &&
      typeof input.codeVerifier === 'string' &&
      input.codeVerifier.length >= 43 &&
      typeof input.oauthState === 'string' &&
      input.oauthState.length >= 8 &&
      typeof input.redirectUri === 'string' &&
      input.redirectUri.length > 0;

    // Explicit reject: ID token without nonce (weak fallback forbidden).
    if (
      typeof input.idToken === 'string' &&
      input.idToken.length >= 20 &&
      !(typeof input.nonce === 'string' && input.nonce.length >= 8) &&
      !hasPkcePath
    ) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    // PKCE without server-issued state → fail-closed (no unbound code exchange).
    if (
      typeof input.authorizationCode === 'string' &&
      input.authorizationCode.length >= 8 &&
      !(typeof input.oauthState === 'string' && input.oauthState.length >= 8) &&
      !hasNoncePath
    ) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    if (!hasNoncePath && !hasPkcePath) {
      throwInvalidRequest('Invalid request');
    }

    let idToken: string;
    let nonceMode: 'google' | 'none' = 'none';
    let rawNonce: string | undefined;

    if (hasNoncePath) {
      idToken = input.idToken!;
      nonceMode = 'google';
      rawNonce = input.nonce!;
    } else {
      const pkceEnabled = this.config.get('GOOGLE_PKCE_ENABLED', {
        infer: true,
      });
      const clientSecret = this.config.get('GOOGLE_CLIENT_SECRET', {
        infer: true,
      });
      if (!pkceEnabled || !clientSecret) {
        this.logger.warn('google_pkce_disabled_or_misconfigured');
        throwUnauthorized('invalid_token', 'Invalid token');
      }

      // Consume validates redirect + PKCE + stored client_id allowlist atomically.
      const bound = await this.pkceTx.consumeOrThrow({
        state: input.oauthState!,
        codeVerifier: input.codeVerifier!,
        redirectUri: input.redirectUri!,
      });

      const exchanged = await this.exchanger.exchange({
        authorizationCode: input.authorizationCode!,
        codeVerifier: input.codeVerifier!,
        redirectUri: bound.redirectUri,
        clientId: bound.clientId,
        clientSecret,
      });
      if (!exchanged.ok) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }
      idToken = exchanged.idToken;
    }

    const verified = await verifyOidcIdToken({
      idToken,
      audiences,
      issuers: this.issuers(),
      jwks: this.jwksConfig(),
      rawNonce,
      nonceMode,
    });
    if (!verified.ok) {
      this.logger.warn(`google_verify_failed reason=${verified.reason}`);
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    if (hasNoncePath) {
      await this.nonces.consumeAfterVerify(input.nonce!, 'google');
    }

    const verifiedContact =
      verified.email && verified.emailVerified ? verified.email : null;

    const noticePresentedAt = new Date();
    const outcome = await this.prisma.db.$transaction(async (tx) => {
      const clock = await tx.$queryRaw<Array<{ now: Date }>>`
        SELECT clock_timestamp() AS now
      `;
      const now = clock[0]?.now ?? new Date();
      const parentId = await this.resolve.resolveOrCreateParentTx(tx, {
        provider: GOOGLE_PROVIDER,
        providerSubject: verified.sub,
        verifiedContact,
        noticeVersion: input.noticeVersion,
        noticeLocale: input.noticeLocale,
        noticePresentedAt,
        presentationSurface: input.clientSurface ?? 'google_auth',
        now,
      });
      return this.sessions.mintSessionTx(tx, {
        parentId,
        deviceId: input.deviceId ?? null,
        clientSurface: input.clientSurface ?? null,
        userAgentSummary: input.userAgentSummary ?? null,
      });
    });

    return this.sessions.signTokenPair(outcome);
  }
}
