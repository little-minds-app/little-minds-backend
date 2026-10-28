import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { DEFAULT_GOOGLE_TOKEN_URL } from '../otp/multi-provider.constants';

export type GoogleCodeExchangeInput = {
  authorizationCode: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
};

export type GoogleCodeExchangeResult =
  | { ok: true; idToken: string }
  | { ok: false; reason: string };

export const GOOGLE_TOKEN_EXCHANGER = Symbol('GOOGLE_TOKEN_EXCHANGER');

export interface GoogleTokenExchanger {
  exchange(input: GoogleCodeExchangeInput): Promise<GoogleCodeExchangeResult>;
}

/**
 * Production Google OAuth token endpoint exchange (auth-code + PKCE).
 * Never logs codes / tokens.
 */
@Injectable()
export class HttpGoogleTokenExchanger implements GoogleTokenExchanger {
  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  async exchange(
    input: GoogleCodeExchangeInput,
  ): Promise<GoogleCodeExchangeResult> {
    const tokenUrl =
      this.config.get('GOOGLE_TOKEN_URL', { infer: true }) ??
      DEFAULT_GOOGLE_TOKEN_URL;
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.authorizationCode,
        client_id: input.clientId,
        client_secret: input.clientSecret,
        redirect_uri: input.redirectUri,
        code_verifier: input.codeVerifier,
      });
      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) {
        return { ok: false, reason: 'token_http' };
      }
      const json = (await res.json()) as { id_token?: unknown };
      if (typeof json.id_token !== 'string' || json.id_token.length < 20) {
        return { ok: false, reason: 'no_id_token' };
      }
      return { ok: true, idToken: json.id_token };
    } catch {
      return { ok: false, reason: 'token_network' };
    }
  }
}

/**
 * Test-only exchanger — returns a preconfigured ID token.
 * Wired in unit/e2e tests; never used as production SoR.
 */
export class FakeGoogleTokenExchanger implements GoogleTokenExchanger {
  private nextIdToken: string | null = null;
  private failNext = false;

  setNextIdTokenForTests(idToken: string): void {
    this.nextIdToken = idToken;
  }

  failNextForTests(): void {
    this.failNext = true;
  }

  async exchange(
    _input: GoogleCodeExchangeInput,
  ): Promise<GoogleCodeExchangeResult> {
    if (this.failNext) {
      this.failNext = false;
      return { ok: false, reason: 'injected' };
    }
    if (!this.nextIdToken) {
      return { ok: false, reason: 'not_configured' };
    }
    const idToken = this.nextIdToken;
    this.nextIdToken = null;
    return { ok: true, idToken };
  }
}
