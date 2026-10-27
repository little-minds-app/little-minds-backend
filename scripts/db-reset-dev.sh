#!/usr/bin/env bash
# Destructive local/dev database rebuild: drop public schema, remigrate, seed.
# Synthetic fixtures only. Never point at production.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

# Load DATABASE_URL from .env when not already set.
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

case "${DATABASE_URL}" in
  *localhost*|*127.0.0.1*|*postgres:5432*)
    ;;
  *)
    if [[ "${ALLOW_NONLOCAL_DB_RESET:-}" != "1" ]]; then
      echo "Refusing reset: DATABASE_URL does not look local." >&2
      echo "Set ALLOW_NONLOCAL_DB_RESET=1 only for an explicit non-prod lab DB." >&2
      exit 1
    fi
    ;;
esac

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
