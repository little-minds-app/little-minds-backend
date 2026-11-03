/**
 * Safety gate for LMP-132 `verify:local` database integration (non-destructive migrate/seed/tests).
 * Default-deny: requires explicit LM_VERIFY_WITH_DB=1, allowlisted loopback/compose host, and a
 * disposable database name suffix — never the default `little_minds` dev volume.
 */

import {
  DbResetGuardError,
  isAllowedResetHost,
  parseDatabaseUrl,
  type ParsedDatabaseUrl,
} from './db-reset-guard';

export const LM_VERIFY_WITH_DB = 'LM_VERIFY_WITH_DB';

/** Isolated names only (excludes bare `little_minds` used by default Compose). */
const VERIFY_DATABASE_NAME = /^little_minds_(test|ci|local|dev)$/;

export function isAllowedVerifyDatabaseName(name: string): boolean {
  return VERIFY_DATABASE_NAME.test(name);
}

export type VerifyDbGuardEnv = {
  LM_VERIFY_WITH_DB?: string | undefined;
  DATABASE_URL?: string | undefined;
  [key: string]: string | undefined;
};

export function assertSafeVerifyDbTarget(
  databaseUrl: string,
  env: VerifyDbGuardEnv = process.env as VerifyDbGuardEnv,
): ParsedDatabaseUrl {
  if (env.LM_VERIFY_WITH_DB !== '1') {
    throw new DbResetGuardError(
      `Refusing database integration: set ${LM_VERIFY_WITH_DB}=1 or pass --with-db to verify:local.`,
    );
  }

  const target = parseDatabaseUrl(databaseUrl);

  if (!isAllowedResetHost(target.host)) {
    throw new DbResetGuardError(
      `Refusing verify DB: host "${target.host}" is not an allowlisted loopback/compose host.`,
    );
  }

  if (!isAllowedVerifyDatabaseName(target.database)) {
    throw new DbResetGuardError(
      `Refusing verify DB: database "${target.database}" must be a disposable test name ` +
        '(little_minds_test | little_minds_ci | little_minds_local | little_minds_dev). ' +
        'Do not point verify:local at the default little_minds dev database.',
    );
  }

  return target;
}

function main(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required when LM_VERIFY_WITH_DB=1');
    process.exit(1);
  }
  try {
    const target = assertSafeVerifyDbTarget(url, process.env as VerifyDbGuardEnv);
    console.log(JSON.stringify({ ok: true, host: target.host, database: target.database }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Refusing verify DB: unknown guard error';
    console.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
