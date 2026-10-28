import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { activityFixturesDir } from './activity-contract.paths';
import {
  ACTIVITY_EVENT_TYPES,
  ACTIVITY_SCHEMA_VERSION,
  type ActivityEventV1,
  type ServerConsentRecord,
} from './activity-contract.types';
import { acknowledgeEventIdempotency } from './activity-event.idempotency';
import {
  assertNoQaAccuracyPersonalization,
  CONTENT_QA_ONLY_PAYLOAD_KEYS,
} from './activity-event.firewall';
import {
  isConsentScopeAuthorized,
  isConsentScopeBlocked,
} from './activity-event.consent';
import {
  isKnownActivityEventType,
  validateActivityEvent,
} from './activity-event.validator';
import { adaptNearFarFixtureToActivityEventV1 } from './near-far-compat';

const FIXTURES = activityFixturesDir();

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
}

function baseCompleted(): ActivityEventV1 {
  return loadFixture('valid-activity-completed.json') as ActivityEventV1;
}

describe('ActivityEventV1 validation (LMP-50)', () => {
  it('TC-EV-001 accepts valid activity_completed envelope + payload', () => {
    const result = validateActivityEvent(baseCompleted());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.schema_version).toBe(ACTIVITY_SCHEMA_VERSION);
      expect(result.event.event_type).toBe('activity_completed');
    }
  });

  it('accepts UUIDv4 and UUIDv7 ids', () => {
    const v4 = {
      ...baseCompleted(),
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      play_session_id: '550e8400-e29b-41d4-a716-446655440001',
    };
    const v7 = baseCompleted();
    expect(validateActivityEvent(v4).ok).toBe(true);
    expect(validateActivityEvent(v7).ok).toBe(true);
  });

  it('TC-EV-002 rejects unknown event_type', () => {
    const event = { ...baseCompleted(), event_type: 'content_started' };
    const result = validateActivityEvent(event);
    expect(result.ok).toBe(false);
    expect(isKnownActivityEventType('content_started')).toBe(false);
    expect(ACTIVITY_EVENT_TYPES).not.toContain('content_started');
  });

  it('TC-EV-003 rejects missing event_id / play_session_id / content_version_id', () => {
    for (const key of ['event_id', 'play_session_id', 'content_version_id']) {
      const event = { ...baseCompleted() } as Record<string, unknown>;
      delete event[key];
      const result = validateActivityEvent(event);
      expect(result.ok).toBe(false);
    }
  });

  it('TC-EV-004 rejects non-UUID ids', () => {
    const event = { ...baseCompleted(), event_id: 'nf-local-abc' };
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-005 rejects non-UTC / naive timestamps', () => {
    const naive = { ...baseCompleted(), occurred_at: '2026-10-28T06:01:24' };
    const offset = {
      ...baseCompleted(),
      occurred_at: '2026-10-28T06:01:24+03:00',
    };
    expect(validateActivityEvent(naive).ok).toBe(false);
    expect(validateActivityEvent(offset).ok).toBe(false);
  });

  it('TC-EV-006 rejects duration-bearing event without monotonic_duration_seconds', () => {
    const event = { ...baseCompleted() } as Record<string, unknown>;
    delete event.monotonic_duration_seconds;
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-007 rejects negative monotonic duration', () => {
    const event = { ...baseCompleted(), monotonic_duration_seconds: -1 };
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-008 rejects payload with child_name / email / phone', () => {
    const withName = {
      ...baseCompleted(),
      payload: { ...baseCompleted().payload, child_name: 'Ada' },
    };
    const withEmail = {
      ...baseCompleted(),
      payload: { ...baseCompleted().payload, contact: 'a@b.co' },
    };
    const withPhone = {
      ...baseCompleted(),
      payload: { ...baseCompleted().payload, phone: '+905551112233' },
    };
    expect(validateActivityEvent(withName).ok).toBe(false);
    expect(validateActivityEvent(withEmail).ok).toBe(false);
    expect(validateActivityEvent(withPhone).ok).toBe(false);
  });

  it('TC-EV-009 rejects raw touch / pointer / coordinates keys', () => {
    const event = {
      ...baseCompleted(),
      payload: { ...baseCompleted().payload, touch_path: [1, 2] },
    };
    const result = validateActivityEvent(event);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code.startsWith('privacy.'))).toBe(
        true,
      );
    }
  });

  it('TC-EV-010 rejects photo / microphone / data-URL media', () => {
    const event = {
      ...baseCompleted(),
      payload: {
        ...baseCompleted().payload,
        avatar: 'data:image/png;base64,aaaa',
      },
    };
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-011 rejects precise location / advertising_id', () => {
    const loc = {
      ...baseCompleted(),
      payload: { ...baseCompleted().payload, precise_location: true },
    };
    const ad = {
      ...baseCompleted(),
      payload: { ...baseCompleted().payload, advertising_id: 'x' },
    };
    expect(validateActivityEvent(loc).ok).toBe(false);
    expect(validateActivityEvent(ad).ok).toBe(false);
  });

  it('TC-EV-012 rejects unrestricted free-text note field', () => {
    const event = {
      ...baseCompleted(),
      payload: {
        ...baseCompleted().payload,
        notes: 'Child said hello and waved',
      },
    };
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-013 rejects unexpected nested object under payload', () => {
    const event = {
      ...baseCompleted(),
      payload: {
        ...baseCompleted().payload,
        mentor_adjacency: { near: true },
      },
    };
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-014 rejects missing consent_scope', () => {
    const event = { ...baseCompleted() } as Record<string, unknown>;
    delete event.consent_scope;
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-015 rejects optional scope without server grant (client decision ignored)', () => {
    const event = {
      ...baseCompleted(),
      consent_scope: 'optional_product_analytics' as const,
    };
    const server: ServerConsentRecord[] = [
      {
        purpose: 'optional_product_analytics',
        consent_scope: 'optional_product_analytics',
        status: 'withdrawn',
        policy_version: 'privacy-notice-draft-0',
      },
    ];
    const result = validateActivityEvent(event, {
      serverConsentRecords: server,
      clientConsentDecision: 'granted',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((i) => i.code === 'consent.unauthorized_scope'),
      ).toBe(true);
    }
    expect(
      isConsentScopeAuthorized('optional_product_analytics', server, {
        clientDecision: 'granted',
      }),
    ).toBe(false);
    expect(isConsentScopeBlocked('optional_product_analytics', server)).toBe(
      true,
    );
  });

  it('TC-EV-016 rejects missing provenance / invalid actor_scope', () => {
    const missing = { ...baseCompleted() } as Record<string, unknown>;
    delete missing.provenance;
    expect(validateActivityEvent(missing).ok).toBe(false);

    const badScope = {
      ...baseCompleted(),
      provenance: {
        ...baseCompleted().provenance,
        actor_scope: 'admin' as unknown as 'child_play',
      },
    };
    expect(validateActivityEvent(badScope).ok).toBe(false);
  });

  it('TC-EV-017 duplicate event_id is idempotent no-op (helper; no live ingest)', () => {
    const id = baseCompleted().event_id;
    const persisted = new Set([id]);
    expect(acknowledgeEventIdempotency(id, persisted)).toEqual({
      event_id: id,
      status: 'duplicate_noop',
    });
    expect(acknowledgeEventIdempotency('018f0000-0000-7000-8000-000000000099', persisted).status).toBe(
      'accepted',
    );
  });

  it('TC-EV-018 late/out-of-order occurred_at accepted at schema layer (ingest quality flags deferred)', () => {
    const late = {
      ...baseCompleted(),
      occurred_at: '2020-01-01T00:00:00.000Z',
    };
    expect(validateActivityEvent(late).ok).toBe(true);
  });

  it('TC-EV-023 accepts mission_feedback_submitted under parent scope without play_session_id', () => {
    const event = loadFixture('valid-mission-feedback-parent.json');
    const result = validateActivityEvent(event);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.provenance.actor_scope).toBe('parent');
      expect(result.event.play_session_id).toBeUndefined();
    }
  });

  it('rejects client received_at and child_id', () => {
    const withReceived = {
      ...baseCompleted(),
      received_at: '2026-10-28T06:02:00.000Z',
    };
    const withChild = { ...baseCompleted(), child_id: baseCompleted().event_id };
    expect(validateActivityEvent(withReceived).ok).toBe(false);
    expect(validateActivityEvent(withChild).ok).toBe(false);
  });

  it('rejects unknown top-level properties', () => {
    const event = { ...baseCompleted(), extra_field: true };
    expect(validateActivityEvent(event).ok).toBe(false);
  });

  it('TC-EV-021 Near/Far fixture golden → adapter → V1 documents deltas', () => {
    const raw = loadFixture('near-far-compat-raw.json') as Record<
      string,
      unknown
    >;
    const adapted = adaptNearFarFixtureToActivityEventV1(raw);
    expect(adapted.deltas.length).toBeGreaterThan(0);
    expect(adapted.deltas.some((d) => d.includes('event_id'))).toBe(true);
    expect(adapted.deltas.some((d) => d.includes('schema_version'))).toBe(true);
    expect(adapted.deltas.some((d) => d.includes('mentor_adjacency'))).toBe(
      true,
    );
    expect(adapted.validationIssues).toEqual([]);
    expect(adapted.normalized?.schema_version).toBe(ACTIVITY_SCHEMA_VERSION);
  });

  it('TC-EV-024 firewall: QA accuracy keys must not feed recommendation modules', () => {
    const okAnalytics = assertNoQaAccuracyPersonalization(
      'src/modules/activity-ingestion/',
      [...CONTENT_QA_ONLY_PAYLOAD_KEYS],
    );
    expect(okAnalytics.ok).toBe(true);

    const blocked = assertNoQaAccuracyPersonalization(
      'src/modules/learning-recommendation/',
      ['eligible_first_attempts'],
    );
    expect(blocked.ok).toBe(false);
  });

  it('covers §14.1 allowlist membership', () => {
    expect(ACTIVITY_EVENT_TYPES).toHaveLength(13);
    expect(isKnownActivityEventType('activity_started')).toBe(true);
    expect(isKnownActivityEventType('mentor_card_opened')).toBe(true);
  });
});
