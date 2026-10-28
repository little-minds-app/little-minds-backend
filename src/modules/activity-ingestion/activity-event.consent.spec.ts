import {
  collectConsentAuthorizationIssues,
  collectSessionConsentAuthorizationIssues,
  isClientDecisionMasqueradingAsServerRecord,
  isConsentScopeAuthorized,
  isConsentScopeBlocked,
} from './activity-event.consent';
import type {
  ActivitySessionV1,
  ServerConsentRecord,
} from './activity-contract.types';

const SCOPE = 'essential_play_events' as const;

describe('Consent authorization hardening (LMP-50)', () => {
  const serverGranted: ServerConsentRecord = {
    purpose: SCOPE,
    consent_scope: SCOPE,
    status: 'granted',
    policy_version: 'privacy-notice-draft-0',
    source: 'server_consent_store',
  };

  const serverWithdrawn: ServerConsentRecord = {
    ...serverGranted,
    status: 'withdrawn',
  };

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

  it('client decision:granted never overrides withdrawn/denied server status', () => {
    expect(
      isConsentScopeAuthorized(SCOPE, [serverWithdrawn], {
        clientDeclaredDecision: 'granted',
      }),
    ).toBe(false);
    expect(
      isConsentScopeAuthorized(
        SCOPE,
        [{ ...serverGranted, status: 'denied' }],
        { clientDeclaredDecision: 'granted' },
      ),
    ).toBe(false);
  });

  it('only authoritative server sources can grant', () => {
    expect(isConsentScopeAuthorized(SCOPE, [serverGranted])).toBe(true);
    expect(
      isConsentScopeAuthorized(SCOPE, [
        { ...serverGranted, source: 'sync_scope_grant' },
      ]),
    ).toBe(true);

    // Forged / missing authoritative source — cast to bypass TS and prove runtime reject
    const forged = {
      purpose: SCOPE,
      consent_scope: SCOPE,
      status: 'granted' as const,
      policy_version: 'privacy-notice-draft-0',
      source: 'client_decision' as unknown as ServerConsentRecord['source'],
    };
    expect(isConsentScopeAuthorized(SCOPE, [forged])).toBe(false);
    expect(isClientDecisionMasqueradingAsServerRecord(forged)).toBe(true);
    expect(
      isClientDecisionMasqueradingAsServerRecord({
        decision: 'granted',
        consent_scope: SCOPE,
      }),
    ).toBe(true);
    expect(isClientDecisionMasqueradingAsServerRecord(serverGranted)).toBe(
      false,
    );
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
      collectSessionConsentAuthorizationIssues(session, [serverWithdrawn])
        .length,
    ).toBeGreaterThan(0);
    expect(
      collectSessionConsentAuthorizationIssues(session, [serverGranted]),
    ).toEqual([]);
  });
});
