import { z } from 'zod';
import {
  databaseUrlUsesForbiddenLocalSecrets,
  isForbiddenStandaloneSecret,
  isLocalApiBaseHost,
  isLocalDatabaseUrl,
  isLoopbackListenHost,
} from './env.secrets';
import {
  allowsUnpublishedPrivacyNoticeFixtures,
  isPrivacyNoticeLegallyPublished,
} from '../modules/identity/otp/privacy-notice.catalog';

/**
 * Canonical product environments (cross-repo contract with little-minds-client).
 * Do not use NODE_ENV for product flavor — staging deploys often run NODE_ENV=production.
 */
export const APP_ENV_VALUES = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof APP_ENV_VALUES)[number];

const nodeEnvSchema = z.enum(['development', 'test', 'production']);
const appEnvSchema = z.enum(APP_ENV_VALUES);

const LOCAL_REFRESH_PEPPER = 'local-dev-refresh-pepper-not-for-prod';
const LOCAL_OTP_PEPPER = 'local-dev-otp-pepper-not-for-prod!!';
const LOCAL_PHONE_SUBJECT_PEPPER = 'local-dev-phone-subject-pepper!!';
const LOCAL_EMAIL_SUBJECT_PEPPER = 'local-dev-email-subject-pepper!!';

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
  // LMP-33 / ADR-019 auth
  JWT_ACCESS_PRIVATE_KEY_PEM: z.string().optional(),
  JWT_ACCESS_PUBLIC_KEY_PEM: z.string().optional(),
  JWT_PREVIOUS_PUBLIC_KEY_PEM: z.string().optional(),
  JWT_KEY_ID: z.string().trim().min(1).max(128).optional(),
  JWT_PREVIOUS_KEY_ID: z.string().trim().min(1).max(128).optional(),
  JWT_ISSUER: z.string().trim().min(1).max(128).optional(),
  JWT_AUDIENCE: z.string().trim().min(1).max(128).optional(),
  REFRESH_TOKEN_PEPPER: z.string().optional(),
  LM_WEB_BFF_SECRET: z.string().optional(),
  AUTH_DEV_BOOTSTRAP_ENABLED: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return false;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      return value === '1' || value.toLowerCase() === 'true';
    }),
  AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST: z.string().optional(),
  /** Nest listen bind host. Required to be loopback when AUTH_DEV_BOOTSTRAP_ENABLED. */
  LISTEN_HOST: z.string().trim().min(1).max(253).optional(),
  // LMP-34 / ADR-020 GSM OTP
  SMS_SENDER: z.enum(['fake', 'production']).optional(),
  OTP_PEPPER: z.string().optional(),
  PHONE_SUBJECT_PEPPER: z.string().optional(),
  /** Optional sealed-destination key (U9); unused when destinations stay null. */
  OTP_DESTINATION_KEY: z.string().optional(),
  // LMP-35 / ADR-021 multi-provider
  MAIL_SENDER: z.enum(['fake', 'production']).optional(),
  EMAIL_SUBJECT_PEPPER: z.string().optional(),
  APPLE_CLIENT_IDS: z.string().optional(),
  APPLE_ISSUER: z.string().optional(),
  APPLE_JWKS_URL: z.string().optional(),
  /** Local JWKS JSON override (tests / offline). Forbidden in staging/production. */
  APPLE_JWKS_JSON: z.string().optional(),
  GOOGLE_CLIENT_IDS: z.string().optional(),
  GOOGLE_ISSUERS: z.string().optional(),
  GOOGLE_JWKS_URL: z.string().optional(),
  GOOGLE_JWKS_JSON: z.string().optional(),
  GOOGLE_TOKEN_URL: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URIS: z.string().optional(),
  /** When false/absent, Google PKCE path fail-closed. */
  GOOGLE_PKCE_ENABLED: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return false;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      return value === '1' || value.toLowerCase() === 'true';
    }),
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
  JWT_ACCESS_PRIVATE_KEY_PEM?: string;
  JWT_ACCESS_PUBLIC_KEY_PEM?: string;
  JWT_PREVIOUS_PUBLIC_KEY_PEM?: string;
  JWT_KEY_ID?: string;
  JWT_PREVIOUS_KEY_ID?: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
  REFRESH_TOKEN_PEPPER: string;
  LM_WEB_BFF_SECRET?: string;
  AUTH_DEV_BOOTSTRAP_ENABLED: boolean;
  AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST?: string;
  /** Bind address for `app.listen` — loopback-only when bootstrap is enabled. */
  LISTEN_HOST: string;
  SMS_SENDER: 'fake' | 'production';
  OTP_PEPPER: string;
  PHONE_SUBJECT_PEPPER: string;
  OTP_DESTINATION_KEY?: string;
  MAIL_SENDER: 'fake' | 'production';
  EMAIL_SUBJECT_PEPPER: string;
  APPLE_CLIENT_IDS: string[];
  APPLE_ISSUER?: string;
  APPLE_JWKS_URL?: string;
  APPLE_JWKS_JSON?: string;
  GOOGLE_CLIENT_IDS: string[];
  GOOGLE_ISSUERS: string[];
  GOOGLE_JWKS_URL?: string;
  GOOGLE_JWKS_JSON?: string;
  GOOGLE_TOKEN_URL?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URIS: string[];
  GOOGLE_PKCE_ENABLED: boolean;
};

