#!/usr/bin/env bash
# Destructive local/dev database rebuild: drop public schema, remigrate, seed.
# Synthetic fixtures only. Default-deny remote DB and SSH-tunnel-to-remote misuse.
#
# Required:
#   DATABASE_URL          postgres URL whose host is allowlisted loopback/compose
#                         AND database name is little_minds[_test|_dev|_ci|_local]
#   LM_CONFIRM_DB_RESET=1 explicit approval for this destructive operation
#
# Optional:
#   LM_DB_RESET_CHECK_ONLY=1  run safety guard only (no DROP / migrate / seed)
#
# Mere substring "localhost" in the URL is NOT sufficient — see scripts/db-reset-guard.ts.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

# Load DATABASE_URL from .env when not already set (do not override CI/explicit env).
if [[ -z "${DATABASE_URL:-}" ]]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

echo "Checking DB reset safety gate…"
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/db-reset-guard.ts

if [[ "${LM_DB_RESET_CHECK_ONLY:-}" == "1" ]]; then
  echo "LM_DB_RESET_CHECK_ONLY=1 — guard passed; skipping destructive steps"
  exit 0
fi

echo "Dropping and recreating schema public…"
npx prisma db execute --schema prisma/schema.prisma --stdin <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Applying migrations…"
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Seeding synthetic fixtures…"
npx prisma db seed --schema prisma/schema.prisma

echo "db-reset-dev OK"
