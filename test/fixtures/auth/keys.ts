/** Test-only Ed25519 PEMs (LMP-33). Never use in staging/production. */
export const TEST_JWT_PRIVATE_PEM = "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJlbvPagSgdXGaBIw5O/2AbGY1FAdp8pATfOXk06yzBo\n-----END PRIVATE KEY-----";
export const TEST_JWT_PUBLIC_PEM = "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAq6hBRgkzmANiz8Jc2kT3RaNxLFWcBFhKCL8xNlgirdQ=\n-----END PUBLIC KEY-----";
export const TEST_REFRESH_PEPPER = 'test-refresh-pepper-32chars-min!!';
export const TEST_OTP_PEPPER = 'test-otp-pepper-32chars-minimum!!';
export const TEST_PHONE_SUBJECT_PEPPER = 'test-phone-subject-pepper-32ch!!';
export const TEST_EMAIL_SUBJECT_PEPPER = 'test-email-subject-pepper-32ch!!';

export const stagingAuthEnv = {
  JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
  JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
  REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
  LM_WEB_BFF_SECRET: 'test-fixture-bff-secret-32-characters-long',
  AUTH_DEV_BOOTSTRAP_ENABLED: false,
  SMS_SENDER: 'production' as const,
  OTP_PEPPER: TEST_OTP_PEPPER,
  PHONE_SUBJECT_PEPPER: TEST_PHONE_SUBJECT_PEPPER,
  MAIL_SENDER: 'production' as const,
  EMAIL_SUBJECT_PEPPER: TEST_EMAIL_SUBJECT_PEPPER,
} as const;
