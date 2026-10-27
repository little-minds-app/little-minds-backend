# Environment definition examples (LMP-28)

Blueprint §26.6 places environment definitions under `infrastructure/environments/`.

These `*.env.example` files are **documentation + fail-fast fixtures**, not provisioned infrastructure.

| File | `APP_ENV` | Purpose |
|---|---|---|
| `development.env.example` | `development` | Local Nest + Compose + Prisma |
| `staging.env.example` | `staging` | Isolated staging placeholders (no real secrets) |
| `production.env.example` | `production` | Isolated production placeholders (no real secrets) |

## Rules

- Commit **examples only**. Real `.env` / secret-store values stay out of git (see root `.gitignore`).
- Exact product env names (cross-repo): `development` \| `staging` \| `production`.
- Clients map flavor → `API_BASE_URL` to this deployment’s `PUBLIC_API_BASE_URL` (see `docs/environments-config.md`).
- Staging/production examples intentionally use `*.example.invalid` hosts and `CHANGE_ME_*` secret placeholders.
- Do **not** provision real staging/prod here (LMP-29+). Do **not** copy production child data into staging.

## Nest validation

`src/config/env.validation.ts` fail-fast validates `APP_ENV` / public URL / secret isolation at process startup.
