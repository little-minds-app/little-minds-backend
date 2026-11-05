import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ActivityBatchAdmissionService,
} from './activity-batch-admission.service';
import { scopedDeviceId } from '../identity/session/session-issuer.service';
import { noopStructuredLogger } from '../../../test/helpers/noop-structured-logger';
import {
  loadShapeMatchingWireJson,
  SHAPE_MATCHING_PRODUCTION_EVENT_TYPES,
  type ShapeMatchingWireBatchFile,
} from './shape-matching-production-wire.fixture';

/**
 * Mirrors mobile `ShapeMatchingProductionBatchFixture` + `activity_batch_wire_codec`:
 * parent-scoped UUIDv5 device_id, pinned publication ids, session + gameplay events.
 */
describe('LMP-134 Shape Matching batch wire admission', () => {
  const admission = new ActivityBatchAdmissionService(noopStructuredLogger());
  const publication = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        'content/fixtures/activity-publications/shape-matching.v1.json',
      ),
      'utf8',
    ),
  ) as {
    content_version_id: string;
    consent_policy_version: string;
    session_consent_purpose: string;
    session_consent_scope: string;
  };

  const parentId = '11111111-1111-4111-8111-111111111111';
  const installationId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const deviceId = scopedDeviceId(installationId, parentId);
  const playSessionId = '22222222-2222-4222-8222-222222222222';

  const sessionProvenance = {
    emitter: 'kids_mode_client' as const,
    capture_channel: 'offline_queue' as const,
    clock_trust: 'monotonic_within_boot' as const,
  };

  const eventProvenance = {
    emitter: 'kids_mode_client' as const,
    actor_scope: 'child_play' as const,
    source: 'instrumented' as const,
    clock_trust: 'monotonic_within_boot' as const,
  };

  it('accepts a production-shaped batch with parent-scoped UUIDv5 device_id', () => {
    expect(deviceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const startedAt = '2026-03-10T09:00:00.000Z';
    const completedAt = '2026-03-10T09:01:30.000Z';

    const batch = {
      sessions: [
        {
          schema_version: '1.0.0',
          play_session_id: playSessionId,
          device_id: deviceId,
          content_version_id: publication.content_version_id,
          started_at: startedAt,
          ended_at: completedAt,
          monotonic_duration_seconds: 90,
          completion_status: 'completed',
          app_build: '0.1.0+local',
          locale: 'en-US',
          consent: {
            purpose: publication.session_consent_purpose,
            policy_version: publication.consent_policy_version,
            consent_scope: publication.session_consent_scope,
            decision: 'granted',
          },
          provenance: sessionProvenance,
        },
      ],
      events: [
        {
          schema_version: '1.0.0',
          event_id: '33333333-3333-4333-8333-333333333333',
          event_type: 'activity_started',
          play_session_id: playSessionId,
          device_id: deviceId,
          content_version_id: publication.content_version_id,
          occurred_at: startedAt,
          consent_scope: publication.session_consent_scope,
          consent_policy_version: publication.consent_policy_version,
          provenance: eventProvenance,
          payload: { restart: false },
        },
        {
          schema_version: '1.0.0',
          event_id: '44444444-4444-4444-8444-444444444444',
          event_type: 'activity_completed',
          play_session_id: playSessionId,
          device_id: deviceId,
          content_version_id: publication.content_version_id,
          occurred_at: completedAt,
          monotonic_duration_seconds: 90,
          consent_scope: publication.session_consent_scope,
          consent_policy_version: publication.consent_policy_version,
          provenance: eventProvenance,
          payload: {
            completion_status: 'completed',
            scoring: 'neutral',
            hints_used: 0,
            eligible_first_attempts: 6,
            correct_first_attempts: 5,
          },
        },
      ],
    };

    const admitted = admission.validate(batch);
    expect(admitted.sessions).toHaveLength(1);
    expect(admitted.events).toHaveLength(2);
    expect(admitted.sessions[0].device_id).toBe(deviceId);
  });

  it('rejects client production wire batch (payload mismatch → batch.invalid_event)', () => {
    const clientBatch = loadShapeMatchingWireJson<ShapeMatchingWireBatchFile>(
      'lmp-134-client-production-wire.batch.json',
    );
    expect(() => admission.validate(clientBatch)).toThrow(BadRequestException);
    try {
      admission.validate(clientBatch);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).message).toBe('batch.invalid_event');
    }
  });

  it('accepts schema-aligned production wire batch (all Shape Matching event types)', () => {
    const aligned = loadShapeMatchingWireJson<ShapeMatchingWireBatchFile>(
      'lmp-134-schema-aligned-production-wire.batch.json',
    );
    const admitted = admission.validate(aligned);
    expect(admitted.sessions).toHaveLength(1);
    expect(admitted.events.length).toBeGreaterThanOrEqual(3);
    for (const eventType of SHAPE_MATCHING_PRODUCTION_EVENT_TYPES) {
      if (eventType === 'activity_abandoned') continue;
      expect(
        admitted.events.some((event) => event.event_type === eventType),
      ).toBe(true);
    }
  });
});
