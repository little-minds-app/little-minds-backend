import {
  REDACTED,
  allowlistAndRedactContext,
  redactSecrets,
  redactUrlCredentials,
} from './redact';

describe('redactSecrets', () => {
  it('redacts known secret keys', () => {
    const out = redactSecrets({
      APP_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/little_minds',
      POSTGRES_PASSWORD: 'postgres',
    }) as Record<string, unknown>;

    expect(out.APP_ENV).toBe('development');
    expect(out.DATABASE_URL).toBe(REDACTED);
    expect(out.POSTGRES_PASSWORD).toBe(REDACTED);
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
    expect(out.apiToken).toBe(REDACTED);
    expect(out.nested.jwtSecret).toBe(REDACTED);
  });

  it('redacts Authorization headers and bearer tokens', () => {
    const out = redactSecrets({
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig',
        'content-type': 'application/json',
      },
      cookie: 'session=abc',
    }) as {
      headers: { authorization: string; 'content-type': string };
      cookie: string;
    };

    expect(out.headers.authorization).toBe(REDACTED);
    expect(out.headers['content-type']).toBe('application/json');
    expect(out.cookie).toBe(REDACTED);
  });

  it('redacts child and parent PII field names', () => {
    const out = redactSecrets({
      childName: 'Ada',
      first_name: 'Parent',
      birthDate: '2020-01-01',
      phone: '+905551112233',
      email: 'parent@example.invalid',
      otp: '123456',
      play_session_id: 'ok-to-keep',
    }) as Record<string, string>;

    expect(out.childName).toBe(REDACTED);
    expect(out.first_name).toBe(REDACTED);
    expect(out.birthDate).toBe(REDACTED);
    expect(out.phone).toBe(REDACTED);
    expect(out.email).toBe(REDACTED);
    expect(out.otp).toBe(REDACTED);
    expect(out.play_session_id).toBe('ok-to-keep');
  });

  it('redacts raw JWT and Bearer string values under benign keys', () => {
    const out = redactSecrets({
      note: 'Bearer super-secret-token',
      compact: 'eyJhbGciOiJIUzI1NiJ9.e30.signaturepart',
    }) as Record<string, string>;
    expect(out.note).toBe(REDACTED);
    expect(out.compact).toBe(REDACTED);
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

describe('allowlistAndRedactContext', () => {
  it('drops non-allowlisted keys and redacts residual secrets', () => {
    const out = allowlistAndRedactContext({
      method: 'GET',
      path: '/health',
      status_code: 200,
      authorization: 'Bearer leak',
      childName: 'should-drop',
      body: { password: 'nope' },
    });

    expect(out).toEqual({
      method: 'GET',
      path: '/health',
      status_code: 200,
    });
    expect(JSON.stringify(out)).not.toMatch(/Bearer|leak|password|should-drop/i);
  });
});
