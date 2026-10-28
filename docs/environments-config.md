# Environment & secrets configuration (LMP-28)

**Blueprint:** §26 environments / isolation · §27.2 Config · F-022  
**Related:** [Staging isolation pointer](./environments-staging-isolation.md) · `infrastructure/environments/`

This document is the backend source for the **cross-repo environment contract** with `little-minds-client`. It does not provision hosting (see LMP-29+) and does not invent product APIs.

## Canonical environment names

Exact product environment names (shared with client flavors):

| `APP_ENV` | Meaning |
|---|---|
| `development` | Local developer machine (Compose + Nest on host) |
| `staging` | Isolated staging/QA deployment |
| `production` | Isolated production deployment |

`NODE_ENV` remains the Node/Nest runtime flag (`development` \| `test` \| `production`). Staging and production **deployments** use `NODE_ENV=production` with `APP_ENV=staging` or `APP_ENV=production`.

## Public vs secret

| Class | Keys (current) | Rules |
|---|---|---|
| **Public** | `APP_ENV`, `NODE_ENV`, `PORT`, `PUBLIC_API_BASE_URL`, `RELEASE` | Safe to log; clients may mirror in build-time config |
| **Secret** | `DATABASE_URL`, `POSTGRES_PASSWORD`, `MINIO_ROOT_*`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, reserved `JWT_SECRET` / `OIDC_CLIENT_SECRET` / `SMTP_PASSWORD` | Never commit real values; never log raw; inject via local `.env` (gitignored) or a protected secret store |

Fail-fast validation: `src/config/env.validation.ts` (wired through Nest `ConfigModule`).

## Config matrix

| Variable | development | staging | production |
|---|---|---|---|
| `APP_ENV` | `development` (default) | required `staging` | required `production` |
| `NODE_ENV` | `development` / `test` | `production` | `production` |
| `PORT` | default `3000` | required (usually `3000` behind a proxy) | required |
| `PUBLIC_API_BASE_URL` | default `http://localhost:3000` | required `https://…` | required `https://…` |
| `RELEASE` | default `dev` | optional public release id for structured logs | optional public release id for structured logs |
| `DATABASE_URL` | optional for Nest liveness; required for Prisma CLI / readiness probe | **required**; non-local host; no Compose placeholders | **required**; non-local; no placeholders |
| Local Compose passwords (`postgres` / `minioadmin`) | allowed | **rejected** | **rejected** |

Example files:

- Root local template: [`.env.example`](../.env.example)
- Per-env templates: [`infrastructure/environments/`](../infrastructure/environments/)

## Client `LM_API_BASE_URL` mapping (contract)

Clients do **not** read backend `.env` files. Each Flutter flavor sets the dart-define **`LM_API_BASE_URL`** to the API base for that environment. It must match the backend deployment’s **`PUBLIC_API_BASE_URL`**.

| Client flavor | Client dart-define | Expected API base |
|---|---|---|
| `development` | `LM_API_BASE_URL` | iOS Simulator: `http://localhost:3000`; Android Emulator: `http://10.0.2.2:3000` (same Nest `PORT`; physical devices need a reachable LAN URL — development-only) |
| `staging` | `LM_API_BASE_URL` | Same value as staging `PUBLIC_API_BASE_URL` (hostname is a **TECHNICAL ASSUMPTION** until staging is provisioned; backend requires `https:` and rejects local/dev hosts) |
| `production` | `LM_API_BASE_URL` | Same value as production `PUBLIC_API_BASE_URL` (hostname **TECHNICAL ASSUMPTION** until production is provisioned; backend requires `https:` and rejects local/dev hosts) |

OpenAPI path surface remains health-only: **`GET /health`** and **`GET /health/ready`** (see `contracts/VERSION` for current semver; additive bumps such as LMP-32 `0.3.0` are allowed). Do not invent `/v1/...` routes here. Local OpenAPI `servers` URL stays `http://localhost:3000`. Clients pin a backend **commit SHA**, not a hardcoded VERSION string.

## Secret leakage guards

- `.gitignore` ignores `.env`, `.env.*`, and non-example files under `infrastructure/environments/`.
- Allowed committed templates: `.env.example`, `.env.*.example`, `infrastructure/environments/*.env.example`.
- Startup logs emit **public** config only (`toPublicConfig` + `redactSecrets`).
- CI: `scripts/check-env-secrets.sh` verifies gitignore, absence of committed `.env`, and placeholder-only examples.

## Manual verification

```bash
cp .env.example .env
npm run start:dev
# Expect log line with APP_ENV/PORT/PUBLIC_API_BASE_URL only (no DATABASE_URL password)
curl -s http://localhost:3000/health
curl -s http://localhost:3000/health/ready

# Negative: staging without secrets must fail boot
APP_ENV=staging NODE_ENV=production PUBLIC_API_BASE_URL=https://api.staging.example.invalid npm run start:prod
# → Environment validation failed: DATABASE_URL is required…
```

Structured logging / correlation: [`observability.md`](./observability.md).
