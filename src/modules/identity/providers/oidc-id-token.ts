import {
  createLocalJWKSet,
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JSONWebKeySet,
} from 'jose';
import { createHash } from 'node:crypto';
import {
  OIDC_CLOCK_SKEW_SECONDS,
  OIDC_MAX_TOKEN_AGE_SECONDS,
} from '../otp/multi-provider.constants';

export type OidcVerifyInput = {
  idToken: string;
  /** Expected audiences (Services ID / client IDs). */
  audiences: string[];
  /** Exact issuer allowlist. */
  issuers: string[];
  /** Remote JWKS URL, or local JWKS JSON for tests / overrides. */
  jwks: { url?: string; local?: JSONWebKeySet };
  /**
   * Expected raw nonce (server-issued). When set, token `nonce` claim must match:
   * - Apple: SHA-256 hex of raw nonce
   * - Google / generic: raw nonce OR SHA-256 hex (accept either)
   */
  rawNonce?: string;
  /** How to match nonce claim. */
  nonceMode: 'apple' | 'google' | 'none';
};

export type OidcVerifyOk = {
  ok: true;
  sub: string;
  email?: string;
  emailVerified?: boolean;
  payload: JWTPayload;
};

export type OidcVerifyErr = { ok: false; reason: string };
export type OidcVerifyResult = OidcVerifyOk | OidcVerifyErr;

function sha256Hex(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

function resolveJwks(jwks: OidcVerifyInput['jwks']) {
  if (jwks.local) {
    return createLocalJWKSet(jwks.local);
  }
  if (jwks.url) {
    return createRemoteJWKSet(new URL(jwks.url));
  }
  throw new Error('OIDC JWKS not configured');
}

/**
 * Full ID-token verification matrix (ADR-021 §4.2 / §5).
 * Rejects alg none / HS*; requires asymmetric via jose JWKS.
 */
export async function verifyOidcIdToken(
  input: OidcVerifyInput,
): Promise<OidcVerifyResult> {
  if (!input.idToken || input.idToken.length < 20) {
    return { ok: false, reason: 'malformed' };
  }
  if (input.audiences.length === 0 || input.issuers.length === 0) {
    return { ok: false, reason: 'misconfigured' };
  }

  // Reject clearly symmetric / none before JWKS (defense in depth).
  try {
    const headerJson = Buffer.from(
      input.idToken.split('.')[0] ?? '',
      'base64url',
    ).toString('utf8');
    const header = JSON.parse(headerJson) as { alg?: string };
    const alg = header.alg ?? '';
    if (
      !alg ||
      alg === 'none' ||
      alg.startsWith('HS') ||
      alg === 'HS256' ||
      alg === 'HS384' ||
      alg === 'HS512'
    ) {
      return { ok: false, reason: 'alg' };
    }
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  let payload: JWTPayload;
  try {
    const jwks = resolveJwks(input.jwks);
    const result = await jwtVerify(input.idToken, jwks, {
      audience: input.audiences,
      issuer: input.issuers,
      clockTolerance: OIDC_CLOCK_SKEW_SECONDS,
      maxTokenAge: `${OIDC_MAX_TOKEN_AGE_SECONDS}s`,
    });
    payload = result.payload;
  } catch {
    return { ok: false, reason: 'verify' };
  }

  const sub = typeof payload.sub === 'string' ? payload.sub.trim() : '';
  if (!sub) {
    return { ok: false, reason: 'sub' };
  }

  if (input.nonceMode !== 'none') {
    if (!input.rawNonce) {
      return { ok: false, reason: 'nonce_missing' };
    }
    const claim =
      typeof payload.nonce === 'string' ? payload.nonce : undefined;
    if (!claim) {
      return { ok: false, reason: 'nonce_claim' };
    }
    const hashed = sha256Hex(input.rawNonce);
    if (input.nonceMode === 'apple') {
      if (claim !== hashed) {
        return { ok: false, reason: 'nonce_mismatch' };
      }
    } else {
      // Google: accept raw or hashed depending on platform.
      if (claim !== input.rawNonce && claim !== hashed) {
        return { ok: false, reason: 'nonce_mismatch' };
      }
    }
  }

  const email =
    typeof payload.email === 'string' ? payload.email : undefined;
  const emailVerified =
    payload.email_verified === true ||
    payload.email_verified === 'true';

  return {
    ok: true,
    sub,
    email,
    emailVerified: emailVerified || undefined,
    payload,
  };
}
