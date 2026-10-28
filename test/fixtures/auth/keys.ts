/** Test-only Ed25519 PEMs (LMP-33). Never use in staging/production. */
export const TEST_JWT_PRIVATE_PEM = "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJlbvPagSgdXGaBIw5O/2AbGY1FAdp8pATfOXk06yzBo\n-----END PRIVATE KEY-----";
export const TEST_JWT_PUBLIC_PEM = "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAq6hBRgkzmANiz8Jc2kT3RaNxLFWcBFhKCL8xNlgirdQ=\n-----END PUBLIC KEY-----";
export const TEST_REFRESH_PEPPER = 'test-refresh-pepper-32chars-min!!';

export const stagingAuthEnv = {
  JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
  JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
  REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
  AUTH_DEV_BOOTSTRAP_ENABLED: false,
} as const;
