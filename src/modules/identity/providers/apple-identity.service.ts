import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JSONWebKeySet } from 'jose';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { isAcceptablePrivacyNoticePair } from '../otp/privacy-notice.catalog';
import {
  APPLE_PROVIDER,
  DEFAULT_APPLE_ISSUER,
  DEFAULT_APPLE_JWKS_URL,
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

export type AppleAuthInput = {
  idToken: string;
  nonce: string;
  noticeVersion: string;
  noticeLocale: string;
  clientSurface?: string | null;
  deviceId?: string | null;
  userAgentSummary?: string | null;
};

/**
 * Apple Sign In — JWKS + mandatory nonce (ADR-021 §4).
 * P1: verify ID token + nonce claim **before** consuming server nonce
 * (invalid tokens do not burn a legitimate unused nonce).
 */
@Injectable()
export class AppleIdentityService {
  private readonly logger = new Logger(AppleIdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionIssuerService,
    private readonly resolve: IdentityResolveService,
    private readonly nonces: OidcNonceService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private audiences(): string[] {
    const raw = this.config.get('APPLE_CLIENT_IDS', { infer: true }) as
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
    const localJson = this.config.get('APPLE_JWKS_JSON', { infer: true });
    if (localJson) {
      return { local: JSON.parse(localJson) as JSONWebKeySet };
    }
    const url =
      this.config.get('APPLE_JWKS_URL', { infer: true }) ??
      DEFAULT_APPLE_JWKS_URL;
    return { url };
  }

  private assertNotice(version: string, locale: string): void {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    if (!isAcceptablePrivacyNoticePair(version, locale, appEnv)) {
      throwInvalidRequest('Invalid request');
    }
  }

  async authenticate(_req: Request, input: AppleAuthInput): Promise<TokenPair> {
    this.assertNotice(input.noticeVersion, input.noticeLocale);

    const audiences = this.audiences();
    if (audiences.length === 0) {
      this.logger.warn('apple_auth_misconfigured missing_client_ids');
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    // 1) Verify ID token + nonce claim first (does not consume server nonce).
    const verified = await verifyOidcIdToken({
      idToken: input.idToken,
      audiences,
      issuers: [
        this.config.get('APPLE_ISSUER', { infer: true }) ?? DEFAULT_APPLE_ISSUER,
      ],
      jwks: this.jwksConfig(),
      rawNonce: input.nonce,
      nonceMode: 'apple',
    });
    if (!verified.ok) {
      this.logger.warn(`apple_verify_failed reason=${verified.reason}`);
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    // 2) Atomically consume provider-bound nonce (single-use / cross-provider reject).
    await this.nonces.consumeAfterVerify(input.nonce, 'apple');

    const noticePresentedAt = new Date();
    const outcome = await this.prisma.db.$transaction(async (tx) => {
      const clock = await tx.$queryRaw<Array<{ now: Date }>>`
        SELECT clock_timestamp() AS now
      `;
      const now = clock[0]?.now ?? new Date();
      const parentId = await this.resolve.resolveOrCreateParentTx(tx, {
        provider: APPLE_PROVIDER,
        providerSubject: verified.sub,
        verifiedContact: null,
        noticeVersion: input.noticeVersion,
        noticeLocale: input.noticeLocale,
        noticePresentedAt,
        presentationSurface: input.clientSurface ?? 'apple_auth',
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
