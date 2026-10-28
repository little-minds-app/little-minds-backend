/**
 * Activity session + event wire types (LMP-50).
 * Aligned with contracts/schemas/activity/*.schema.json.
 * schema_version is independent from OpenAPI contracts/VERSION.
 */

export const ACTIVITY_SCHEMA_VERSION = '1.0.0' as const;

/** Blueprint §14.1 Kids Mode gameplay allowlist (not §34.3 content_* aliases). */
export const ACTIVITY_EVENT_TYPES = [
  'activity_started',
  'activity_attempted',
  'activity_hint_used',
  'activity_completed',
  'activity_abandoned',
  'child_mode_foreground_started',
  'child_mode_foreground_ended',
  'real_world_mission_offered',
  'real_world_mission_opened',
  'mission_feedback_submitted',
  'mentor_card_opened',
  'screen_limit_reached',
  'content_pack_downloaded',
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export const DURATION_BEARING_EVENT_TYPES = [
  'activity_completed',
  'activity_abandoned',
  'child_mode_foreground_ended',
  'screen_limit_reached',
] as const;

export type DurationBearingEventType =
  (typeof DURATION_BEARING_EVENT_TYPES)[number];

export const PARENT_ONLY_EVENT_TYPES = [
  'mission_feedback_submitted',
  'mentor_card_opened',
] as const;

export type ParentOnlyEventType = (typeof PARENT_ONLY_EVENT_TYPES)[number];

export const CONSENT_SCOPES = [
  'essential_play_events',
  'essential_service_telemetry',
  'optional_product_analytics',
] as const;

export type ConsentScope = (typeof CONSENT_SCOPES)[number];

export const ESSENTIAL_CONSENT_SCOPES: readonly ConsentScope[] = [
  'essential_play_events',
  'essential_service_telemetry',
] as const;

export const OPTIONAL_CONSENT_SCOPES: readonly ConsentScope[] = [
  'optional_product_analytics',
] as const;

export type ConsentDecision = 'granted' | 'denied' | 'withdrawn';

export type CompletionStatus =
  | 'started'
  | 'completed'
  | 'abandoned'
  | 'interrupted';

export type ActivitySessionConsent = {
  purpose: string;
  policy_version: string;
  consent_scope: ConsentScope;
  /** UX evidence only — never treated as server authorization. */
  decision: ConsentDecision;
};

export type ActivitySessionProvenance = {
  emitter: 'kids_mode_client' | 'parent_dashboard' | 'sync_worker';
  capture_channel: 'offline_queue' | 'online_direct' | 'replay_backfill';
  clock_trust: 'monotonic_within_boot' | 'wall_clock_only' | 'unknown';
};

export type ActivityEventProvenance = {
  emitter: 'kids_mode_client' | 'parent_dashboard' | 'sync_worker';
  actor_scope: 'child_play' | 'parent';
  source: 'instrumented' | 'caregiver_report';
  clock_trust: 'monotonic_within_boot' | 'wall_clock_only' | 'unknown';
};

export type ActivitySessionV1 = {
  schema_version: typeof ACTIVITY_SCHEMA_VERSION;
  play_session_id: string;
  device_id: string;
  content_version_id: string;
  started_at: string;
  ended_at?: string;
  monotonic_duration_seconds?: number;
  completion_status: CompletionStatus;
  app_build?: string;
  locale?: string;
  consent: ActivitySessionConsent;
  provenance: ActivitySessionProvenance;
};

export type ActivityEventV1 = {
  schema_version: typeof ACTIVITY_SCHEMA_VERSION;
  event_id: string;
  event_type: ActivityEventType;
  /** Required for child_play; MUST be omitted for parent-only events. */
  play_session_id?: string;
  device_id: string;
  content_version_id: string;
  occurred_at: string;
  monotonic_duration_seconds?: number;
  consent_scope: ConsentScope;
  consent_policy_version: string;
  provenance: ActivityEventProvenance;
  payload: Record<string, unknown>;
};

export type ActivityValidationIssue = {
  code: string;
  path: string;
  message: string;
};

export type ActivitySessionValidationResult =
  | { ok: true; session: ActivitySessionV1 }
  | { ok: false; issues: ActivityValidationIssue[] };

export type ActivityEventValidationResult =
  | { ok: true; event: ActivityEventV1 }
  | { ok: false; issues: ActivityValidationIssue[] };

/**
 * Server-attested consent row used for authorization checks.
 * NEVER constructed from client `decision` alone.
 * `source` must be an authoritative server/sync channel.
 */
export type ServerConsentRecord = {
  purpose: string;
  consent_scope: ConsentScope;
  status: 'granted' | 'denied' | 'withdrawn';
  policy_version: string;
  /** Authoritative origin — client wire decisions are not valid sources. */
  source: 'server_consent_store' | 'sync_scope_grant';
};
