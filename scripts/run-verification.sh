#!/usr/bin/env bash
# LMP-132 — single local verification entrypoint with PASS/FAIL summary.
# Fast checks always run; Postgres-backed suites run only when DATABASE_URL is set.
set -u -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

declare -a RESULTS=()
FAILED=0

run_step() {
  local name="$1"
  shift
  printf '\n==> %s\n' "$name"
  if "$@"; then
    RESULTS+=("PASS  $name")
  else
    RESULTS+=("FAIL  $name")
    FAILED=1
  fi
}

run_step "lint" npm run lint
run_step "typecheck" npm run typecheck
run_step "unit tests (jest *.spec.ts)" npm test -- --ci --coverage=false
run_step "HTTP e2e (in-memory)" npm run test:e2e -- --ci
run_step "OpenAPI contracts" npm run contracts:check
run_step "OpenAPI jest proofs" npm test -- --ci --coverage=false \
  test/openapi.contract.spec.ts \
  test/openapi.negative.contract.spec.ts
run_step "compose contract" bash scripts/check-compose.sh
run_step "env/secrets contract" bash scripts/check-env-secrets.sh
run_step "LMP-19 docs structure" bash scripts/check-lmp19-docs.sh

if [[ -n "${DATABASE_URL:-}" ]]; then
  run_step "prisma migrate deploy" npm run db:migrate
  run_step "prisma seed" npm run db:seed
  run_step "database integration (jest-db)" npm run test:db -- --ci
else
  RESULTS+=("SKIP  database integration (set DATABASE_URL to enable)")
  RESULTS+=("SKIP  prisma migrate/seed (set DATABASE_URL to enable)")
fi

printf '\n========== LMP-132 verification summary ==========\n'
for line in "${RESULTS[@]}"; do
  printf '%s\n' "$line"
done
printf '==================================================\n'

if [[ "$FAILED" -ne 0 ]]; then
  printf 'OVERALL: FAIL\n'
  exit 1
fi
printf 'OVERALL: PASS\n'
exit 0
