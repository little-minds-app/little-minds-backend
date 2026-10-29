/**
 * Google PKCE exact OAuth client audience binding (security remediation).
 * PKCE path: ID token aud must equal the transaction-bound clientId.
 * Nonce path: full GOOGLE_CLIENT_IDS allowlist unchanged.
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { GoogleIdentityService } from './google-identity.service';
import { FakeGoogleTokenExchanger } from './google-token-exchanger';
import {
  signTestIdToken,
  TEST_OIDC_ISS_GOOGLE,
  TEST_OIDC_JWKS_JSON,
} from '../../../../test/fixtures/oidc/test-keys';

const CLIENT_A = 'google-client-a.apps.googleusercontent.com';
const CLIENT_B = 'google-client-b.apps.googleusercontent.com';
const REDIRECT = 'http://localhost/cb';

describe('GoogleIdentityService PKCE exact audience binding', () => {
  const notice = {
    noticeVersion: 'v1-tr-2026-10',
    noticeLocale: 'tr-TR',
  };

  function build(opts?: {
    consumeClientId?: string;
    consumeReject?: boolean;
  }) {
    const exchanger = new FakeGoogleTokenExchanger();
    const pkceTx = {
      consumeOrThrow: jest.fn(async () => {
        if (opts?.consumeReject) {
          throw new UnauthorizedException({
            error: 'invalid_token',
            message: 'Invalid token',
          });
        }
        return {
          clientId: opts?.consumeClientId ?? CLIENT_A,
          redirectUri: REDIRECT,
        };
      }),
    };

    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          GOOGLE_CLIENT_IDS: [CLIENT_A, CLIENT_B],
          GOOGLE_ISSUERS: [TEST_OIDC_ISS_GOOGLE],
          GOOGLE_JWKS_JSON: TEST_OIDC_JWKS_JSON,
          GOOGLE_REDIRECT_URIS: [REDIRECT],
          GOOGLE_PKCE_ENABLED: true,
          GOOGLE_CLIENT_SECRET: 'test-secret-not-for-prod!!',
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;

    const sessions = {
      mintSessionTx: jest.fn().mockResolvedValue({
        sessionId: '11111111-1111-4111-8111-111111111111',
        parentId: '22222222-2222-4222-8222-222222222222',
        refreshToken: 'refresh-plaintext',
      }),
      signTokenPair: jest.fn().mockReturnValue({
        access_token: 'access',
        refresh_token: 'refresh-plaintext',
        token_type: 'Bearer',
        expires_in: 900,
        session_id: '11111111-1111-4111-8111-111111111111',
        parent_id: '22222222-2222-4222-8222-222222222222',
      }),
    };

    const resolve = {
      resolveOrCreateParentTx: jest
        .fn()
        .mockResolvedValue('22222222-2222-4222-8222-222222222222'),
    };

    const prisma = {
      db: {
        $transaction: jest.fn(async (fn: (tx: unknown) => unknown) =>
          fn({
            $queryRaw: async () => [{ now: new Date() }],
          }),
        ),
      },
    };

    const nonces = {
      consumeAfterVerify: jest.fn().mockResolvedValue(undefined),
    };

    const svc = new GoogleIdentityService(
      prisma as never,
      sessions as never,
      resolve as never,
      nonces as never,
      pkceTx as never,
      config,
      exchanger,
    );
    return { svc, exchanger, pkceTx, sessions, resolve, nonces };
  }

  async function pkceAuth(
    svc: GoogleIdentityService,
    exchanger: FakeGoogleTokenExchanger,
    aud: string,
  ) {
    const idToken = await signTestIdToken({
      sub: 'google-pkce-aud-sub',
      aud,
      iss: TEST_OIDC_ISS_GOOGLE,
    });
    exchanger.setNextIdTokenForTests(idToken);
    return svc.authenticate({} as never, {
      authorizationCode: 'auth-code-value',
      codeVerifier: 'a'.repeat(43),
      redirectUri: REDIRECT,
      oauthState: 'server-issued-state-ok',
      ...notice,
    });
  }

  it('client A transaction + aud A succeeds', async () => {
    const { svc, exchanger, pkceTx, sessions } = build({
      consumeClientId: CLIENT_A,
    });
    const pair = await pkceAuth(svc, exchanger, CLIENT_A);
    expect(pair.access_token).toBeTruthy();
    expect(pkceTx.consumeOrThrow).toHaveBeenCalled();
    expect(sessions.signTokenPair).toHaveBeenCalled();
  });

  it('client A transaction + aud B (other configured client) rejects', async () => {
    const { svc, exchanger, sessions } = build({ consumeClientId: CLIENT_A });
    await expect(pkceAuth(svc, exchanger, CLIENT_B)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(sessions.signTokenPair).not.toHaveBeenCalled();
  });

  it('client A transaction + unknown aud rejects', async () => {
    const { svc, exchanger, sessions } = build({ consumeClientId: CLIENT_A });
    await expect(
      pkceAuth(svc, exchanger, 'unknown-client.apps.googleusercontent.com'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessions.signTokenPair).not.toHaveBeenCalled();
  });

  it('nonce path still accepts any allowlisted Google client (CLIENT_B)', async () => {
    const { svc, sessions, pkceTx } = build();
    const nonce = 'server-nonce-value-ok';
    const idToken = await signTestIdToken({
      sub: 'google-nonce-aud-sub',
      aud: CLIENT_B,
      iss: TEST_OIDC_ISS_GOOGLE,
      nonce,
    });
    const pair = await svc.authenticate({} as never, {
      idToken,
      nonce,
      ...notice,
    });
    expect(pair.access_token).toBeTruthy();
    expect(pkceTx.consumeOrThrow).not.toHaveBeenCalled();
    expect(sessions.signTokenPair).toHaveBeenCalled();
  });
});
