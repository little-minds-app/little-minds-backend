# little-minds-backend

Little Minds NestJS modular monolith API and infrastructure (ADR-014).

## Prerequisites

- **Node.js 20 LTS** (see `.nvmrc`)
- **npm** (package manager for this repo)
- **Docker Compose v2** for local PostgreSQL / MinIO / Mailpit (LMP-21)

NestJS boots without Docker (LMP-20). PostgreSQL is required for Prisma migrate/seed (LMP-22). Object storage / email remain Compose-backed for later adapters.

## Quick start — Nest API

```bash
cp .env.example .env
npm ci
npm run start:dev
```

API listens on `http://localhost:3000` by default (`PORT` overridable).

### Health (liveness)

```bash
curl -s http://localhost:3000/health
```

Expected JSON shape:

```json
{
  "status": "ok",
  "service": "little-minds-backend",
  "timestamp": "2026-10-27T12:00:00.000Z"
}
```

`GET /health` is unauthenticated process liveness only. Product routes will use `/v1/...` later. Database readiness probes arrive with later tasks.

## Quick start — local supporting services (LMP-21)

Blueprint §27.2 stack: **PostgreSQL**, **MinIO**, **Mailpit**. One command from the repo root:

```bash
cp .env.example .env
docker compose -f infrastructure/docker-compose.yml --env-file .env up -d
```

Equivalent Make targets (same Compose file):

| Command | Purpose |
|---|---|
| `make dev-up` | Start services detached (`up -d`) |
| `make dev-ps` | Show container status / health |
| `make dev-down` | Stop containers; **keep** named volumes |
| `make reset-local` | Stop containers and **delete** volumes (data wipe) |
| `make compose-config` | Validate Compose file only |
| `make db-migrate` | Apply Prisma migrations (`npm run db:migrate`) |
| `make db-seed` | Upsert synthetic 24/32/47/59/71-month profiles |
| `make db-reset` | Drop schema, remigrate, re-seed (`LM_CONFIRM_DB_RESET=1` required) |

### Status and health

```bash
docker compose -f infrastructure/docker-compose.yml --env-file .env ps
```

All three services should report `healthy` after a short start period.

Optional smoke checks against default ports:

```bash
# PostgreSQL
docker compose -f infrastructure/docker-compose.yml --env-file .env exec postgres \
  pg_isready -U postgres -d little_minds

# MinIO live probe
curl -sf http://localhost:9000/minio/health/live

# Mailpit UI/API
curl -sf http://localhost:8025/api/v1/info
```

| Service | Defaults |
|---|---|
| PostgreSQL | `localhost:5432` · user/password/db from `.env.example` |
| MinIO API / console | `localhost:9000` / `localhost:9001` (Bitnami legacy MinIO image; see `infrastructure/README.md`) |
| Mailpit SMTP / UI | `localhost:1025` / `localhost:8025` |

Override host ports via `.env` when defaults collide (`POSTGRES_PORT`, `MINIO_API_PORT`, `MINIO_CONSOLE_PORT`, `MAILPIT_SMTP_PORT`, `MAILPIT_UI_PORT`). Images are multi-arch (including Apple Silicon).

### Volume cleanup

```bash
# Stop only (retain data)
docker compose -f infrastructure/docker-compose.yml --env-file .env down

# Full local data reset
docker compose -f infrastructure/docker-compose.yml --env-file .env down -v
# or: make reset-local
```

## Quick start — database migrations & seeds (LMP-22)

With Postgres up (`make dev-up` or any PG matching `DATABASE_URL`):

```bash
npm run db:migrate   # prisma migrate deploy
npm run db:seed      # fictional profiles at 24, 32, 47, 59, 71 months
```

Clean remigrate + re-seed (isolated synthetic DB only; explicit approval required):

```bash
LM_CONFIRM_DB_RESET=1 npm run db:reset
```

Safety gate (`scripts/db-reset-guard.ts`): allowlisted loopback/compose hosts only, synthetic DB name (`little_minds` / `_test|_dev|_ci|_local`), remote hosts default-denied. Do not tunnel production/staging onto loopback and reset.

Rollback / recovery strategy, mapping table, and open questions: [`prisma/README.md`](./prisma/README.md), [`prisma/MAPPING.md`](./prisma/MAPPING.md).

## Scripts

| Command | Purpose |
|---|---|
| `npm run start:dev` | Watch mode local API |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm test` | Jest unit tests (includes Prisma schema/seed contract) |
| `npm run test:e2e` | HTTP e2e (supertest) |
| `npm run test:db` | Live Postgres migrate/seed integrity (needs `DATABASE_URL`) |
| `npm run db:migrate` | Apply versioned Prisma migrations |
| `npm run db:seed` | Deterministic synthetic seed |
| `npm run db:reset` | Drop, remigrate, seed |
| `npm run prisma:generate` | Generate Prisma Client |
| `bash scripts/check-lmp19-docs.sh` | LMP-19 pointer doc checks |
| `bash scripts/check-compose.sh` | LMP-21 Compose / `.env.example` contract |

## Configuration

Validated at Nest startup with **Zod** (`src/config/env.validation.ts`):

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | yes (defaulted) | `development` | `development` \| `test` \| `production` |
| `PORT` | yes (defaulted) | `3000` | Positive int ≤ 65535 |
| `DATABASE_URL` | Prisma CLI / `test:db` | (see `.env.example`) | Nest liveness does **not** require it yet |

Compose-related variables in `.env.example` (`DATABASE_URL`, MinIO, SMTP, host ports) configure local containers and Prisma. Nest process boot remains DB-optional until a later readiness task.

Commit `.env.example` only. Never commit `.env` / secrets. Local Compose credentials are intentionally weak **dev-only** defaults. Seeds use **synthetic** fixtures only — never real child PII.

## Layout (Blueprint §12.2)

```text
src/modules/          Nest modular monolith (Health + Identity stub; other §12.3 dirs are placeholders)
prisma/               Schema, migrations, synthetic seeds (LMP-22)
infrastructure/       Docker Compose local services (LMP-21)
contracts/            LMP-23
docs/adr/             LMP-19 backend ADR pointers (canonical ADRs live in client)
```

## Documentation pointers

- Product Blueprint: `docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md`
- ADR index pointer: `docs/adr/README.md`
- Device matrix pointer: `docs/device-support-matrix.md`
- Staging isolation pointer: `docs/environments-staging-isolation.md`
- Agent instructions: `AGENTS.md`
