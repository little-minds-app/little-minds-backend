/**
 * Test-only RSA key + JWKS for Apple/Google ID-token verify (LMP-35).
 * Never use in staging/production.
 */
import {
  exportJWK,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  SignJWT,
  type JWK,
  type KeyLike,
} from 'jose';

export const TEST_OIDC_AUD_APPLE = 'com.littleminds.app.apple.test';
export const TEST_OIDC_AUD_GOOGLE = 'little-minds-google-test.apps.googleusercontent.com';
export const TEST_OIDC_ISS_APPLE = 'https://appleid.apple.com';
export const TEST_OIDC_ISS_GOOGLE = 'https://accounts.google.com';

let cached:
  | {
      privateKey: KeyLike;
      publicJwk: JWK;
      jwksJson: string;
      kid: string;
    }
  | undefined;

export async function getTestOidcKeys() {
  if (cached) {
    return cached;
  }
  const { privateKey, publicKey } = await generateKeyPair('RS256', {
    extractable: true,
  });
  const publicJwk = await exportJWK(publicKey);
  const kid = 'test-oidc-kid-1';
  publicJwk.kid = kid;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  const jwksJson = JSON.stringify({ keys: [publicJwk] });
  // Touch PEM exports so they stay available if a harness needs them.
  await exportPKCS8(privateKey);
  await exportSPKI(publicKey);
  cached = { privateKey, publicJwk, jwksJson, kid };
  return cached;
}

export async function signTestIdToken(opts: {
  sub: string;
  aud: string;
  iss: string;
  nonce?: string;
  email?: string;
  emailVerified?: boolean;
  /** Override iat age (seconds ago). */
  ageSeconds?: number;
}): Promise<string> {
  const keys = await getTestOidcKeys();
  const now = Math.floor(Date.now() / 1000);
  const iat = now - (opts.ageSeconds ?? 0);
  const jwt = new SignJWT({
    ...(opts.nonce ? { nonce: opts.nonce } : {}),
    ...(opts.email ? { email: opts.email } : {}),
    ...(opts.emailVerified !== undefined
      ? { email_verified: opts.emailVerified }
      : {}),
  })
    .setProtectedHeader({ alg: 'RS256', kid: keys.kid })
    .setSubject(opts.sub)
    .setAudience(opts.aud)
    .setIssuer(opts.iss)
    .setIssuedAt(iat)
    .setExpirationTime(iat + 600);
  return jwt.sign(keys.privateKey);
}
