/**
 * Safety gate for destructive DB reset (LMP-22).
 * Default-deny: remote hosts, substring "localhost" tricks, and missing explicit approval.
 * SSH tunnels to non-dev DBs via loopback cannot be fully detected — operators must not
 * forward production/staging onto an allowlisted loopback port.
 */

export const LM_CONFIRM_DB_RESET = 'LM_CONFIRM_DB_RESET';

/** Exact hostnames permitted for reset (no substring matching). */
export const ALLOWED_RESET_HOSTS = new Set([
  '127.0.0.1',
  'localhost',
  '::1',
  '[::1]',
  // Docker Compose service DNS when the API runs on the compose network.
  'postgres',
]);

/** Synthetic / isolated DB names only. */
const ALLOWED_DATABASE_NAME =
  /^little_minds(_(test|dev|ci|local))?$/;

export type ParsedDatabaseUrl = {
  host: string;
  port: string | null;
  database: string;
};

export class DbResetGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DbResetGuardError';
  }
}

/**
 * Parse PostgreSQL connection URL. Rejects non-postgres schemes and empty hosts.
 * Uses WHATWG URL so "localhost" in password/query/path cannot spoof the host.
 */
export function parseDatabaseUrl(raw: string): ParsedDatabaseUrl {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new DbResetGuardError('DATABASE_URL is empty');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new DbResetGuardError('DATABASE_URL is not a valid URL');
  }

  if (!/^postgres(ql)?:$/i.test(parsed.protocol)) {
    throw new DbResetGuardError(
      `Refusing reset: unsupported scheme "${parsed.protocol}" (expected postgres/postgresql)`,
    );
  }

  const host = (parsed.hostname || '').toLowerCase();
  if (!host) {
    throw new DbResetGuardError('Refusing reset: DATABASE_URL has no host');
  }

  // pathname is "/dbname" — strip leading slash and ignore extra path segments.
  const path = parsed.pathname.replace(/^\//, '');
  const database = decodeURIComponent(path.split('/')[0] || '');
  if (!database) {
    throw new DbResetGuardError('Refusing reset: DATABASE_URL has no database name');
  }

  return {
    host,
    port: parsed.port || null,
    database,
  };
}

export function isAllowedResetHost(host: string): boolean {
  return ALLOWED_RESET_HOSTS.has(host.toLowerCase());
}

export function isAllowedResetDatabaseName(name: string): boolean {
  return ALLOWED_DATABASE_NAME.test(name);
}

export type ResetGuardEnv = {
  LM_CONFIRM_DB_RESET?: string | undefined;
  [key: string]: string | undefined;
};

/**
 * Assert DATABASE_URL is an explicitly approved, clearly isolated development/test target.
 * Remote hosts are always denied. Loopback/compose hosts still require LM_CONFIRM_DB_RESET=1.
 */
export function assertSafeResetTarget(
  databaseUrl: string,
  env: ResetGuardEnv = process.env as ResetGuardEnv,
): ParsedDatabaseUrl {
  if (env.LM_CONFIRM_DB_RESET !== '1') {
    throw new DbResetGuardError(
      `Refusing reset: set ${LM_CONFIRM_DB_RESET}=1 to explicitly approve a destructive ` +
        'rebuild of an isolated development/test database. Remote and SSH-tunneled ' +
        'production/staging targets must never be reset with this script.',
    );
  }

  const target = parseDatabaseUrl(databaseUrl);

  if (!isAllowedResetHost(target.host)) {
    throw new DbResetGuardError(
      `Refusing reset: host "${target.host}" is not an allowlisted loopback/compose host. ` +
        'Remote databases are default-denied (including SSH tunnels to remote hosts).',
    );
  }

  if (!isAllowedResetDatabaseName(target.database)) {
    throw new DbResetGuardError(
      `Refusing reset: database "${target.database}" is not an allowlisted synthetic name ` +
        '(expected little_minds or little_minds_{test|dev|ci|local}).',
    );
  }

  return target;
}

function main(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  try {
    const target = assertSafeResetTarget(url, process.env as ResetGuardEnv);
    console.log(
      JSON.stringify({
        ok: true,
        host: target.host,
        database: target.database,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Refusing reset: unknown guard error';
    console.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
