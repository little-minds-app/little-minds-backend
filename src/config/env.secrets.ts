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
  // Legacy reserved placeholder (do not use for LMP-33 Ed25519 access JWTs):
  'JWT_SECRET',
  'JWT_ACCESS_PRIVATE_KEY_PEM',
  'REFRESH_TOKEN_PEPPER',
  'OTP_PEPPER',
  'PHONE_SUBJECT_PEPPER',
  'OTP_DESTINATION_KEY',
  'EMAIL_SUBJECT_PEPPER',
  'APPLE_JWKS_JSON',
  'GOOGLE_JWKS_JSON',
  'GOOGLE_CLIENT_SECRET',
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
  'RELEASE',
  'JWT_ISSUER',
  'JWT_AUDIENCE',
  'JWT_KEY_ID',
  'JWT_PREVIOUS_KEY_ID',
  'JWT_ACCESS_PUBLIC_KEY_PEM',
  'JWT_PREVIOUS_PUBLIC_KEY_PEM',
  'AUTH_DEV_BOOTSTRAP_ENABLED',
  'AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST',
  'LISTEN_HOST',
  'SMS_SENDER',
  'MAIL_SENDER',
  'GOOGLE_PKCE_ENABLED',
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

/** Hosts that are only valid for local development API bases. */
const LOCAL_API_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  '10.0.2.2', // Android emulator → host loopback
  'host.docker.internal',
]);

export function isSecretEnvKey(key: string): boolean {
  return (SECRET_ENV_KEYS as readonly string[]).includes(key);
}

function isPrivateOrLoopbackIpv4(host: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) {
    return false;
  }
  const octets = match.slice(1).map((part) => Number(part));
  if (octets.some((n) => n > 255)) {
    return false;
  }
  const [a, b] = octets;
  if (a === 10 || a === 127) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  return false;
}

function isLocalDevelopmentHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (LOCAL_API_HOSTS.has(host) || LOCAL_DB_HOSTS.has(host)) {
    return true;
  }
  if (host.endsWith('.local')) {
    return true;
  }
  if (isPrivateOrLoopbackIpv4(host)) {
    return true;
  }
  // IPv6 loopback / link-local / unique-local
  if (host === '::' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) {
    return true;
  }
  return false;
}

/**
 * True when a PUBLIC_API_BASE_URL host is local-development-only.
 * Used to reject staging/production API bases that point at loopback/emulator/LAN.
 */
export function isLocalApiBaseHost(hostname: string): boolean {
  return isLocalDevelopmentHost(hostname);
}

/** Strict loopback bind hosts for AUTH_DEV_BOOTSTRAP_ENABLED (not 0.0.0.0 / LAN). */
export function isLoopbackListenHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');
  return host === '127.0.0.1' || host === '::1' || host === 'localhost';
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
