# LMP-52 — Canonical session KPI aggregation

Status: implementation (F-013 / E08). Source of truth: accepted `activity_sessions` + deduped `activity_events` from LMP-51 ingest.

## Eligibility

- Parent bearer scope; optional `child_id` must belong to authenticated parent (active, not deleted).
- Session `schema_version` must be `1.0.0`; other versions increment `excluded_unsupported_schema` only.
- Window: half-open `[from, to)` on `started_at` (UTC instants on the wire).
- Re-check server consent for session `consent_scope` + `consent_policy_version`; withdrawn consent excludes historical rows at read time.

## KPI dictionary (`session-kpi-v1`)

| Metric | Numerator | Denominator | Notes |
|--------|-----------|-------------|-------|
| eligible_session_count | eligible rows | — | One row per `play_session_id` |
| completed / interrupted / abandoned / in_progress | status buckets | — | Terminal = completed/abandoned/interrupted or `ended_at` set |
| total_play_duration_seconds | sum trusted duration | — | Monotonic duration preferred; else bounded terminal wall delta |
| completed_session_rate | completed | terminal | Unavailable when terminal = 0 |
| distinct_play_days | unique local dates of `started_at` | — | Uses request `timezone` |
| by_activity | grouped by `content_version_id` | — | Starts, completed, duration |
| first_attempt_accuracy | Σ correct_first_attempts | Σ eligible_first_attempts | Latest `activity_completed` per session; unavailable if denominator 0 |

## Freshness

- `latest_ingested_at`: max `received_at` over child events (parent scope) and parent-only events.
- `latest_activity_at`: max observed activity timestamps (events + session starts).
- `fresh` when age(`latest_ingested_at`) ≤ `SESSION_KPI_STALE_THRESHOLD_SECONDS` (default 86400).
- `partial` when any eligible in-progress session exists in window.

No PII or raw payloads in KPI responses.
