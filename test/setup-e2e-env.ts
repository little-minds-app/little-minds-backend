/**
 * Runs before e2e suites load AppModule (ConfigModule.forRoot validates at import).
 * LMP-33: enable gated local bootstrap + signing material for Nest boot.
 */
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';

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
