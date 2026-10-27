# little-minds-backend

Little Minds NestJS modular monolith API and infrastructure (ADR-014).

## Prerequisites

- **Node.js 20 LTS** (see `.nvmrc`)
- **npm** (package manager for this repo)

No PostgreSQL or Docker Compose is required to boot the Nest process (Compose lands in **LMP-21**).

## Quick start

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

`GET /health` is unauthenticated process liveness only. Product routes will use `/v1/...` later. Database readiness is deferred.

## Scripts

| Command | Purpose |
|---|---|
| `npm run start:dev` | Watch mode local API |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm test` | Jest unit tests |
| `npm run test:e2e` | HTTP e2e (supertest) |
| `bash scripts/check-lmp19-docs.sh` | LMP-19 pointer doc checks |

## Configuration

Validated at startup with **Zod** (`src/config/env.validation.ts`):

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | yes (defaulted) | `development` | `development` \| `test` \| `production` |
| `PORT` | yes (defaulted) | `3000` | Positive int ≤ 65535 |

Commit `.env.example` only. Never commit `.env` / secrets.

## Layout (Blueprint §12.2)

```text
src/modules/          Nest modular monolith (Health + Identity stub; other §12.3 dirs are placeholders)
prisma/               LMP-22
infrastructure/       LMP-21
contracts/            LMP-23
docs/adr/             LMP-19 backend ADR pointers (canonical ADRs live in client)
```

## Documentation pointers

- Product Blueprint: `docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md`
- ADR index pointer: `docs/adr/README.md`
- Device matrix pointer: `docs/device-support-matrix.md`
- Staging isolation pointer: `docs/environments-staging-isolation.md`
- Agent instructions: `AGENTS.md`
