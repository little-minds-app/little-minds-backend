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
| completed / interrupted / abandoned / in_progress | status buckets | — | `in_progress` only when status is non-terminal **and** `ended_at` is null; `ended_at` without terminal status counts as interrupted (terminal) |
| total_play_duration_seconds | sum trusted duration | — | Monotonic duration preferred; else bounded terminal wall delta |
| completed_session_rate | completed | terminal | Unavailable when terminal = 0 |
| distinct_play_days | unique local dates of `started_at` | — | Uses request `timezone` |
| by_activity | grouped by `content_version_id` | — | Starts, completed, duration |
| first_attempt_accuracy | Σ correct_first_attempts | Σ eligible_first_attempts | Same eligible session cohort as session KPIs; latest `activity_completed` per session by `occurred_at`, then eligibility check (no older fallback) |

## First-attempt accuracy validity

- `eligible_first_attempts` and `correct_first_attempts` must both be safe integers; require `eligible_first_attempts > 0` and `0 <= correct_first_attempts <= eligible_first_attempts`. Invalid event payloads are excluded.
- Aggregated numerator and denominator must also remain within JavaScript's safe integer range. If adding an otherwise valid event would overflow either total, `first_attempt_accuracy` is returned with `availability_status: unavailable`, `reason_code: counter_overflow`, `numerator: 0`, and `denominator: 0`; no rounded/partial accuracy is exposed.
- When no valid contributing attempts exist, the metric is unavailable with `reason_code: insufficient_denominator`.

## Freshness

- Eligible cohort only: sessions passing schema + consent re-check in the requested window.
- `latest_ingested_at`: max `received_at` on child `activity_events` for those eligible session IDs (parent-only events excluded).
- `latest_activity_at`: max `occurred_at` / `started_at` among the same eligible session IDs.
- `fresh` / `stale` only when `eligible_session_count > 0` and window-scoped ingest exists; empty windows with out-of-window ingest stay `no_data` / `unknown`, not `fresh`.
- `partial` when any eligible in-progress session exists in window.

No PII or raw payloads in KPI responses.
