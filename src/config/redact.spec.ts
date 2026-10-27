import { redactSecrets, redactUrlCredentials } from './redact';

describe('redactSecrets', () => {
  it('redacts known secret keys', () => {
    const out = redactSecrets({
      APP_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/little_minds',
      POSTGRES_PASSWORD: 'postgres',
    }) as Record<string, unknown>;

    expect(out.APP_ENV).toBe('development');
    expect(out.DATABASE_URL).toBe('[REDACTED]');
    expect(out.POSTGRES_PASSWORD).toBe('[REDACTED]');
  });

  it('masks credentials embedded in non-secret URL fields', () => {
    const out = redactSecrets({
      callback: 'https://user:topsecret@hooks.example.invalid/path',
    }) as Record<string, string>;

    expect(out.callback).toContain('***');
    expect(out.callback).not.toContain('topsecret');
  });

  it('redacts keys that look like secrets by name', () => {
    const out = redactSecrets({ apiToken: 'abc', nested: { jwtSecret: 'x' } }) as {
      apiToken: string;
      nested: { jwtSecret: string };
    };
    expect(out.apiToken).toBe('[REDACTED]');
    expect(out.nested.jwtSecret).toBe('[REDACTED]');
  });
});

describe('redactUrlCredentials', () => {
  it('masks userinfo in postgres URLs', () => {
    const redacted = redactUrlCredentials(
      'postgresql://postgres:postgres@localhost:5432/little_minds?schema=public',
    );
    expect(redacted).not.toContain('postgres:postgres');
    expect(redacted).toContain('localhost');
    expect(redacted).toContain('little_minds');
  });
});
