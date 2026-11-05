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

  it('allows batch admission diagnostics and drops smuggled secrets', () => {
    const out = allowlistAndRedactContext({
      batch_reject_code: 'batch.invalid_event',
      validation_issue_count: 2,
      validation_issues: [
        { code: 'schema.pattern', path: 'device_id' },
        { code: 'schema.required', path: 'event_type' },
      ],
      authorization: 'Bearer leak',
      parent_id: '11111111-1111-4111-8111-111111111111',
      email: 'parent@example.invalid',
    });

    expect(out).toEqual({
      batch_reject_code: 'batch.invalid_event',
      validation_issue_count: 2,
      validation_issues: [
        { code: 'schema.pattern', path: 'device_id' },
        { code: 'schema.required', path: 'event_type' },
      ],
    });
    expect(JSON.stringify(out)).not.toMatch(/Bearer|leak|parent@/i);
  });

  it('allows LMP-134 ingest batch summary counts without wire identifiers', () => {
    const out = allowlistAndRedactContext({
      ingest_sessions_wire: 1,
      ingest_events_wire: 3,
      ingest_sessions_admitted: 0,
      ingest_session_skip_counts: { 'device.not_authorized': 1 },
      ingest_ack_status_counts: { retryable: 3 },
      ingest_retryable_reason_counts: { 'session.pending': 3 },
      play_session_id: '55555555-5555-4555-8555-555555555555',
      device_id: '3d15ad77-4bd6-50b8-9422-3db5738c39f1',
    });

    expect(out).toEqual({
      ingest_sessions_wire: 1,
      ingest_events_wire: 3,
      ingest_sessions_admitted: 0,
      ingest_session_skip_counts: { 'device.not_authorized': 1 },
      ingest_ack_status_counts: { retryable: 3 },
      ingest_retryable_reason_counts: { 'session.pending': 3 },
    });
  });
});
