import {
  ALLOWED_RESET_HOSTS,
  DbResetGuardError,
  assertSafeResetTarget,
  isAllowedResetDatabaseName,
  isAllowedResetHost,
  parseDatabaseUrl,
} from './db-reset-guard';

const approved = { LM_CONFIRM_DB_RESET: '1' } as const;

describe('db-reset-guard (LMP-22 safety)', () => {
  describe('parseDatabaseUrl', () => {
    it('parses host and database from a standard local URL', () => {
      expect(
        parseDatabaseUrl(
          'postgresql://postgres:postgres@127.0.0.1:5432/little_minds?schema=public',
        ),
      ).toEqual({
        host: '127.0.0.1',
        port: '5432',
        database: 'little_minds',
      });
    });

    it('does not treat localhost in the query string as the host', () => {
      const parsed = parseDatabaseUrl(
        'postgresql://user:pass@db.prod.example.com:5432/little_minds?note=localhost',
      );
      expect(parsed.host).toBe('db.prod.example.com');
      expect(parsed.database).toBe('little_minds');
    });

    it('does not treat a username of localhost as the host', () => {
      const parsed = parseDatabaseUrl(
        'postgresql://localhost:secret@evil.example.com:5432/little_minds',
      );
      expect(parsed.host).toBe('evil.example.com');
    });

    it('rejects non-postgres schemes', () => {
      expect(() => parseDatabaseUrl('mysql://127.0.0.1:3306/little_minds')).toThrow(
        DbResetGuardError,
      );
    });
  });

  describe('allowlists', () => {
    it('allows only exact loopback/compose hosts', () => {
      expect(isAllowedResetHost('127.0.0.1')).toBe(true);
      expect(isAllowedResetHost('localhost')).toBe(true);
      expect(isAllowedResetHost('::1')).toBe(true);
      expect(isAllowedResetHost('postgres')).toBe(true);
      expect(isAllowedResetHost('evil-localhost.com')).toBe(false);
      expect(isAllowedResetHost('db.prod.example.com')).toBe(false);
      expect(ALLOWED_RESET_HOSTS.has('localhost')).toBe(true);
    });

    it('allows only synthetic database names', () => {
      expect(isAllowedResetDatabaseName('little_minds')).toBe(true);
      expect(isAllowedResetDatabaseName('little_minds_test')).toBe(true);
      expect(isAllowedResetDatabaseName('little_minds_dev')).toBe(true);
      expect(isAllowedResetDatabaseName('little_minds_ci')).toBe(true);
      expect(isAllowedResetDatabaseName('little_minds_local')).toBe(true);
      expect(isAllowedResetDatabaseName('production')).toBe(false);
      expect(isAllowedResetDatabaseName('little_minds_prod')).toBe(false);
      expect(isAllowedResetDatabaseName('postgres')).toBe(false);
    });
  });

  describe('assertSafeResetTarget', () => {
    it('allows CI-style localhost little_minds with explicit confirmation', () => {
      expect(
        assertSafeResetTarget(
          'postgresql://postgres:postgres@localhost:5432/little_minds?schema=public',
          approved,
        ),
      ).toMatchObject({ host: 'localhost', database: 'little_minds' });
    });

    it('allows 127.0.0.1 with confirmation', () => {
      expect(
        assertSafeResetTarget(
          'postgresql://postgres:postgres@127.0.0.1:5432/little_minds',
          approved,
        ).host,
      ).toBe('127.0.0.1');
    });

    it('allows compose service host postgres with confirmation', () => {
      expect(
        assertSafeResetTarget(
          'postgresql://postgres:postgres@postgres:5432/little_minds',
          approved,
        ).host,
      ).toBe('postgres');
    });

    it('denies reset without LM_CONFIRM_DB_RESET even for localhost', () => {
      expect(() =>
        assertSafeResetTarget(
          'postgresql://postgres:postgres@localhost:5432/little_minds',
          {},
        ),
      ).toThrow(/LM_CONFIRM_DB_RESET=1/);
    });

    it('denies remote hosts even when confirmation is set', () => {
      expect(() =>
        assertSafeResetTarget(
          'postgresql://postgres:postgres@db.prod.example.com:5432/little_minds',
          approved,
        ),
      ).toThrow(/default-denied|not an allowlisted/i);
    });

    it('denies remote hosts that embed localhost only in the query', () => {
      expect(() =>
        assertSafeResetTarget(
          'postgresql://u:p@remote.example.com/little_minds?x=localhost',
          approved,
        ),
      ).toThrow(/default-denied|not an allowlisted/i);
    });

    it('denies evil-localhost.com hostname', () => {
      expect(() =>
        assertSafeResetTarget(
          'postgresql://u:p@evil-localhost.com:5432/little_minds',
          approved,
        ),
      ).toThrow(/not an allowlisted/i);
    });

    it('denies allowlisted host with non-synthetic database name', () => {
      expect(() =>
        assertSafeResetTarget(
          'postgresql://postgres:postgres@127.0.0.1:5432/production',
          approved,
        ),
      ).toThrow(/allowlisted synthetic name/i);
    });

    it('denies production-like database suffix on loopback', () => {
      expect(() =>
        assertSafeResetTarget(
          'postgresql://postgres:postgres@localhost:5432/little_minds_prod',
          approved,
        ),
      ).toThrow(/allowlisted synthetic name/i);
    });
  });
});
