/**
 * Google path selection security invariants (ADR-021 §5) — unit-level.
 * Full HTTP/JWKS coverage lives in multi-provider-oidc.e2e-spec (CI Postgres).
 */
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { GoogleIdentityService } from './google-identity.service';
import { FakeGoogleTokenExchanger } from './google-token-exchanger';

describe('GoogleIdentityService path selection (fail-closed)', () => {
  function build(overrides: Partial<AppEnv> = {}) {
    const exchanger = new FakeGoogleTokenExchanger();
    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          GOOGLE_CLIENT_IDS: ['aud'],
          GOOGLE_ISSUERS: ['https://accounts.google.com'],
          GOOGLE_REDIRECT_URIS: ['http://localhost/cb'],
          GOOGLE_PKCE_ENABLED: false,
          GOOGLE_CLIENT_SECRET: undefined,
          ...overrides,
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;

    const svc = new GoogleIdentityService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      config,
      exchanger,
    );
    return { svc, exchanger };
  }

  const notice = {
    noticeVersion: 'v1-tr-2026-10',
    noticeLocale: 'tr-TR',
  };

  it('rejects ID token without nonce (weak fallback forbidden)', async () => {
    const { svc } = build();
    await expect(
      svc.authenticate({} as never, {
        idToken: 'x'.repeat(40),
        nonce: null,
        ...notice,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when neither nonce nor PKCE path is satisfiable', async () => {
    const { svc } = build();
    await expect(
      svc.authenticate({} as never, {
        ...notice,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fail-closes PKCE when GOOGLE_PKCE_ENABLED=false', async () => {
    const { svc } = build({ GOOGLE_PKCE_ENABLED: false });
    await expect(
      svc.authenticate({} as never, {
        authorizationCode: 'auth-code-value',
        codeVerifier: 'a'.repeat(43),
        redirectUri: 'http://localhost/cb',
        ...notice,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('fail-closes when Google client IDs missing', async () => {
    const { svc } = build({ GOOGLE_CLIENT_IDS: [] });
    await expect(
      svc.authenticate({} as never, {
        idToken: 'x'.repeat(40),
        nonce: 'server-nonce-value-ok',
        ...notice,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
