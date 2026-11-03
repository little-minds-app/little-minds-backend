#!/usr/bin/env bash
# LMP-132 — single local verification entrypoint with PASS/FAIL/SKIP/NOT RUN summary.
# Database integration is opt-in only (--with-db or LM_VERIFY_WITH_DB=1) and requires a
# disposable DATABASE_URL (little_minds_{test|ci|local|dev} on loopback/compose).
set -u -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WITH_DB=0
VERIFY_EPHEMERAL_PG_CONTAINER="${LM_VERIFY_EPHEMERAL_PG:-}"

usage() {
  cat <<'EOF'
Usage: npm run verify:local [-- --with-db]

Always runs: lint, typecheck, unit tests, in-memory HTTP e2e, OpenAPI/contracts, compose/env/docs.

Database integration (migrate + seed + test:db) runs ONLY when:
  - you pass --with-db, OR set LM_VERIFY_WITH_DB=1, AND
  - DATABASE_URL targets a disposable test database:
      postgresql://…@127.0.0.1|localhost|postgres:5432/little_minds_{test|ci|local|dev}

Optional ephemeral Postgres (when docker is available and DATABASE_URL unset):
  LM_VERIFY_EPHEMERAL_PG=1 npm run verify:local -- --with-db

Never auto-runs db:migrate/db:seed from DATABASE_URL alone.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-db) WITH_DB=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ "${LM_VERIFY_WITH_DB:-}" == "1" ]]; then
  WITH_DB=1
fi

declare -a RESULTS=()
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
NOT_RUN_COUNT=0
DB_REQUESTED=$WITH_DB
EPHEMERAL_STARTED=0
EPHEMERAL_CONTAINER="${LM_VERIFY_PG_CONTAINER_NAME:-little-minds-verify-pg}"

record() {
  local status="$1"
  local name="$2"
  local label="$status"
  if [[ "$status" == NOT_RUN ]]; then
    label="NOT RUN"
  fi
  RESULTS+=("$label  $name")
  case "$status" in
    PASS) PASS_COUNT=$((PASS_COUNT + 1)) ;;
    FAIL) FAIL_COUNT=$((FAIL_COUNT + 1)) ;;
    SKIP) SKIP_COUNT=$((SKIP_COUNT + 1)) ;;
    NOT_RUN) NOT_RUN_COUNT=$((NOT_RUN_COUNT + 1)) ;;
  esac
}

run_step() {
  local name="$1"
  shift
  printf '\n==> %s\n' "$name"
  if "$@"; then
    record PASS "$name"
    return 0
  fi
  record FAIL "$name"
  return 1
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

stop_ephemeral_pg() {
  if [[ "$EPHEMERAL_STARTED" -eq 1 ]] && command -v docker >/dev/null 2>&1; then
    docker rm -f "$EPHEMERAL_CONTAINER" >/dev/null 2>&1 || true
  fi
}

try_start_ephemeral_pg() {
  if [[ -n "${DATABASE_URL:-}" ]]; then
    return 0
  fi
  if [[ "$VERIFY_EPHEMERAL_PG_CONTAINER" != "1" ]] || ! command -v docker >/dev/null 2>&1; then
    return 1
  fi
  local port="${LM_VERIFY_PG_PORT:-5433}"
  printf '\n==> starting ephemeral Postgres (little_minds_ci on port %s)\n' "$port"
  docker rm -f "$EPHEMERAL_CONTAINER" >/dev/null 2>&1 || true
  if ! docker run -d --name "$EPHEMERAL_CONTAINER" \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=little_minds_ci \
    -p "${port}:5432" \
    postgres:16-alpine >/dev/null; then
    return 1
  fi
  EPHEMERAL_STARTED=1
  export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:${port}/little_minds_ci?schema=public"
  local tries=0
  while [[ "$tries" -lt 30 ]]; do
    if docker exec "$EPHEMERAL_CONTAINER" pg_isready -U postgres -d little_minds_ci >/dev/null 2>&1; then
      return 0
    fi
    tries=$((tries + 1))
    sleep 1
  done
  return 1
}

run_db_integration() {
  local guard_ok=0
  if [[ -z "${DATABASE_URL:-}" ]]; then
    if ! try_start_ephemeral_pg; then
      record NOT_RUN "database integration (no DATABASE_URL; docker unavailable or LM_VERIFY_EPHEMERAL_PG not set)"
      record NOT_RUN "prisma migrate deploy (database integration not run)"
      record NOT_RUN "prisma seed (database integration not run)"
      return 1
    fi
  fi

  export LM_VERIFY_WITH_DB=1
  printf '\n==> verify DB guard\n'
  if npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/verify-db-guard.ts; then
    guard_ok=1
  else
    record FAIL "verify DB guard (refused unsafe DATABASE_URL or missing opt-in)"
    record NOT_RUN "prisma migrate deploy (guard failed)"
    record NOT_RUN "prisma seed (guard failed)"
    record NOT_RUN "database integration jest-db (guard failed)"
    return 1
  fi

  if [[ "$guard_ok" -eq 1 ]]; then
    if ! run_step "prisma migrate deploy" npm run db:migrate; then
      record NOT_RUN "prisma seed (blocked by migrate failure)"
      record NOT_RUN "database integration jest-db (blocked by migrate failure)"
      return 1
    fi
    if ! run_step "prisma seed" npm run db:seed; then
      record NOT_RUN "database integration jest-db (blocked by seed failure)"
      return 1
    fi
    run_step "database integration (jest-db)" npm run test:db -- --ci || return 1
  fi
  return 0
}

if [[ "$DB_REQUESTED" -eq 1 ]]; then
  trap stop_ephemeral_pg EXIT
  if ! run_db_integration; then
    : # counts already recorded
  fi
else
  record SKIP "database integration (pass --with-db or LM_VERIFY_WITH_DB=1 to opt in)"
  record SKIP "prisma migrate deploy (database integration not requested)"
  record SKIP "prisma seed (database integration not requested)"
fi

echo ''
echo '========== LMP-132 verification summary =========='
for line in "${RESULTS[@]}"; do
  echo "$line"
done
echo '--------------------------------------------------'
printf 'Counts: PASS=%s FAIL=%s SKIP=%s NOT_RUN=%s\n' \
  "$PASS_COUNT" "$FAIL_COUNT" "$SKIP_COUNT" "$NOT_RUN_COUNT"
echo '=================================================='

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  printf 'OVERALL: FAIL\n'
  exit 1
fi

if [[ "$DB_REQUESTED" -eq 1 ]] && [[ "$NOT_RUN_COUNT" -gt 0 ]]; then
  printf 'OVERALL: INCOMPLETE (database integration requested but not run)\n'
  exit 1
fi

if [[ "$DB_REQUESTED" -eq 1 ]]; then
  # All requested DB stages must have passed (no NOT RUN).
  printf 'OVERALL: PASS (including database integration)\n'
else
  printf 'OVERALL: PASS (fast path; database integration skipped)\n'
fi
exit 0
