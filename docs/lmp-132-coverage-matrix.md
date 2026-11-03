# LMP-132 — Delivered-feature regression coverage matrix

**Purpose:** Trace merged Little Minds deliverables to automated tests or documented exceptions (Blueprint §28.9 QA-UI-001).  
**Updated:** 2026-11-03 (LMP-132 closure)  
**Evidence runner (backend):** `npm run verify:local` — PR https://github.com/little-minds-app/little-minds-backend/pull/35 (fast path + opt-in `--with-db` / `LM_VERIFY_WITH_DB=1` on disposable `little_minds_{test|ci|local|dev}` only; CI `prisma-checks` owns Postgres on PR).  
**Evidence runner (client):** `bash scripts/run-client-regression.sh` — PR https://github.com/little-minds-app/little-minds-client/pull/35 @ `714dca0`.

### Test modality (avoid false confidence)

| Layer | Backend | Client |
| --- | --- | --- |
| Unit / pure logic | Jest `*.spec.ts` under `src/` | Flutter unit/widget tests |
| Mock HTTP e2e | Supertest with mocked services/guards (e.g. LMP-54 `web-dashboard-read`, LMP-40 web child profile, mobile KPI/mission controller e2e) | BFF route modules + component tests (not Postgres) |
| Real Postgres | `npm run test:db` + CI **Prisma migrate, seed, integrity** job | Opt-in HTTP integration only where documented (e.g. activity outbox with token); not default PR path |
| Live full stack | Gated `lmp38-fullstack-e2e.yml`; **→ LMP-113** for release vertical E2E | **→ LMP-113**; manual device UAT remains for visuals/permissions |

## Legend

| Column | Meaning |
| --- | --- |
| **Backend** | `little-minds-backend` unit / DB / HTTP e2e (see backend LMP-132 worker for PR SHAs) |
| **Client mobile** | Flutter unit / widget / optional opt-in HTTP integration |
| **Client web** | Next.js BFF route tests, component tests, HTTP session harness |
| **Contract** | Root OpenAPI pin + generated client drift |
| **Live E2E** | Real Postgres + stack; **LMP-113** owns vertical release E2E — not duplicated here |
| **Risk** | Residual manual / coordinated work |

Rows marked **(client)** are verified in this client PR. Backend cells cite internal delivery reports unless backend worker updates them.

## Boundaries (do not duplicate)

| Item | Handling |
| --- | --- |
| LMP-53/54 UAT automation | Merged client **PR #34** — `scripts/uat-dashboard.sh`, `parent-dashboard-uat.component.test.tsx`; **not rewritten** in LMP-132 |
| Backend LMP-53/54 automation | Merged backend **PR #34** — coordinated with backend worker; **not rewritten** |
| LMP-113 | Full vertical-slice release E2E — **coordinate**, matrix marks `→ LMP-113` |
| LMP-114 | Resilience / chaos — **coordinate**, matrix marks `→ LMP-114` |
| LMP-131 | Dashboard charts / UX polish — **out of scope** |

---

## Infrastructure & contracts

| Jira | Deliverable | Backend | Client mobile | Client web | Contract | Live E2E | Status / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LMP-5 | Client CI smoke | — | — | — | — | — | **Covered** — `.github/workflows/ci.yml` |
| LMP-19 | Device matrix / ADR docs | Docs scripts | — | — | — | — | **Covered** — `scripts/check-lmp19-docs.sh` |
| LMP-20–22 | Backend bootstrap, DB, seeds | Jest + `test:db` + e2e | — | — | — | Compose | **Backend** — see LMP-20–22 reports |
| LMP-23 | OpenAPI clients | `contracts:check` | Generated dart tests (smoke) | — | **(client)** root `tests/contract/*.test.mjs` | — | **Covered** |
| LMP-24 | Flutter shell | — | **(client)** `shell_widget_test.dart`, `window_size_class_test.dart` | — | — | — | **Covered** |
| LMP-25 | Next.js shell | — | — | **(client)** `bootstrap.test.mjs`, `lmp25-web-bootstrap.yml` | — | — | **Covered** |
| LMP-27 | CI + negative contract | Same | — | — | **(client)** `openapi.negative.test.mjs` | — | **Covered** |
| LMP-28 | Public env config | `config:check` | **(client)** `app_config_test.dart`, `env_config_widget_test.dart` | — | — | — | **Covered** |
| LMP-32 | Logging / health | Health e2e | — | — | Pin health paths | — | **Backend** |

---

## Identity, sessions, profiles

| Jira | Deliverable | Backend | Client mobile | Client web | Contract | Live E2E | Status / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LMP-33 | Parent session lifecycle | `*.spec.ts`, e2e session | — | — | Auth paths in OpenAPI | PG integrity | **Backend**; web BFF covered below |
| LMP-34 | GSM OTP | `phone-otp` e2e, env matrix | — | **(client)** `http-session.test.mjs` OTP flow | OTP schemas | Fake provider | **Covered (client web HTTP)** |
| LMP-35 | Apple/Google/email OTP | `multi-provider-oidc.e2e` | — | Partial via BFF auth routes | — | — | **Backend** + BFF unit tests |
| LMP-36 | Account linking / step-up | `step-up.*.spec.ts`, DB specs | — | — | — | account-linking e2e | **Backend** |
| LMP-37 | Mobile parent auth UI | — | **(client)** `parent_auth_*_test.dart` | — | — | — | **Covered** |
| LMP-38 | Web auth + opaque session | Web session e2e | — | **(client)** `http-session.test.mjs`, auth route modules | Web session paths | — | **Covered** |
| LMP-39 | Child schema / age months | DB + API specs | Indirect via API types | — | Child profile schemas | — | **Backend** |
| LMP-40 | Child profiles CRUD | API + e2e | **(client)** `child_profiles_widget_test.dart` | **(client)** `child-profiles.component.test.tsx` | — | — | **Covered** |
| LMP-40 | Stale profile on account switch | — | **(client)** stale parent test in `child_profiles_widget_test.dart` | **(client)** stale child test in `child-profiles.component.test.tsx` | — | — | **Covered** |
| LMP-41 | Optional parent profile | Profile API specs | **(client)** `optional_parent_profile_widget_test.dart` | Via `http-session.test.mjs` profile PATCH | — | — | **Covered** |
| LMP-42 | Parent gate / PIN | Gate API backend tests | **(client)** `parent_pin_surface_widget_test.dart`, `parent_gate_boundaries_test.dart`, `parent_dashboard_gate_test.dart` | — | — | Device PIN UX | **Covered** + manual PIN entry (UAT-01) |
| PR #25 | Installation id across logout | — | **(client)** `installation_id_store_test.dart` | — | — | — | **Covered** |

