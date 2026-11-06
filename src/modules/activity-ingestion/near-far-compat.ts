import {
  ACTIVITY_SCHEMA_VERSION,
  type ActivityEventV1,
  type ActivityValidationIssue,
} from './activity-contract.types';
import { validateActivityEvent } from './activity-event.validator';

/**
 * Near/Far local fixture → ActivityEventV1 compatibility harness (LMP-50).
 *
 * Near/Far emitters remain client-owned and are NOT modified by this task.
 * This adapter exists only so backend tests can document pass/fail deltas
 * when a fixture-shaped object is normalized toward production V1.
 */

export type NearFarCompatInput = {
  event_id?: string;
  schema_version?: string | number;
  event_type?: string;
  play_session_id?: string;
  device_id?: string;
  content_version_id?: string;
  occurred_at?: string;
  monotonic_duration_seconds?: number;
  payload?: Record<string, unknown>;
  /** Extra fixture fields that must be dropped (e.g. nested mentor_adjacency). */
  [key: string]: unknown;
};

export type NearFarCompatResult = {
  deltas: string[];
  normalized: ActivityEventV1 | null;
  validationIssues: ActivityValidationIssue[];
};

const UUID_V4_PLACEHOLDER = {
  event: '018f0000-0000-7000-8000-0000000000a1',
  session: '018f0000-0000-7000-8000-0000000000a2',
  device: '018f0000-0000-7000-8000-0000000000a3',
  content: '018f0000-0000-7000-8000-0000000000a4',
} as const;

function isUuidV4OrV7(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[457][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

/**
 * Normalize a Near/Far-like local event toward ActivityEventV1 for dual-validate tests.
 * Does not claim production upload readiness; documents required deltas.
 */
export function adaptNearFarFixtureToActivityEventV1(
  input: NearFarCompatInput,
): NearFarCompatResult {
  const deltas: string[] = [];

  if (input.schema_version !== ACTIVITY_SCHEMA_VERSION) {
    deltas.push(
      `schema_version: fixture ${JSON.stringify(input.schema_version)} → "${ACTIVITY_SCHEMA_VERSION}"`,
    );
  }

  const eventId =
    typeof input.event_id === 'string' && isUuidV4OrV7(input.event_id)
      ? input.event_id
      : UUID_V4_PLACEHOLDER.event;
  if (eventId !== input.event_id) {
    deltas.push('event_id: non-UUID fixture id replaced with UUID placeholder');
  }

  const playSessionId =
    typeof input.play_session_id === 'string' &&
    isUuidV4OrV7(input.play_session_id)
      ? input.play_session_id
      : UUID_V4_PLACEHOLDER.session;
  if (playSessionId !== input.play_session_id) {
    deltas.push(
      'play_session_id: non-UUID fixture id replaced with UUID placeholder',
    );
  }

  const deviceId =
    typeof input.device_id === 'string' && isUuidV4OrV7(input.device_id)
      ? input.device_id
      : UUID_V4_PLACEHOLDER.device;
  if (deviceId !== input.device_id) {
    deltas.push('device_id: non-UUID fixture id replaced with UUID placeholder');
  }

  const contentVersionId =
    typeof input.content_version_id === 'string' &&
    isUuidV4OrV7(input.content_version_id)
      ? input.content_version_id
      : UUID_V4_PLACEHOLDER.content;
  if (contentVersionId !== input.content_version_id) {
    deltas.push(
      'content_version_id: non-UUID fixture id replaced with UUID placeholder',
    );
  }

  const rawPayload =
    input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload)
      ? { ...input.payload }
      : {};

  if ('mentor_adjacency' in rawPayload) {
    delete rawPayload.mentor_adjacency;
    deltas.push('payload.mentor_adjacency: nested object dropped (not allowlisted)');
  }
  if ('materials' in rawPayload) {
    delete rawPayload.materials;
    deltas.push(
      'payload.materials: free-text materials dropped; use material_codes',
    );
  }

  if (!('consent_scope' in input)) {
    deltas.push('consent_scope: missing on fixture — injected essential_play_events');
  }
  if (!('consent_policy_version' in input)) {
    deltas.push(
      'consent_policy_version: missing on fixture — injected privacy-notice-draft-0',
    );
  }
  if (!('provenance' in input)) {
    deltas.push('provenance: missing on fixture — injected kids_mode defaults');
  }

  const normalized: ActivityEventV1 = {
    schema_version: ACTIVITY_SCHEMA_VERSION,
    event_id: eventId,
    event_type: (input.event_type ?? 'activity_completed') as ActivityEventV1['event_type'],
    play_session_id: playSessionId,
    device_id: deviceId,
    content_version_id: contentVersionId,
    occurred_at:
      typeof input.occurred_at === 'string'
        ? input.occurred_at.endsWith('Z')
          ? input.occurred_at
          : `${input.occurred_at}Z`
        : '2026-10-28T06:00:00.000Z',
    monotonic_duration_seconds:
      typeof input.monotonic_duration_seconds === 'number'
        ? input.monotonic_duration_seconds
        : undefined,
    consent_scope: 'essential_play_events',
    consent_policy_version: 'privacy-notice-draft-0',
    provenance: {
      emitter: 'kids_mode_client',
      actor_scope: 'child_play',
      source: 'instrumented',
      clock_trust: 'monotonic_within_boot',
    },
    payload: rawPayload,
  };

  if (
    normalized.event_type === 'activity_completed' &&
    normalized.monotonic_duration_seconds === undefined
  ) {
    normalized.monotonic_duration_seconds = 0;
    deltas.push(
      'monotonic_duration_seconds: missing on duration-bearing fixture — injected 0 for dual-validate',
    );
  }

  if (
    normalized.event_type === 'activity_completed' &&
    normalized.payload.completion_status === undefined
  ) {
    normalized.payload = {
      ...normalized.payload,
      completion_status: 'completed',
      scoring: 'neutral',
    };
    deltas.push('payload: injected completion_status/scoring for dual-validate');
  }

  const validation = validateActivityEvent(normalized);
  return {
    deltas,
    normalized: validation.ok ? normalized : normalized,
    validationIssues: validation.ok ? [] : validation.issues,
  };
}
