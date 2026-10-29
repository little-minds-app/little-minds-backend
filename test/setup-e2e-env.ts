/**
 * Runs before e2e suites load AppModule (ConfigModule.forRoot validates at import).
 * LMP-33: enable gated local bootstrap + signing material for Nest boot.
 * LMP-35: Apple/Google local JWKS + client IDs for OIDC e2e (development only).
 */
import {
  TEST_EMAIL_SUBJECT_PEPPER,
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_OTP_PEPPER,
  TEST_PHONE_SUBJECT_PEPPER,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';
import {
  TEST_OIDC_AUD_APPLE,
  TEST_OIDC_AUD_GOOGLE,
  TEST_OIDC_AUD_GOOGLE_B,
  TEST_OIDC_ISS_APPLE,
  TEST_OIDC_ISS_GOOGLE,
  TEST_OIDC_JWKS_JSON,
} from './fixtures/oidc/test-keys';

process.env.APP_ENV ??= 'development';
process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';
process.env.PUBLIC_API_BASE_URL ??= 'http://localhost:3000';
process.env.LISTEN_HOST ??= '127.0.0.1';

process.env.JWT_ACCESS_PRIVATE_KEY_PEM ??= TEST_JWT_PRIVATE_PEM;
process.env.JWT_ACCESS_PUBLIC_KEY_PEM ??= TEST_JWT_PUBLIC_PEM;
process.env.REFRESH_TOKEN_PEPPER ??= TEST_REFRESH_PEPPER;
process.env.AUTH_DEV_BOOTSTRAP_ENABLED ??= 'true';
process.env.AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST ??=
  '11111111-1111-4111-8111-111111111111';
process.env.SMS_SENDER ??= 'fake';
process.env.MAIL_SENDER ??= 'fake';
process.env.OTP_PEPPER ??= TEST_OTP_PEPPER;
process.env.PHONE_SUBJECT_PEPPER ??= TEST_PHONE_SUBJECT_PEPPER;
process.env.EMAIL_SUBJECT_PEPPER ??= TEST_EMAIL_SUBJECT_PEPPER;

// LMP-35 OIDC — must be present before first AppModule validateEnv.
process.env.APPLE_CLIENT_IDS ??= TEST_OIDC_AUD_APPLE;
process.env.APPLE_ISSUER ??= TEST_OIDC_ISS_APPLE;
process.env.APPLE_JWKS_JSON ??= TEST_OIDC_JWKS_JSON;
process.env.GOOGLE_CLIENT_IDS ??= `${TEST_OIDC_AUD_GOOGLE},${TEST_OIDC_AUD_GOOGLE_B}`;
process.env.GOOGLE_ISSUERS ??= TEST_OIDC_ISS_GOOGLE;
process.env.GOOGLE_JWKS_JSON ??= TEST_OIDC_JWKS_JSON;
process.env.GOOGLE_PKCE_ENABLED ??= 'true';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-google-client-secret!!';
process.env.GOOGLE_REDIRECT_URIS ??=
  'http://localhost/oauth/google/callback';
