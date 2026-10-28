import { z } from 'zod';
import {
  databaseUrlUsesForbiddenLocalSecrets,
  isForbiddenStandaloneSecret,
  isLocalApiBaseHost,
  isLocalDatabaseUrl,
} from './env.secrets';

/**
 * Canonical product environments (cross-repo contract with little-minds-client).
 * Do not use NODE_ENV for product flavor — staging deploys often run NODE_ENV=production.
 */
export const APP_ENV_VALUES = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof APP_ENV_VALUES)[number];

const nodeEnvSchema = z.enum(['development', 'test', 'production']);
const appEnvSchema = z.enum(APP_ENV_VALUES);

const baseSchema = z.object({
  APP_ENV: appEnvSchema.optional(),
  NODE_ENV: nodeEnvSchema.optional(),
  PORT: z.coerce.number().int().positive().max(65535).optional(),
  PUBLIC_API_BASE_URL: z.string().trim().min(1).optional(),
  /** Public release identifier for structured logs (ADR-013 `release` field). */
  RELEASE: z.string().trim().min(1).max(128).optional(),
  DATABASE_URL: z.string().trim().min(1).optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
});

export type AppEnv = {
  APP_ENV: AppEnvironment;
  NODE_ENV: z.infer<typeof nodeEnvSchema>;
  PORT: number;
  PUBLIC_API_BASE_URL: string;
  /** Public build/release id for observability (default `dev`). */
  RELEASE: string;
  /** Present when provided; required for staging/production Nest boot. */
  DATABASE_URL?: string;
};

function fail(details: string): never {
  throw new Error(`Environment validation failed: ${details}`);
}

function resolveAppEnv(
  rawAppEnv: AppEnvironment | undefined,
  nodeEnv: z.infer<typeof nodeEnvSchema>,
): AppEnvironment {
  if (rawAppEnv) {
    return rawAppEnv;
  }
  // Jest / CI harness uses NODE_ENV=test; product env stays development.
  if (nodeEnv === 'test') {
    return 'development';
  }
  return 'development';
}

function assertNodeAppEnvPair(
  appEnv: AppEnvironment,
  nodeEnv: z.infer<typeof nodeEnvSchema>,
): void {
  if (appEnv === 'staging' || appEnv === 'production') {
    if (nodeEnv !== 'production' && nodeEnv !== 'test') {
      fail(
        `APP_ENV=${appEnv} requires NODE_ENV=production (or test in automated harnesses); got NODE_ENV=${nodeEnv}`,
      );
    }
  }
}

function assertPublicApiBaseUrl(
  appEnv: AppEnvironment,
  url: string | undefined,
): string {
  if (appEnv === 'development') {
    return url && url.length > 0 ? url : 'http://localhost:3000';
  }

  if (!url || url.length === 0) {
    fail(`PUBLIC_API_BASE_URL is required when APP_ENV=${appEnv}`);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Do not echo the raw value — it may contain credentials or sensitive paths.
    fail('PUBLIC_API_BASE_URL is not a valid URL');
  }

  // Staging and production: protocol must be exactly https: (reject http:, ftp:, etc.).
  if (parsed.protocol !== 'https:') {
    fail(
      `PUBLIC_API_BASE_URL must use https: when APP_ENV=${appEnv} (rejected protocol ${parsed.protocol})`,
    );
  }

  if (isLocalApiBaseHost(parsed.hostname)) {
    fail(
      `PUBLIC_API_BASE_URL must not use a local/development host when APP_ENV=${appEnv}`,
    );
  }

  return url;
}

function assertStagingProductionSecrets(
  appEnv: AppEnvironment,
  config: {
    DATABASE_URL?: string;
    POSTGRES_PASSWORD?: string;
    MINIO_ROOT_PASSWORD?: string;
    S3_SECRET_KEY?: string;
  },
): string {
  const databaseUrl = config.DATABASE_URL;
  if (!databaseUrl) {
    fail(`DATABASE_URL is required when APP_ENV=${appEnv}`);
  }

  if (isLocalDatabaseUrl(databaseUrl)) {
    fail(
      `DATABASE_URL must not target a local/dev host when APP_ENV=${appEnv} (env isolation)`,
    );
  }

  if (databaseUrlUsesForbiddenLocalSecrets(databaseUrl)) {
    fail(
      `DATABASE_URL must not use local placeholder credentials when APP_ENV=${appEnv}`,
    );
  }

  for (const [key, value] of Object.entries({
    POSTGRES_PASSWORD: config.POSTGRES_PASSWORD,
    MINIO_ROOT_PASSWORD: config.MINIO_ROOT_PASSWORD,
    S3_SECRET_KEY: config.S3_SECRET_KEY,
  })) {
    if (value !== undefined && isForbiddenStandaloneSecret(value)) {
      fail(
        `${key} must not use a local placeholder value when APP_ENV=${appEnv}`,
      );
    }
  }

  return databaseUrl;
}

/**
 * Startup env schema for Nest bootstrap (LMP-28).
 * Fail-fast on invalid values and on staging/production secret isolation violations.
 */
export function validateEnv(config: Record<string, unknown>): AppEnv {
  const parsed = baseSchema.safeParse(config);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    fail(details);
  }

  const nodeEnv = parsed.data.NODE_ENV ?? 'development';
  const appEnv = resolveAppEnv(parsed.data.APP_ENV, nodeEnv);
  assertNodeAppEnvPair(appEnv, nodeEnv);

  const port = parsed.data.PORT ?? 3000;
  const publicApiBaseUrl = assertPublicApiBaseUrl(
    appEnv,
    parsed.data.PUBLIC_API_BASE_URL,
  );

  const release =
    parsed.data.RELEASE && parsed.data.RELEASE.length > 0
      ? parsed.data.RELEASE
      : 'dev';

  const result: AppEnv = {
    APP_ENV: appEnv,
    NODE_ENV: nodeEnv,
    PORT: port,
    PUBLIC_API_BASE_URL: publicApiBaseUrl,
    RELEASE: release,
  };

  if (appEnv === 'staging' || appEnv === 'production') {
    result.DATABASE_URL = assertStagingProductionSecrets(appEnv, parsed.data);
  } else if (parsed.data.DATABASE_URL) {
    result.DATABASE_URL = parsed.data.DATABASE_URL;
  }

  return result;
}
