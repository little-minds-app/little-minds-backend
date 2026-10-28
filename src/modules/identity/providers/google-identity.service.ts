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
import {
  GOOGLE_TOKEN_EXCHANGER,
  type GoogleTokenExchanger,
} from './google-token-exchanger';

export type GoogleAuthInput = {
  /** Nonce path */
  idToken?: string | null;
  nonce?: string | null;
  /** PKCE path */
  authorizationCode?: string | null;
  codeVerifier?: string | null;
  redirectUri?: string | null;
  noticeVersion: string;
  noticeLocale: string;
  clientSurface?: string | null;
  deviceId?: string | null;
  userAgentSummary?: string | null;
};

/**
 * Google Sign-In (ADR-021 §5):
 * - Prefer ID token + mandatory nonce
 * - Else authorization-code + PKCE server exchange → JWKS-verify ID token
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
    private readonly config: ConfigService<AppEnv, true>,
    @Inject(GOOGLE_TOKEN_EXCHANGER)
    private readonly exchanger: GoogleTokenExchanger,
  ) {}

  private clientIds(): string[] {
    return this.config.get('GOOGLE_CLIENT_IDS', { infer: true }) ?? [];
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

  private redirectAllowed(redirectUri: string): boolean {
    const allow =
      this.config.get('GOOGLE_REDIRECT_URIS', { infer: true }) ?? [];
    return allow.includes(redirectUri);
  }

  async authenticate(_req: Request, input: GoogleAuthInput): Promise<TokenPair> {
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
      input.codeVerifier.length >= 43;

    // Explicit reject: ID token without nonce (weak fallback forbidden).
    if (
      typeof input.idToken === 'string' &&
      input.idToken.length >= 20 &&
      !(typeof input.nonce === 'string' && input.nonce.length >= 8) &&
      !hasPkcePath
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
      await this.nonces.consumeOrThrow(input.nonce!);
      idToken = input.idToken!;
      nonceMode = 'google';
      rawNonce = input.nonce!;
    } else {
      // PKCE path — require redirect + secret config
      const redirectUri = input.redirectUri;
      if (typeof redirectUri !== 'string' || !this.redirectAllowed(redirectUri)) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }
      const clientSecret = this.config.get('GOOGLE_CLIENT_SECRET', {
        infer: true,
      });
      const pkceEnabled = this.config.get('GOOGLE_PKCE_ENABLED', {
        infer: true,
      });
      if (!pkceEnabled || !clientSecret) {
        // Fail-closed when PKCE path disabled / misconfigured.
        this.logger.warn('google_pkce_disabled_or_misconfigured');
        throwUnauthorized('invalid_token', 'Invalid token');
      }
      const exchanged = await this.exchanger.exchange({
        authorizationCode: input.authorizationCode!,
        codeVerifier: input.codeVerifier!,
        redirectUri,
        clientId: audiences[0],
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
      throwUnauthorized('invalid_token', 'Invalid token');
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
