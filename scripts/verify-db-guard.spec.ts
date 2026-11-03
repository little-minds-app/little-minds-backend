import { DbResetGuardError } from './db-reset-guard';
import {
  assertSafeVerifyDbTarget,
  isAllowedVerifyDatabaseName,
} from './verify-db-guard';

describe('verify-db-guard (LMP-132)', () => {
  const approved = { LM_VERIFY_WITH_DB: '1' } as const;
  const localTestUrl =
    'postgresql://postgres:postgres@127.0.0.1:5432/little_minds_ci?schema=public';

  it('allows disposable ci/test database names only', () => {
    expect(isAllowedVerifyDatabaseName('little_minds_ci')).toBe(true);
    expect(isAllowedVerifyDatabaseName('little_minds_test')).toBe(true);
    expect(isAllowedVerifyDatabaseName('little_minds')).toBe(false);
  });

  it('denies without LM_VERIFY_WITH_DB opt-in', () => {
    expect(() => assertSafeVerifyDbTarget(localTestUrl, {})).toThrow(/LM_VERIFY_WITH_DB=1/);
  });

  it('denies default dev database name even when opted in', () => {
    expect(() =>
      assertSafeVerifyDbTarget(
        'postgresql://postgres:postgres@127.0.0.1:5432/little_minds?schema=public',
        approved,
      ),
    ).toThrow(/disposable test name/);
  });

  it('accepts opted-in local ci database URL', () => {
    expect(assertSafeVerifyDbTarget(localTestUrl, approved).database).toBe('little_minds_ci');
  });

  it('denies remote hosts', () => {
    expect(() =>
      assertSafeVerifyDbTarget(
        'postgresql://u:p@db.prod.example.com:5432/little_minds_ci',
        approved,
      ),
    ).toThrow(/allowlisted loopback/);
  });

  it('surfaces parse errors as guard errors', () => {
    expect(() => assertSafeVerifyDbTarget('not-a-url', approved)).toThrow(DbResetGuardError);
  });
});
