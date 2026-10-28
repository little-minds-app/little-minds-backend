import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { activityFixturesDir } from './activity-contract.paths';
import {
  ACTIVITY_SCHEMA_VERSION,
  type ActivitySessionV1,
} from './activity-contract.types';
import { validateActivitySession } from './activity-session.validator';

const FIXTURES = activityFixturesDir();

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
}

function baseSession(): ActivitySessionV1 {
  return loadFixture('valid-activity-session.json') as ActivitySessionV1;
}

describe('ActivitySessionV1 validation (LMP-50)', () => {
  it('accepts valid session fixture', () => {
    const result = validateActivitySession(baseSession());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.schema_version).toBe(ACTIVITY_SCHEMA_VERSION);
      expect(result.session.play_session_id).toMatch(/^[0-9a-fA-F-]{36}$/);
    }
  });

  it('TC-EV-019 rejects unknown schema_version', () => {
    const session = { ...baseSession(), schema_version: '2.0.0' };
    const result = validateActivitySession(session);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((i) => i.code === 'schema.version_incompatible'),
      ).toBe(true);
    }
  });

  it('TC-EV-020 rejects ended_at < started_at', () => {
    const session = {
      ...baseSession(),
      started_at: '2026-10-28T06:01:24.000Z',
      ended_at: '2026-10-28T06:00:00.000Z',
    };
    const result = validateActivitySession(session);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((i) => i.code === 'session.ended_before_started'),
      ).toBe(true);
    }
  });

  it('rejects client child_id and received_at on session', () => {
    const withChild = {
      ...baseSession(),
      child_id: '018f0000-0000-4000-8000-000000000099',
    };
    const withReceived = {
      ...baseSession(),
      received_at: '2026-10-28T06:02:00.000Z',
    };
    expect(validateActivitySession(withChild).ok).toBe(false);
    expect(validateActivitySession(withReceived).ok).toBe(false);
  });

  it('rejects unknown top-level properties', () => {
    const session = { ...baseSession(), analytics_sdk: 'segment' };
    expect(validateActivitySession(session).ok).toBe(false);
  });

  it('rejects non-UUID play_session_id', () => {
    const session = { ...baseSession(), play_session_id: 'session-local' };
    expect(validateActivitySession(session).ok).toBe(false);
  });

  it('documents that consent.decision granted is not authorization', () => {
    const session = baseSession();
    expect(session.consent.decision).toBe('granted');
    // Shape validation succeeds; authorization is a separate server-consent check.
    expect(validateActivitySession(session).ok).toBe(true);
  });

  it('rejects session when serverConsentRecords deny despite client decision granted', () => {
    const session = baseSession();
    expect(session.consent.decision).toBe('granted');
    const result = validateActivitySession(session, {
      serverConsentRecords: [
        {
          purpose: 'essential_play_events',
          consent_scope: 'essential_play_events',
          status: 'withdrawn',
          policy_version: 'privacy-notice-draft-0',
          source: 'server_consent_store',
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((i) => i.code === 'consent.unauthorized_scope'),
      ).toBe(true);
    }
  });

  it('accepts session only with authoritative server grant (ignores client decision)', () => {
    const session = baseSession();
    const deniedClient = {
      ...session,
      consent: { ...session.consent, decision: 'denied' as const },
    };
    const result = validateActivitySession(deniedClient, {
      serverConsentRecords: [
        {
          purpose: 'essential_play_events',
          consent_scope: 'essential_play_events',
          status: 'granted',
          policy_version: 'privacy-notice-draft-0',
          source: 'sync_scope_grant',
        },
      ],
    });
    expect(result.ok).toBe(true);
  });
});
