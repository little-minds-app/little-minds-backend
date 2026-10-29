import { allowlistAndRedactContext, redactSecrets } from './redact';

describe('auth privacy redaction (LMP-33)', () => {
  it('redacts JWT and refresh material', () => {
    const jwt =
      'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiIxIn0.signature';
    expect(redactSecrets({ access_token: jwt })).toEqual({
      access_token: '[REDACTED]',
    });
    expect(redactSecrets({ refresh_token: 'lmr1.abc' })).toEqual({
      refresh_token: '[REDACTED]',
    });
    expect(redactSecrets(`Bearer ${jwt}`)).toBe('[REDACTED]');
  });

  it('drops raw parent_id from structured allowlist projection', () => {
    const projected = allowlistAndRedactContext({
      session_event: 'auth_failed',
      session_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      parent_id: '11111111-1111-4111-8111-111111111111',
      access_token: 'secret',
    });
    expect(projected).toEqual({
      session_event: 'auth_failed',
      session_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
  });

  it('allows LMP-36 link audit context without parent_id / subject leak', () => {
    const projected = allowlistAndRedactContext({
      link_event: 'account_link_collision',
      link_outcome: 'collision_other_parent',
      link_provider: 'apple',
      parent_id: '11111111-1111-4111-8111-111111111111',
      provider_subject: 'raw-sub-must-drop',
    });
    expect(projected).toEqual({
      link_event: 'account_link_collision',
      link_outcome: 'collision_other_parent',
      link_provider: 'apple',
    });
  });
});

