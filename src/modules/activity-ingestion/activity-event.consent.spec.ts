import {
  collectConsentAuthorizationIssues,
  collectSessionConsentAuthorizationIssues,
  evaluateConsentScopeAuthorization,
  isClientDecisionMasqueradingAsServerRecord,
  isConsentScopeAuthorized,
  isConsentScopeBlocked,
} from './activity-event.consent';
import type {
  ActivitySessionV1,
  ServerConsentRecord,
} from './activity-contract.types';

const SCOPE = 'essential_play_events' as const;

function record(
  partial: Partial<ServerConsentRecord> &
    Pick<ServerConsentRecord, 'status' | 'effective_at'>,
): ServerConsentRecord {
  return {
    purpose: SCOPE,
    consent_scope: SCOPE,
    policy_version: 'privacy-notice-draft-0',
    source: 'server_consent_store',
    ...partial,
  };
}

describe('Consent authorization hardening (LMP-50)', () => {
  it('client decision:granted never authorizes with empty server records', () => {
    expect(
      isConsentScopeAuthorized(SCOPE, [], {
        clientDeclaredDecision: 'granted',
      }),
    ).toBe(false);
    expect(
      isConsentScopeBlocked(SCOPE, [], { clientDeclaredDecision: 'granted' }),
    ).toBe(true);
    expect(
      collectConsentAuthorizationIssues(SCOPE, [], {
        clientDeclaredDecision: 'granted',
      }),
    ).toEqual([
      expect.objectContaining({ code: 'consent.unauthorized_scope' }),
    ]);
  });

  it('grant→withdraw: newer withdrawal beats older grant', () => {
    const rows: ServerConsentRecord[] = [
      record({
        status: 'granted',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 1,
      }),
      record({
        status: 'withdrawn',
        effective_at: '2026-10-02T00:00:00.000Z',
        revision: 2,
      }),
    ];
    expect(isConsentScopeAuthorized(SCOPE, rows)).toBe(false);
    expect(evaluateConsentScopeAuthorization(SCOPE, rows).reason).toBe(
      'not_granted',
    );
  });

  it('withdraw→stale grant backfill: older grant does not re-authorize (LMP-134 suite isolation)', () => {
    // Mirrors the broken db-spec cleanup that wrote recordedAt=2026-03-11 after
    // a live withdrawal: latest-effective remains withdrawn → KPI by_activity empty.
    const rows: ServerConsentRecord[] = [
      record({
        status: 'withdrawn',
        effective_at: '2026-11-05T17:00:00.000Z',
        policy_version: 'synthetic-policy-v1',
      }),
      record({
        status: 'granted',
        effective_at: '2026-03-11T00:00:00.000Z',
        policy_version: 'synthetic-policy-v1',
      }),
    ];
    expect(isConsentScopeAuthorized(SCOPE, rows)).toBe(false);
    expect(evaluateConsentScopeAuthorization(SCOPE, rows).reason).toBe(
      'not_granted',
    );
  });

  it('withdraw→fresh grant: newer grant authorizes', () => {
    const rows: ServerConsentRecord[] = [
      record({
        status: 'withdrawn',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 1,
      }),
      record({
        status: 'granted',
        effective_at: '2026-10-03T00:00:00.000Z',
        revision: 2,
      }),
    ];
    expect(isConsentScopeAuthorized(SCOPE, rows)).toBe(true);
    expect(evaluateConsentScopeAuthorization(SCOPE, rows).effective?.revision).toBe(
      2,
    );
  });

  it('same-version conflict with differing status is denied', () => {
    const rows: ServerConsentRecord[] = [
      record({
        status: 'granted',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 5,
        source: 'server_consent_store',
      }),
      record({
        status: 'denied',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 5,
        source: 'server_consent_store',
      }),
    ];
    const evalResult = evaluateConsentScopeAuthorization(SCOPE, rows);
    expect(evalResult.authorized).toBe(false);
    expect(evalResult.reason).toBe('conflict');
    expect(
      collectConsentAuthorizationIssues(SCOPE, rows)[0]?.code,
    ).toBe('consent.conflict');
  });

  it('server_consent_store beats sync_scope_grant at equal effective_at/revision', () => {
    const rows: ServerConsentRecord[] = [
      record({
        status: 'withdrawn',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 3,
        source: 'server_consent_store',
      }),
      record({
        status: 'granted',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 3,
        source: 'sync_scope_grant',
      }),
    ];
    // store withdrawn outranks sync grant at the same ordering key
    expect(isConsentScopeAuthorized(SCOPE, rows)).toBe(false);
    expect(evaluateConsentScopeAuthorization(SCOPE, rows).effective?.source).toBe(
      'server_consent_store',
    );
  });

  it('missing ordering metadata fails closed', () => {
    const missingTime = [
      {
        purpose: SCOPE,
        consent_scope: SCOPE,
        status: 'granted' as const,
        policy_version: 'privacy-notice-draft-0',
        source: 'server_consent_store' as const,
        effective_at: '',
      },
    ];
    expect(isConsentScopeAuthorized(SCOPE, missingTime)).toBe(false);
    expect(evaluateConsentScopeAuthorization(SCOPE, missingTime).reason).toBe(
      'missing_ordering',
    );

    const badOffset = [
      record({
        status: 'granted',
        effective_at: '2026-10-01T00:00:00+03:00' as unknown as string,
      }),
    ];
    expect(
      evaluateConsentScopeAuthorization(SCOPE, badOffset).reason,
    ).toBe('missing_ordering');
  });

  it('forged / unknown sources fail closed', () => {
    const forged = [
      {
        purpose: SCOPE,
        consent_scope: SCOPE,
        status: 'granted' as const,
        policy_version: 'privacy-notice-draft-0',
        source: 'client_decision' as unknown as ServerConsentRecord['source'],
        effective_at: '2026-10-01T00:00:00.000Z',
      },
    ];
    expect(isConsentScopeAuthorized(SCOPE, forged)).toBe(false);
    expect(evaluateConsentScopeAuthorization(SCOPE, forged).reason).toBe(
      'forged_or_unknown_source',
    );
    expect(isClientDecisionMasqueradingAsServerRecord(forged[0])).toBe(true);
    expect(
      isClientDecisionMasqueradingAsServerRecord({
        decision: 'granted',
        consent_scope: SCOPE,
      }),
    ).toBe(true);
  });

  it('any historical grant does not authorize after later denial', () => {
    const rows: ServerConsentRecord[] = [
      record({
        status: 'granted',
        effective_at: '2026-09-01T00:00:00.000Z',
        revision: 1,
      }),
      record({
        status: 'granted',
        effective_at: '2026-09-15T00:00:00.000Z',
        revision: 2,
      }),
      record({
        status: 'denied',
        effective_at: '2026-10-01T00:00:00.000Z',
        revision: 3,
      }),
    ];
    expect(isConsentScopeAuthorized(SCOPE, rows)).toBe(false);
  });

  it('session consent.decision granted is ignored by authorization hook', () => {
    const session = {
      consent: {
        purpose: 'essential_service_telemetry',
        policy_version: 'privacy-notice-draft-0',
        consent_scope: SCOPE,
        decision: 'granted' as const,
      },
    } satisfies Pick<ActivitySessionV1, 'consent'>;

    expect(
      collectSessionConsentAuthorizationIssues(session, []).length,
    ).toBeGreaterThan(0);
    expect(
      collectSessionConsentAuthorizationIssues(session, [
        record({
          status: 'withdrawn',
          effective_at: '2026-10-02T00:00:00.000Z',
          revision: 2,
        }),
      ]).length,
    ).toBeGreaterThan(0);
    expect(
      collectSessionConsentAuthorizationIssues(session, [
        record({
          status: 'granted',
          effective_at: '2026-10-02T00:00:00.000Z',
          revision: 2,
        }),
      ]),
    ).toEqual([]);
  });
});