---

## Kids Mode, gameplay, mentor, screen time

| Jira | Deliverable | Backend | Client mobile | Client web | Contract | Live E2E | Status / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LMP-43 | Child Hub | — | **(client)** `child_hub_widget_test.dart`, `hub_audio_guidance_test.dart` | — | — | Visual/audio device | **Covered** + manual hub polish |
| LMP-44 | Flame lifecycle | — | **(client)** `game_lifecycle_unit_test.dart`, `game_lifecycle_widget_test.dart` | — | — | — | **Covered** |
| LMP-45 | Near/Far demo | — | **(client)** `near_far_*_test.dart` | — | — | TTS device (LMP-120) | **Covered**; spoken TTS manual |
| LMP-46 | Mission handoff / skip | Mission APIs backend | **(client)** near_far + mission handoff widget paths | — | — | — | **Covered (mobile)** |
| LMP-47 | Mentor card schema | Schema tests backend | **(client)** `mentor_card_*_test.dart` | — | Mentor components in OpenAPI | — | **Covered** |
| LMP-48 | Mentor card UI | — | **(client)** `near_far_mentor_widget_test.dart` | — | — | Tablet layouts in tests | **Covered** |
| LMP-49 | Screen time cap | — | **(client)** `screen_time_*_test.dart` (accountant, coordinator, lifecycle, debug) | — | — | On-device clock tamper | **Covered** + device spot-check |

---

## Activity pipeline & insights

| Jira | Deliverable | Backend | Client mobile | Client web | Contract | Live E2E | Status / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LMP-50 | Activity event schemas | `activity-ingestion` unit | **(client)** outbox wire + consent serialization | — | **(client)** OpenAPI activity components | — | **Covered** |
| LMP-51 | Offline outbox + ingest | Ingest e2e / idempotency DB | **(client)** `activity_outbox_test.dart`, `activity_encrypted_outbox_test.dart`, `activity_outbox_wire_serialization_test.dart` | — | Batch ingest path in contract tests | Opt-in `activity_outbox_http_integration_test.dart` (needs `LMP51_UAT_TOKEN` + local API) | **Covered** deterministic; live ingest → **LMP-113** |
| LMP-52 | Session KPI aggregation | `session-kpi.db.spec.ts` | **(client)** `session_kpi_repository_test.dart`, `session_kpi_window_test.dart` | — | KPI schema in OpenAPI | Real session compare | **Backend** + mobile repo; parity UAT-03 manual |
| LMP-130 | Mission status read API | Mission DB/API tests | **(client)** `mission_status_repository_test.dart`, `mission_status_view_data_test.dart` | — | Mission paths 0.14.x pin | — | **Covered** |

---

## Parent dashboards (LMP-53 / LMP-54)

| Jira | Deliverable | Backend | Client mobile | Client web | Contract | Live E2E | Status / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LMP-53 | Mobile dashboard KPI + mission | Dashboard read e2e (backend PR #34 area) | **(client)** `parent_dashboard_*_test.dart` + PR #34 gate subset | — | 0.14.x pin | UAT-03 live session | **Covered** automated; live parity manual |
| LMP-54 | Web dashboard BFF + UI | `web-dashboard-read` e2e | — | **(client)** `parent-dashboard.component.test.tsx`, `contract.test.mjs`, PR #34 `parent-dashboard-uat.component.test.tsx` | BFF read routes | — | **Covered**; **do not rewrite** PR #34 UAT file |
| LMP-53/54 | UAT regression runner | Backend worker PR | **(client)** `scripts/uat-dashboard.sh` (existing) | same | — | `--live-smoke` optional | **Owned by PR #34** |

---

## Coordinated / out of scope

| Jira | Topic | Matrix note |
| --- | --- | --- |
| LMP-113 | Release vertical E2E | Live stack journeys; not backfilled in this task |
| LMP-114 | Resilience testing | Outages / races at stack level; not duplicated |
| LMP-131 | Dashboard charts UX | No regression gap fill in LMP-132 |

---

## Client LMP-132 gap fill (this PR)

| Gap | Action | Evidence |
| --- | --- | --- |
| No single local command for full client regression | Added `scripts/run-client-regression.sh` | README + script `--help`; build-before-test ordering for `http-session.test.mjs` |
| Mobile truncated mission label (UAT-05 parity) | Widget test in `parent_dashboard_widget_test.dart` | `flutter test` 320 passed (~1 skipped opt-in HTTP) |
| Matrix publication | This document | Updated with client evidence column |

**Last client regression (local):** contracts 14/14 PASS; web 31/31 PASS; `flutter analyze` clean; `flutter test` 320 PASS (~1 skipped).
