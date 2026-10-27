# infrastructure/

Local supporting services for Little Minds backend development (Blueprint §27.2 / DEVX-001).

## Services (LMP-21)

| Service | Image role | Default host ports | Volume |
|---|---|---|---|
| PostgreSQL 16 | Primary metadata DB | `5432` | `little_minds_postgres_data` |
| MinIO (Bitnami legacy image) | S3-compatible object storage | API `9000`, console `9001` | `little_minds_minio_data` |
| Mailpit | SMTP capture + UI | SMTP `1025`, UI `8025` | `little_minds_mailpit_data` |

Compose file: [`docker-compose.yml`](./docker-compose.yml).

NestJS still runs on the host (`npm run start:dev`). Prisma/migrations/seeds are **LMP-22**. Optional observability profile is **out of scope** here (ADR-013 / later).

### Why `bitnamilegacy/minio`?

Blueprint §27.2 calls for MinIO. As of 2026-09 the historical `minio/minio` Docker Hub repos are gone, Quay legacy pulls require auth, and MinIO AIStor runs offline (denies S3) without a paid license — incompatible with local-first / no-purchase gates. `bitnamilegacy/minio` is a free AGPL MinIO build that stays pullable and S3-usable for local development.

## Quick commands

From repository root (requires Docker Compose v2):

```bash
cp .env.example .env   # once
make dev-up            # or: docker compose -f infrastructure/docker-compose.yml --env-file .env up -d
make dev-ps
make dev-down
make reset-local       # destructive: removes named volumes
```

Port conflicts: override `POSTGRES_PORT`, `MINIO_*_PORT`, `MAILPIT_*_PORT` in `.env`.

## Health

After `make dev-up`, `docker compose … ps` should show all three services as healthy. See the root README for curl/wget smoke examples and Apple Silicon notes.