function parseCsvList(raw: string | undefined): string[] {
  if (!raw || raw.trim().length === 0) {
    return [];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

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
  // NODE_ENV=production without explicit APP_ENV must not silent-fallback to
  // development (would allow FakeSms / local peppers / unpublished notice fixtures).
  if (nodeEnv === 'production') {
    fail(
      'APP_ENV is required when NODE_ENV=production (set APP_ENV=staging or APP_ENV=production; do not rely on development defaults)',
    );
  }
  // Local/CI: omitted APP_ENV with NODE_ENV=test|development → development.
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

function assertAuthSecrets(
  appEnv: AppEnvironment,
  config: {
    JWT_ACCESS_PRIVATE_KEY_PEM?: string;
    JWT_ACCESS_PUBLIC_KEY_PEM?: string;
    REFRESH_TOKEN_PEPPER?: string;
    AUTH_DEV_BOOTSTRAP_ENABLED: boolean;
  },
): string {
  if (appEnv === 'staging' || appEnv === 'production') {
    if (
      !config.JWT_ACCESS_PRIVATE_KEY_PEM ||
      !config.JWT_ACCESS_PUBLIC_KEY_PEM
    ) {
      fail(
        `JWT_ACCESS_PRIVATE_KEY_PEM and JWT_ACCESS_PUBLIC_KEY_PEM are required when APP_ENV=${appEnv}`,
      );
    }
    if (
      !config.REFRESH_TOKEN_PEPPER ||
      config.REFRESH_TOKEN_PEPPER.length < 16 ||
      config.REFRESH_TOKEN_PEPPER === LOCAL_REFRESH_PEPPER
    ) {
      fail(
        `REFRESH_TOKEN_PEPPER must be a strong non-local secret when APP_ENV=${appEnv}`,
      );
    }
    if (config.AUTH_DEV_BOOTSTRAP_ENABLED) {
      fail(
        `AUTH_DEV_BOOTSTRAP_ENABLED must be false when APP_ENV=${appEnv}`,
      );
    }
    return config.REFRESH_TOKEN_PEPPER;
  }

  if (
    config.REFRESH_TOKEN_PEPPER &&
    config.REFRESH_TOKEN_PEPPER.trim().length >= 16
  ) {
    return config.REFRESH_TOKEN_PEPPER.trim();
  }
  return LOCAL_REFRESH_PEPPER;
}

function assertOtpSecrets(
  appEnv: AppEnvironment,
  config: {
    SMS_SENDER?: 'fake' | 'production';
    OTP_PEPPER?: string;
    PHONE_SUBJECT_PEPPER?: string;
    MAIL_SENDER?: 'fake' | 'production';
    EMAIL_SUBJECT_PEPPER?: string;
  },
): {
  SMS_SENDER: 'fake' | 'production';
  OTP_PEPPER: string;
  PHONE_SUBJECT_PEPPER: string;
  MAIL_SENDER: 'fake' | 'production';
  EMAIL_SUBJECT_PEPPER: string;
} {
  const smsSender =
    config.SMS_SENDER ??
    (appEnv === 'development' ? 'fake' : 'production');
  const mailSender =
    config.MAIL_SENDER ??
    (appEnv === 'development' ? 'fake' : 'production');

  if (
    (appEnv === 'staging' || appEnv === 'production') &&
    smsSender === 'fake'
  ) {
    fail(`SMS_SENDER=fake is forbidden when APP_ENV=${appEnv}`);
  }
  if (
    (appEnv === 'staging' || appEnv === 'production') &&
    mailSender === 'fake'
  ) {
    fail(`MAIL_SENDER=fake is forbidden when APP_ENV=${appEnv}`);
  }

  if (appEnv === 'staging' || appEnv === 'production') {
    if (
      !config.OTP_PEPPER ||
      config.OTP_PEPPER.length < 16 ||
      config.OTP_PEPPER === LOCAL_OTP_PEPPER
    ) {
      fail(`OTP_PEPPER must be a strong non-local secret when APP_ENV=${appEnv}`);
    }
    if (
      !config.PHONE_SUBJECT_PEPPER ||
      config.PHONE_SUBJECT_PEPPER.length < 16 ||
      config.PHONE_SUBJECT_PEPPER === LOCAL_PHONE_SUBJECT_PEPPER
    ) {
      fail(
        `PHONE_SUBJECT_PEPPER must be a strong non-local secret when APP_ENV=${appEnv}`,
      );
    }
    if (
      !config.EMAIL_SUBJECT_PEPPER ||
      config.EMAIL_SUBJECT_PEPPER.length < 16 ||
      config.EMAIL_SUBJECT_PEPPER === LOCAL_EMAIL_SUBJECT_PEPPER
    ) {
      fail(
        `EMAIL_SUBJECT_PEPPER must be a strong non-local secret when APP_ENV=${appEnv}`,
      );
    }
    if (
      config.OTP_PEPPER === config.PHONE_SUBJECT_PEPPER ||
      config.OTP_PEPPER === LOCAL_REFRESH_PEPPER ||
      config.OTP_PEPPER === config.EMAIL_SUBJECT_PEPPER ||
      config.PHONE_SUBJECT_PEPPER === config.EMAIL_SUBJECT_PEPPER
    ) {
      fail(
        'OTP_PEPPER / PHONE_SUBJECT_PEPPER / EMAIL_SUBJECT_PEPPER must be distinct',
      );
    }
    return {
      SMS_SENDER: smsSender,
      OTP_PEPPER: config.OTP_PEPPER,
      PHONE_SUBJECT_PEPPER: config.PHONE_SUBJECT_PEPPER,
      MAIL_SENDER: mailSender,
      EMAIL_SUBJECT_PEPPER: config.EMAIL_SUBJECT_PEPPER,
    };
  }

  const otpPepper =
    config.OTP_PEPPER && config.OTP_PEPPER.trim().length >= 16
      ? config.OTP_PEPPER.trim()
      : LOCAL_OTP_PEPPER;
  const phonePepper =
    config.PHONE_SUBJECT_PEPPER &&
    config.PHONE_SUBJECT_PEPPER.trim().length >= 16
      ? config.PHONE_SUBJECT_PEPPER.trim()
      : LOCAL_PHONE_SUBJECT_PEPPER;
  const emailPepper =
    config.EMAIL_SUBJECT_PEPPER &&
    config.EMAIL_SUBJECT_PEPPER.trim().length >= 16
      ? config.EMAIL_SUBJECT_PEPPER.trim()
      : LOCAL_EMAIL_SUBJECT_PEPPER;

  return {
    SMS_SENDER: smsSender,
    OTP_PEPPER: otpPepper,
    PHONE_SUBJECT_PEPPER: phonePepper,
    MAIL_SENDER: mailSender,
    EMAIL_SUBJECT_PEPPER: emailPepper,
  };
}

function assertOidcProviderConfig(
  appEnv: AppEnvironment,
  config: {
    APPLE_CLIENT_IDS?: string;
    APPLE_JWKS_JSON?: string;
    GOOGLE_CLIENT_IDS?: string;
    GOOGLE_JWKS_JSON?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_REDIRECT_URIS?: string;
    GOOGLE_PKCE_ENABLED: boolean;
  },
): {
  APPLE_CLIENT_IDS: string[];
  APPLE_JWKS_JSON?: string;
  GOOGLE_CLIENT_IDS: string[];
  GOOGLE_ISSUERS: string[];
  GOOGLE_JWKS_JSON?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URIS: string[];
  GOOGLE_PKCE_ENABLED: boolean;
} {
  const appleIds = parseCsvList(config.APPLE_CLIENT_IDS);
  const googleIds = parseCsvList(config.GOOGLE_CLIENT_IDS);
  const googleRedirects = parseCsvList(config.GOOGLE_REDIRECT_URIS);

  if (appEnv === 'staging' || appEnv === 'production') {
    // Local JWKS JSON overrides are forbidden in real-user envs (fail-closed).
    if (config.APPLE_JWKS_JSON || config.GOOGLE_JWKS_JSON) {
      fail(
        `APPLE_JWKS_JSON / GOOGLE_JWKS_JSON are forbidden when APP_ENV=${appEnv}`,
      );
    }
    // Providers may be unconfigured (paid/ops gate) — requests fail-closed.
    // Boot does not require client IDs until ops authorize production enablement.
  }

  return {
    APPLE_CLIENT_IDS: appleIds,
    APPLE_JWKS_JSON:
      appEnv === 'development' ? config.APPLE_JWKS_JSON : undefined,
    GOOGLE_CLIENT_IDS: googleIds,
    GOOGLE_ISSUERS: [],
    GOOGLE_JWKS_JSON:
      appEnv === 'development' ? config.GOOGLE_JWKS_JSON : undefined,
    GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URIS: googleRedirects,
    GOOGLE_PKCE_ENABLED: config.GOOGLE_PKCE_ENABLED,
  };
}

/**
 * Fail-closed bind + advertising gates when local session bootstrap is enabled
 * (ADR-019 §8 / LMP-33 re-review): prevent public ingress → loopback reverse-proxy
 * from making every peer look like 127.0.0.1 while the API is shared.
 */
function assertListenHostForBootstrap(
  bootstrapEnabled: boolean,
  publicApiBaseUrl: string,
  rawListenHost: string | undefined,
): string {
  const listenHost = (rawListenHost && rawListenHost.trim()) || '0.0.0.0';
  if (!bootstrapEnabled) {
    return listenHost;
  }

  if (!isLoopbackListenHost(listenHost)) {
    fail(
      'LISTEN_HOST must be 127.0.0.1 or ::1 when AUTH_DEV_BOOTSTRAP_ENABLED=true (refuse 0.0.0.0 / shared binds)',
    );
  }

  let hostname: string;
  try {
    hostname = new URL(publicApiBaseUrl).hostname;
  } catch {
    fail(
      'PUBLIC_API_BASE_URL must be a valid local URL when AUTH_DEV_BOOTSTRAP_ENABLED=true',
    );
  }
  if (!isLocalApiBaseHost(hostname)) {
    fail(
      'PUBLIC_API_BASE_URL must use a local/development host when AUTH_DEV_BOOTSTRAP_ENABLED=true',
    );
  }

  return listenHost;
}

/**
 * Startup env schema for Nest bootstrap (LMP-28 + LMP-33).
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

  const bootstrapEnabled = parsed.data.AUTH_DEV_BOOTSTRAP_ENABLED ?? false;
  const refreshPepper = assertAuthSecrets(appEnv, {
    JWT_ACCESS_PRIVATE_KEY_PEM: parsed.data.JWT_ACCESS_PRIVATE_KEY_PEM,
    JWT_ACCESS_PUBLIC_KEY_PEM: parsed.data.JWT_ACCESS_PUBLIC_KEY_PEM,
    REFRESH_TOKEN_PEPPER: parsed.data.REFRESH_TOKEN_PEPPER,
    AUTH_DEV_BOOTSTRAP_ENABLED: bootstrapEnabled,
  });

  const bffSecret = parsed.data.LM_WEB_BFF_SECRET;
  if ((appEnv === 'staging' || appEnv === 'production') &&
      (!bffSecret || bffSecret.length < 32 || bffSecret.includes('CHANGE_ME'))) {
    fail('LM_WEB_BFF_SECRET must be configured with a strong 32+ character secret');
  }

  const listenHost = assertListenHostForBootstrap(
    bootstrapEnabled,
    publicApiBaseUrl,
    parsed.data.LISTEN_HOST,
  );

  const otpSecrets = assertOtpSecrets(appEnv, {
    SMS_SENDER: parsed.data.SMS_SENDER,
    OTP_PEPPER: parsed.data.OTP_PEPPER,
    PHONE_SUBJECT_PEPPER: parsed.data.PHONE_SUBJECT_PEPPER,
    MAIL_SENDER: parsed.data.MAIL_SENDER,
    EMAIL_SUBJECT_PEPPER: parsed.data.EMAIL_SUBJECT_PEPPER,
  });

  const oidc = assertOidcProviderConfig(appEnv, {
    APPLE_CLIENT_IDS: parsed.data.APPLE_CLIENT_IDS,
    APPLE_JWKS_JSON: parsed.data.APPLE_JWKS_JSON,
    GOOGLE_CLIENT_IDS: parsed.data.GOOGLE_CLIENT_IDS,
    GOOGLE_JWKS_JSON: parsed.data.GOOGLE_JWKS_JSON,
    GOOGLE_CLIENT_SECRET: parsed.data.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URIS: parsed.data.GOOGLE_REDIRECT_URIS,
    GOOGLE_PKCE_ENABLED: parsed.data.GOOGLE_PKCE_ENABLED ?? false,
  });
  const googleIssuers = parseCsvList(parsed.data.GOOGLE_ISSUERS);

  const result: AppEnv = {
    APP_ENV: appEnv,
    NODE_ENV: nodeEnv,
    PORT: port,
    PUBLIC_API_BASE_URL: publicApiBaseUrl,
    RELEASE: release,
    REFRESH_TOKEN_PEPPER: refreshPepper,
    LM_WEB_BFF_SECRET: bffSecret,
    AUTH_DEV_BOOTSTRAP_ENABLED: bootstrapEnabled,
    JWT_ACCESS_PRIVATE_KEY_PEM: parsed.data.JWT_ACCESS_PRIVATE_KEY_PEM,
    JWT_ACCESS_PUBLIC_KEY_PEM: parsed.data.JWT_ACCESS_PUBLIC_KEY_PEM,
    JWT_PREVIOUS_PUBLIC_KEY_PEM: parsed.data.JWT_PREVIOUS_PUBLIC_KEY_PEM,
    JWT_KEY_ID: parsed.data.JWT_KEY_ID,
    JWT_PREVIOUS_KEY_ID: parsed.data.JWT_PREVIOUS_KEY_ID,
    JWT_ISSUER: parsed.data.JWT_ISSUER,
    JWT_AUDIENCE: parsed.data.JWT_AUDIENCE,
    AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST:
      parsed.data.AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST,
    LISTEN_HOST: listenHost,
    SMS_SENDER: otpSecrets.SMS_SENDER,
    OTP_PEPPER: otpSecrets.OTP_PEPPER,
    PHONE_SUBJECT_PEPPER: otpSecrets.PHONE_SUBJECT_PEPPER,
    OTP_DESTINATION_KEY: parsed.data.OTP_DESTINATION_KEY,
    MAIL_SENDER: otpSecrets.MAIL_SENDER,
    EMAIL_SUBJECT_PEPPER: otpSecrets.EMAIL_SUBJECT_PEPPER,
    APPLE_CLIENT_IDS: oidc.APPLE_CLIENT_IDS,
    APPLE_ISSUER: parsed.data.APPLE_ISSUER,
    APPLE_JWKS_URL: parsed.data.APPLE_JWKS_URL,
    APPLE_JWKS_JSON: oidc.APPLE_JWKS_JSON,
    GOOGLE_CLIENT_IDS: oidc.GOOGLE_CLIENT_IDS,
    GOOGLE_ISSUERS: googleIssuers,
    GOOGLE_JWKS_URL: parsed.data.GOOGLE_JWKS_URL,
    GOOGLE_JWKS_JSON: oidc.GOOGLE_JWKS_JSON,
    GOOGLE_TOKEN_URL: parsed.data.GOOGLE_TOKEN_URL,
    GOOGLE_CLIENT_SECRET: oidc.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URIS: oidc.GOOGLE_REDIRECT_URIS,
    GOOGLE_PKCE_ENABLED: oidc.GOOGLE_PKCE_ENABLED,
  };

  if (appEnv === 'staging' || appEnv === 'production') {
    result.DATABASE_URL = assertStagingProductionSecrets(appEnv, parsed.data);
  } else if (parsed.data.DATABASE_URL) {
    result.DATABASE_URL = parsed.data.DATABASE_URL;
  }

  // Real-user envs cannot boot on an unpublished engineering notice placeholder.
  // Synthetic fixtures remain allowed only in local/CI (development / test).
  // Runs after other staging/prod secret checks so those keep specific errors.
  if (
    !allowsUnpublishedPrivacyNoticeFixtures(appEnv) &&
    !isPrivacyNoticeLegallyPublished()
  ) {
    fail(
      `Privacy notice catalog has no published entry; APP_ENV=${appEnv} cannot process personal data until counsel publishes a catalog pair (ADR-020 / docs/privacy-notice-catalog.md)`,
    );
  }

  return result;
}
