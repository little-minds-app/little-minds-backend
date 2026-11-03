/** Canonical KPI dictionary version (F-013 / LMP-52). Bump when formulas change. */
export const SESSION_KPI_DEFINITION_VERSION = 'session-kpi-v1' as const;

/** Only ActivitySessionV1 / ActivityEventV1 with this schema participate in KPI math. */
export const SESSION_KPI_SUPPORTED_SCHEMA_VERSION = '1.0.0' as const;

/**
 * Product default: KPI freshness is stale when latest server ingest is older than this.
 * Documented in docs/lmp-52-session-kpi-design.md; override via SESSION_KPI_STALE_THRESHOLD_SECONDS.
 */
export const DEFAULT_SESSION_KPI_STALE_THRESHOLD_SECONDS = 86_400;

/** Upper bound for trusted monotonic / derived session duration (4 hours). */
export const MAX_TRUSTED_SESSION_DURATION_SECONDS = 14_400;

export const TERMINAL_COMPLETION_STATUSES = [
  'completed',
  'abandoned',
  'interrupted',
] as const;

export type TerminalCompletionStatus = (typeof TERMINAL_COMPLETION_STATUSES)[number];
