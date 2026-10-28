import type { AppEnv } from './env.validation';
import { PUBLIC_ENV_KEYS } from './env.secrets';

export type PublicAppConfig = Pick<
  AppEnv,
  'APP_ENV' | 'NODE_ENV' | 'PORT' | 'PUBLIC_API_BASE_URL' | 'RELEASE'
>;

/**
 * Strip secrets from validated env for startup logs and diagnostics.
 */
export function toPublicConfig(env: AppEnv): PublicAppConfig {
  // Intentionally omit REFRESH_TOKEN_PEPPER, private PEMs, DATABASE_URL, etc.
  return {
    APP_ENV: env.APP_ENV,
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    PUBLIC_API_BASE_URL: env.PUBLIC_API_BASE_URL,
    RELEASE: env.RELEASE,
  };
}

export function isPublicEnvKey(key: string): boolean {
  return (PUBLIC_ENV_KEYS as readonly string[]).includes(key);
}
