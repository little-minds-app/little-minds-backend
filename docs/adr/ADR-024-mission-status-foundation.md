# ADR-024 — Parent-scoped mission status foundation (LMP-130)

**Status:** Accepted for implementation (pending human security review)  
**Jira:** LMP-130 · **Epic:** LMP-10 · **Blueprint:** §12 (`GET/POST …/missions`), §13.3, §14.1  
**Blocks:** LMP-53, LMP-54 · **Related (out of scope here):** LMP-74 catalog, LMP-75 rich history/UX

## Context

Near/Far handoff (LMP-46) records child interaction events (`real_world_mission_offered`, `real_world_mission_opened`) in `activity_events`. Parent caregiver reports can arrive via LMP-51 ingest as `mission_feedback_submitted` in `parent_activity_events`, but those rows are **parent-scoped only** (no `child_id`, no occurrence key) and cannot satisfy LMP-53/LMP-54 per-child dashboard reads.

The canonical Prisma `mission_feedback` table requires a UUID FK to `real_world_missions`, which LMP-74 has not populated. Using it now would invent catalog rows or block writes.

## Decision

1. **Source of truth for authoritative mission completion:** parent-reported status only (`completed`, `skipped` are authoritative; `not_now` / `partial` are caregiver signals, not verified physical completion).
2. **Persistence:** new `parent_mission_status_reports` table keyed by `(parent_id, child_id, stable mission_id, occurrence_id)` with global idempotency on `(parent_id, idempotency_key)`. Server sets `recorded_at` (UTC). Actor `parent`, source `caregiver_report`.
3. **Occurrence model:** `occurrence_id` is a client-supplied UUID (Near/Far uses `play_session_id`). Repeated missions are distinct occurrences; no silent collapse.
4. **Interaction facts:** read path merges eligible child `activity_events` (offered/opened) with parent reports; absence is explicit (`no_report`).
5. **Write path:** authenticated `POST /v1/children/{childId}/missions/{missionId}/feedback` with Parent Gate (aligned with other caregiver mutations). Does **not** trust client parent/child IDs beyond path + session.
6. **Read path:** authenticated `GET /v1/children/{childId}/missions` with optional half-open `from`/`to` on report/interaction times, consent re-check at read, bounded `limit`.
7. **Mission identity:** minimal registry (Near/Far `near_far_sock_soft_toy_v1` only) until LMP-74; validate stable editorial IDs, not UUID catalog FKs.
8. **Non-goals:** LMP-75 reflections/history UI, LMP-74 catalog ingestion, deriving child-scoped status from `parent_activity_events` alone, backfills.

## Evidence (code inspection)

| Artifact | Finding |
|---|---|
| `parent_activity_events` | Stores `mission_feedback_submitted` without child linkage |
| `activity_events` | Child-scoped offered/opened with `mission_id` + `play_session_id` |
| `MissionFeedback` model | UUID `mission_id` FK — catalog not ready |
| `ActivityIngestionService` | Idempotent ingest only; no mission status projection |

## Corrections / re-report policy

Same `idempotency_key` with identical payload → `duplicate_noop`. Same occurrence with a new key → allowed transition per `mission-status.transitions.ts` (parent may correct between `completed` ↔ `skipped`, or advance from `not_now`/`partial`).

## Open product blockers

- Full mission catalog expansion beyond Near/Far (LMP-74).
- Whether web/mobile should also write via batch ingest with a future child-scoped payload extension (not implemented in LMP-130).
