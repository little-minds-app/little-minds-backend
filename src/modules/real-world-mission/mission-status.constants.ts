export const MISSION_STATUS_SCHEMA_VERSION = 'mission-status-v1' as const;
export const MISSION_STATUS_DEFINITION_VERSION = 'mission-status-v1' as const;

export const MISSION_STATUS_CONSENT_SCOPE = 'essential_play_events' as const;
export const MISSION_STATUS_CONSENT_POLICY = 'privacy-notice-draft-0' as const;

export const MISSION_REPORT_STATUSES = [
  'completed',
  'skipped',
  'not_now',
  'partial',
] as const;

export type MissionReportStatus = (typeof MISSION_REPORT_STATUSES)[number];

export const AUTHORITATIVE_PARENT_REPORT_STATUSES = ['completed', 'skipped'] as const;

export const STABLE_MISSION_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export const MISSION_INTERACTION_EVENT_TYPES = [
  'real_world_mission_offered',
  'real_world_mission_opened',
] as const;

export const DEFAULT_MISSION_READ_LIMIT = 50;
export const MAX_MISSION_READ_LIMIT = 100;
/** Upper bound when scanning reports/events before merge pagination. */
export const MISSION_READ_SCAN_CAP = 500;
