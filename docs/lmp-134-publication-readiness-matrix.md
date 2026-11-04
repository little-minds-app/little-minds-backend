# LMP-134 — Shape Matching publication readiness matrix

Authoritative backend matrix for synthetic catalog seed vs production/staging behavior. Clients pin `content/fixtures/activity-publications/shape-matching.v1.json` at a **backend commit SHA** for local/CI only — never as production catalog or auth truth (LMP-69 manifests remain the long-term source).

| APP_ENV | Synthetic catalog seed (`synthetic_local_publish`) | `LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH` | Client fixture as prod auth |
| --- | --- | --- | --- |
| `development` | **Allowed** (default local/CI) | ignored | **No** |
| `staging` | **Blocked** (fail-closed) | staging-only emergency override (`true`) | **No** |
| `production` | **Blocked** | **Forbidden** (boot fails if set) | **No** |

Seed replay protection: re-seed does not overwrite archived/rejected variants or non-synthetic published metadata (`prisma/seed-shape-matching-content.ts`).

Programmatic mirror: `src/content/shape-matching-publication-readiness.ts` (unit-tested).

## Health probes (UAT / E2E)

Use Nest liveness/readiness — **not** MinIO `health/live`:

- `GET /health` — process liveness
- `GET /health/ready` — dependency readiness (503 when PostgreSQL unavailable)

Backend helper: `scripts/uat-lmp-134-shape-matching-production.sh` (exit `0` PASS, `1` FAIL, `2` NOT_RUN).

## Database tests

Run PostgreSQL integration only against disposable databases (`little_minds_test`, `little_minds_ci`, `little_minds_local`, `little_minds_dev`). Never point `verify:local --with-db` or `test:db` at the default Compose `little_minds` UAT volume.
