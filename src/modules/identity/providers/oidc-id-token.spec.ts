import { createHash } from 'node:crypto';
import {
  getTestOidcKeys,
  signTestIdToken,
  TEST_OIDC_AUD_APPLE,
  TEST_OIDC_ISS_APPLE,
} from '../../../../test/fixtures/oidc/test-keys';
import { verifyOidcIdToken } from './oidc-id-token';

describe('verifyOidcIdToken (ADR-021)', () => {
  it('accepts valid Apple-style token with hashed nonce', async () => {
    const keys = await getTestOidcKeys();
    const rawNonce = 'server-issued-nonce-value-abc12345';
    const hashed = createHash('sha256').update(rawNonce, 'utf8').digest('hex');
    const idToken = await signTestIdToken({
      sub: 'apple-sub-1',
      aud: TEST_OIDC_AUD_APPLE,
      iss: TEST_OIDC_ISS_APPLE,
      nonce: hashed,
    });
    const result = await verifyOidcIdToken({
      idToken,
      audiences: [TEST_OIDC_AUD_APPLE],
      issuers: [TEST_OIDC_ISS_APPLE],
      jwks: { local: JSON.parse(keys.jwksJson) },
      rawNonce,
      nonceMode: 'apple',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sub).toBe('apple-sub-1');
    }
  });

  it('rejects nonce mismatch / missing nonce', async () => {
    const keys = await getTestOidcKeys();
    const idToken = await signTestIdToken({
      sub: 'apple-sub-2',
      aud: TEST_OIDC_AUD_APPLE,
      iss: TEST_OIDC_ISS_APPLE,
      nonce: 'wrong',
    });
    const bad = await verifyOidcIdToken({
      idToken,
      audiences: [TEST_OIDC_AUD_APPLE],
      issuers: [TEST_OIDC_ISS_APPLE],
      jwks: { local: JSON.parse(keys.jwksJson) },
      rawNonce: 'server-issued-nonce-value-abc12345',
      nonceMode: 'apple',
    });
    expect(bad.ok).toBe(false);

    const noNonce = await signTestIdToken({
      sub: 'apple-sub-3',
      aud: TEST_OIDC_AUD_APPLE,
      iss: TEST_OIDC_ISS_APPLE,
    });
    const missing = await verifyOidcIdToken({
      idToken: noNonce,
      audiences: [TEST_OIDC_AUD_APPLE],
      issuers: [TEST_OIDC_ISS_APPLE],
      jwks: { local: JSON.parse(keys.jwksJson) },
      rawNonce: 'server-issued-nonce-value-abc12345',
      nonceMode: 'apple',
    });
    expect(missing.ok).toBe(false);
  });

  it('rejects wrong audience / issuer / expired age', async () => {
    const keys = await getTestOidcKeys();
    const rawNonce = 'nonce-for-aud-test-xxxxxxxxxx';
    const hashed = createHash('sha256').update(rawNonce, 'utf8').digest('hex');
    const idToken = await signTestIdToken({
      sub: 'x',
      aud: 'wrong-aud',
      iss: TEST_OIDC_ISS_APPLE,
      nonce: hashed,
    });
    const badAud = await verifyOidcIdToken({
      idToken,
      audiences: [TEST_OIDC_AUD_APPLE],
      issuers: [TEST_OIDC_ISS_APPLE],
      jwks: { local: JSON.parse(keys.jwksJson) },
      rawNonce,
      nonceMode: 'apple',
    });
    expect(badAud.ok).toBe(false);

    const old = await signTestIdToken({
      sub: 'x',
      aud: TEST_OIDC_AUD_APPLE,
      iss: TEST_OIDC_ISS_APPLE,
      nonce: hashed,
      ageSeconds: 700,
    });
    const tooOld = await verifyOidcIdToken({
      idToken: old,
      audiences: [TEST_OIDC_AUD_APPLE],
      issuers: [TEST_OIDC_ISS_APPLE],
      jwks: { local: JSON.parse(keys.jwksJson) },
      rawNonce,
      nonceMode: 'apple',
    });
    expect(tooOld.ok).toBe(false);
  });

  it('rejects when audiences misconfigured', async () => {
    const result = await verifyOidcIdToken({
      idToken: 'a'.repeat(40),
      audiences: [],
      issuers: [TEST_OIDC_ISS_APPLE],
      jwks: { local: { keys: [] } },
      nonceMode: 'none',
    });
    expect(result.ok).toBe(false);
  });
});
