/**
 * Secret vs public configuration catalog (LMP-28).
 * Values are never committed; this module names keys and local placeholders only.
 */

/** Keys treated as secrets — never log raw values. */
export const SECRET_ENV_KEYS = [
  'DATABASE_URL',
  'POSTGRES_PASSWORD',
  'MINIO_ROOT_PASSWORD',
  'MINIO_ROOT_USER',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  // Reserved for later Identity / Billing LMPs — document only until required:
  'JWT_SECRET',
  'OIDC_CLIENT_SECRET',
  'SMTP_PASSWORD',
] as const;

export type SecretEnvKey = (typeof SECRET_ENV_KEYS)[number];

/** Keys safe to expose in logs, docs, and client build-time config. */
export const PUBLIC_ENV_KEYS = [
  'APP_ENV',
  'NODE_ENV',
  'PORT',
  'PUBLIC_API_BASE_URL',
] as const;

export type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];

/**
 * Known local-only placeholder credentials (Compose / .env.example).
 * Forbidden when APP_ENV is staging or production.
 */
export const LOCAL_PLACEHOLDER_CREDENTIALS = [
  'postgres',
  'minioadmin',
] as const;

const LOCAL_DB_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  'host.docker.internal',
  'postgres', // compose service name — local-only
]);

export function isSecretEnvKey(key: string): boolean {
  return (SECRET_ENV_KEYS as readonly string[]).includes(key);
}

/**
 * True when a DATABASE_URL (or similar) targets a local/dev-only host.
 */
export function isLocalDatabaseUrl(databaseUrl: string): boolean {
  try {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname.toLowerCase();
    if (LOCAL_DB_HOSTS.has(host)) {
      return true;
    }
    return host.endsWith('.local');
  } catch {
    return false;
  }
}

/**
 * Detects Compose-style local credentials and documentation placeholders
 * inside a DATABASE_URL (user/password/host fragments).
 */
export function databaseUrlUsesForbiddenLocalSecrets(
  databaseUrl: string,
): boolean {
  const lower = databaseUrl.toLowerCase();
  // Documentation placeholders only — do not treat RFC example hosts as secrets.
  if (
    lower.includes('change_me') ||
    lower.includes('change-me') ||
    lower.includes('changeme') ||
    lower.includes('user:password@')
  ) {
    return true;
  }

  try {
    const parsed = new URL(databaseUrl);
    const username = decodeURIComponent(parsed.username).toLowerCase();
    const password = decodeURIComponent(parsed.password).toLowerCase();
    for (const token of LOCAL_PLACEHOLDER_CREDENTIALS) {
      if (username === token || password === token) {
        return true;
      }
    }
    return false;
  } catch {
    return LOCAL_PLACEHOLDER_CREDENTIALS.some((token) =>
      lower.includes(`:${token}@`),
    );
  }
}

export function isForbiddenStandaloneSecret(value: string): boolean {
  const lower = value.trim().toLowerCase();
  if (!lower) {
    return true;
  }
  if (
    lower === 'changeme' ||
    lower === 'change_me' ||
    lower === 'change-me' ||
    lower === 'replace_me' ||
    lower.startsWith('change_me')
  ) {
    return true;
  }
  return (LOCAL_PLACEHOLDER_CREDENTIALS as readonly string[]).includes(lower);
}
