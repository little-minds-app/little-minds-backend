# prisma/ — schema, migrations, synthetic seeds (LMP-22)

PostgreSQL is the system of record (Blueprint §38.1). Nest boots without a live DB; Prisma CLI uses `DATABASE_URL` from `.env` (see `.env.example`).

## Prerequisites

1. Copy env: `cp .env.example .env`
2. Start Postgres (Compose preferred): `make dev-up`  
   Or any PostgreSQL 16 reachable via `DATABASE_URL`.
3. `npm ci`

## Commands

| npm script | Purpose |
|---|---|
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run db:migrate:dev` | Dev migrate with prompts (`prisma migrate dev`) |
| `npm run db:seed` | Upsert deterministic synthetic fixtures |
| `npm run db:reset` | Drop `public` schema, re-apply migrations, seed (`scripts/db-reset-dev.sh`) |
| `npm run db:status` | Migration status |
| `npm run test:db` | Migration + seed integrity tests (needs `DATABASE_URL`) |

Make helpers: `make db-migrate`, `make db-seed`, `make db-reset`.

## Fresh local bootstrap

```bash
cp .env.example .env
make dev-up          # or equivalent Postgres
npm ci
npm run db:migrate
npm run db:seed
```

Expected seed ages (months): **24, 32, 47, 59, 71** under one synthetic parent. See `seed.ts` for fixed UUIDs.

## Clean remigrate + re-seed

```bash
# Explicit approval required. Host must be loopback/compose DNS; DB name little_minds[_test|_dev|_ci|_local].
# Mere presence of "localhost" anywhere in the URL is NOT enough (parsed host must match allowlist).
LM_CONFIRM_DB_RESET=1 npm run db:reset
# scripts/db-reset-dev.sh — guard → DROP SCHEMA public CASCADE → migrate deploy → seed
# Remote hosts are always denied. Do not SSH-tunnel production/staging onto loopback and reset.
# Guard-only: LM_DB_RESET_CHECK_ONLY=1 LM_CONFIRM_DB_RESET=1 npm run db:reset
```

Destructive Compose volume wipe: `make reset-local` then `make dev-up` → `npm run db:migrate` → `npm run db:seed`.

Human operators may also use `npx prisma migrate reset` interactively; CI uses `db-reset-dev.sh` with `LM_CONFIRM_DB_RESET=1`.

## Rollback strategy (documented)

Prisma migrations are **forward-versioned**. Production/staging recovery is **not** “auto down migration”:

1. **Expand/contract** — prefer additive, backward-compatible schema changes; avoid destructive first deploys (Blueprint §26.2 / §26.4).
2. **Local/dev** — `npm run db:reset` or Compose `make reset-local` rebuilds synthetic data only.
3. **Staging/prod incident** — restore from a tested database backup / snapshot taken before the bad migration; redeploy last known-good API image; mark failed migration resolved only after recovery (`prisma migrate resolve`) under human approval.
4. **Irreversible migrations** require an explicit reviewed recovery plan before merge (AGENTS.md / Blueprint DoD).

Never point destructive seed/reset tooling at production.

## Mapping & open questions

- Entity mapping: [`MAPPING.md`](./MAPPING.md)
- Unresolved product decisions are listed there — do not invent locks in follow-on PRs without owner review.

## Out of scope for LMP-22

Auth APIs, OpenAPI, Nest PrismaModule wiring into product modules, Blueprint edits.
