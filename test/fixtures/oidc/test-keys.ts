/**
 * Test-only RSA key + JWKS for Apple/Google ID-token verify (LMP-35).
 * Static material so setup-e2e-env can install APPLE/GOOGLE_* before AppModule boot.
 * Never use in staging/production.
 */
import { importPKCS8, SignJWT, type KeyLike } from 'jose';

export const TEST_OIDC_AUD_APPLE = 'com.littleminds.app.apple.test';
export const TEST_OIDC_AUD_GOOGLE =
  'little-minds-google-test.apps.googleusercontent.com';
export const TEST_OIDC_ISS_APPLE = 'https://appleid.apple.com';
export const TEST_OIDC_ISS_GOOGLE = 'https://accounts.google.com';

export const TEST_OIDC_PRIVATE_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDakQirdgGgNOJI
6nvNIOFwSgPhCopO2ZeKGea7GgXr1zc0xzNugXsWoU5FPnCyonCIMymV0uD3xe9f
cPexnT59ckxtwOnjHQiI5OypH6hF1CQBUSEl/OkoJqhl1P9lkWh096fpbm4aqCIT
7GmB+LTXfgn4E+6tdTA3KsQkokEM1uyeMP1825ZGDyJ+VgSnnqGzB/JUQQ9M0a5K
EunEH+w2uZBpvfJQZLvuScXMRO4mtL2kS4YLHxe3iONVCpa4t9FhpL0ypcLvIAop
U5yY1KngrLCht47nixRu2iivHt7TFbwAzzSkRjJAU50k69EFE3vvgj78VfeCsSEd
Sx5/J8snAgMBAAECggEAIQnMYDKx0zg7Pl9ngF3ohfNCO9m+h2W/0OnSZVTtMTWy
jCFSZnFfHFAcxz3FhlMkpInrTtD2Ha4HXYtzfZ8xy3+kCvEeyaxhVmQYXAZDhu6m
1KYhVx8wVVfmm6IDSyScQBYRhSkirpfcsttJJZLlLy/HrP7CVOkCdUxbIth98cUh
sl4PrS5TFFogNwdq2CGA+tKgiHNGOQ391fuAXOyvCC8KZIn5SwF/eGLLyh8ku/XU
4z4LCxiS5i5ZiaQ4wL1Z6QEUK4o5C8XlQKAVvUEk+dQrtJ1zwFcMvVEZ8hZ998j7
ErmgNAnpOzDxkfjJj4lte2FBqVaZv7bpIS0noBZ7gQKBgQDutePkZ3pIta65j45l
xJM9OhzYLLFZPqykBhkZyTNjLs02/BMXNGLBRjvNp8SCP+tQsIhzbH/Uqdia/2p5
FsEJmxwUzkCyk77YZ4KuitnAET5BFDnHcLaz3Cp08B0wjaF/9nk3y9HpiJ8VTxlW
e39jSL+r0ndRwqMCIVhNiKskgQKBgQDqZaOnQgIvqSCoKcXT84+sQH2M46rhD2R4
n3JKQG/MhQ81K6iPchdw8xDfOHCwCw3H1dOGxitwnltCCtH3iwou/Z2Scxaof+U3
8hRd+pN57f+MaRBAvohFiH71Qz1fmi1XepY0uUlKH5IxeYhTRo79+ZOHdHEdkdVT
PyEd3Hl7pwKBgGru1C3HJQJZUPITGuj/zC2LUMyOCMw/xTqc+LWSahCuMIPHHA4z
C2IlQjj4RJFMbO9yhU2fdwwfIccdT+b6iHLzJvszAcx9Xuq2Q9ZIoQ7nKoogs1li
ZpXftK05uvm7GHOoR9j01w3Ug98Z1fHl1MT3G9WurIDVvgwAP/xLks8BAoGBAMqn
scSsZ2N5oIiEBUxpKnDNGT+0n0sSmdVIVfIooAB9klZwNr4+8FFxdcbo71TlWbbL
AqVltK0b3N7OqBaUGevizleONardWPrzy/Qs71DeGrH1LF4t3XfwuYOn7Oo5TLZz
gGZ5RApYHXe1Ec6eFIc1Pv5ACIR+T6g3zpQYyNfFAoGATEh8Zl37ZCNdNKyIPE7Z
xTagPjCRFld8B9unOnPZUAkabNJp5dOoX/iAQiotMw1xCHAmSMorgt8kVltvhgWO
bB+ajOocCN4Wsj9l2IqZFRdEVucEz3i701Od4fr/c868DvIcBH+a4uSBtas9Te5S
cUVWwIlPW/cp/8bwJGfszes=
-----END PRIVATE KEY-----`;

export const TEST_OIDC_JWKS = {
  keys: [
    {
      kty: 'RSA',
      n: '2pEIq3YBoDTiSOp7zSDhcEoD4QqKTtmXihnmuxoF69c3NMczboF7FqFORT5wsqJwiDMpldLg98XvX3D3sZ0-fXJMbcDp4x0IiOTsqR-oRdQkAVEhJfzpKCaoZdT_ZZFodPen6W5uGqgiE-xpgfi0134J-BPurXUwNyrEJKJBDNbsnjD9fNuWRg8iflYEp56hswfyVEEPTNGuShLpxB_sNrmQab3yUGS77knFzETuJrS9pEuGCx8Xt4jjVQqWuLfRYaS9MqXC7yAKKVOcmNSp4KywobeO54sUbtoorx7e0xW8AM80pEYyQFOdJOvRBRN774I-_FX3grEhHUsefyfLJw',
      e: 'AQAB',
      kid: 'test-oidc-kid-1',
      alg: 'RS256',
      use: 'sig',
    },
  ],
} as const;

export const TEST_OIDC_JWKS_JSON = JSON.stringify(TEST_OIDC_JWKS);

let privateKeyPromise: Promise<KeyLike> | undefined;

async function privateKey(): Promise<KeyLike> {
  privateKeyPromise ??= importPKCS8(TEST_OIDC_PRIVATE_PEM, 'RS256');
  return privateKeyPromise;
}

export async function getTestOidcKeys() {
  return {
    privateKey: await privateKey(),
    jwksJson: TEST_OIDC_JWKS_JSON,
    kid: 'test-oidc-kid-1',
  };
}

export async function signTestIdToken(opts: {
  sub: string;
  aud: string;
  iss: string;
  nonce?: string;
  email?: string;
  emailVerified?: boolean;
  ageSeconds?: number;
}): Promise<string> {
  const key = await privateKey();
  const now = Math.floor(Date.now() / 1000);
  const iat = now - (opts.ageSeconds ?? 0);
  const jwt = new SignJWT({
    ...(opts.nonce ? { nonce: opts.nonce } : {}),
    ...(opts.email ? { email: opts.email } : {}),
    ...(opts.emailVerified !== undefined
      ? { email_verified: opts.emailVerified }
      : {}),
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-oidc-kid-1' })
    .setSubject(opts.sub)
    .setAudience(opts.aud)
    .setIssuer(opts.iss)
    .setIssuedAt(iat)
    .setExpirationTime(iat + 600);
  return jwt.sign(key);
}
