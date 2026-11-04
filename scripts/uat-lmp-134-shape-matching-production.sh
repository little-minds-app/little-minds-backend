#!/usr/bin/env bash
# LMP-134 backend UAT helper — strict PASS / FAIL / NOT_RUN per case.
# Exit codes: 0 all PASS | 1 any FAIL | 3 any NOT_RUN (no FAIL)
set -u -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_BASE="${LM_API_BASE:-http://127.0.0.1:3000}"
BEARER="${LM_UAT_BEARER:-}"
INSTALLATION_ID="${LM_UAT_INSTALLATION_ID:-}"
CHILD_ID="${LM_UAT_CHILD_ID:-}"
WITH_DB="${LM_UAT_WITH_DB:-0}"

declare -a TC_OUTCOMES=()
FAIL_COUNT=0
NOT_RUN_COUNT=0

record_tc() {
  local id="$1"
  local status="$2"
  local detail="${3:-}"
  TC_OUTCOMES+=("${id} ${status}${detail:+ — ${detail}}")
  case "$status" in
    FAIL) FAIL_COUNT=$((FAIL_COUNT + 1)) ;;
    NOT_RUN) NOT_RUN_COUNT=$((NOT_RUN_COUNT + 1)) ;;
  esac
}

fail_tc() {
  record_tc "$1" FAIL "$2"
  echo "TC-${1} FAIL: $2" >&2
}

pass_tc() {
  record_tc "$1" PASS "$2"
  echo "TC-${1} PASS${2:+ — $2}"
}

not_run_tc() {
  record_tc "$1" NOT_RUN "$2"
  echo "TC-${1} NOT_RUN: $2" >&2
}

curl_json() {
  curl -fsS "$@"
}

run_tc05_db_suite() {
  export LM_VERIFY_WITH_DB=1
  if ! npx ts-node --compiler-options '{"module":"CommonJS"}' "$ROOT/scripts/verify-db-guard.ts"; then
    fail_tc "05" "verify-db-guard refused DATABASE_URL"
    return 1
  fi
  if ! (cd "$ROOT" && npm run db:migrate); then
    fail_tc "05" "prisma migrate deploy failed"
    return 1
  fi
  if ! (cd "$ROOT" && npm run db:seed); then
    fail_tc "05" "prisma seed failed"
    return 1
  fi
  if ! (cd "$ROOT" && npm run test:db -- --ci \
    test/lmp-134-shape-matching-ingest.db.spec.ts \
    test/device-active-child.db.spec.ts); then
    fail_tc "05" "jest-db LMP-134 ingest + device bind suite failed"
    return 1
  fi
  pass_tc "05" "verify-db-guard + migrate + seed + jest-db suite"
  return 0
}

echo "== LMP-134 backend UAT (API_BASE=${API_BASE}) =="

if ! curl_json "${API_BASE}/health" >/dev/null 2>&1; then
  not_run_tc "01" "GET /health unreachable — start Nest API or set LM_API_BASE"
  not_run_tc "02" "blocked by TC-01"
  not_run_tc "03" "blocked by TC-01"
  not_run_tc "04" "blocked by TC-01"
  not_run_tc "05" "blocked by TC-01"
else
  if ! live="$(curl_json "${API_BASE}/health")"; then
    fail_tc "01" "GET /health non-200"
  else
    pass_tc "01" "GET /health"
  fi

  ready_code="$(curl -s -o /tmp/lm134-ready.json -w '%{http_code}' "${API_BASE}/health/ready")"
  if [[ "$ready_code" != "200" && "$ready_code" != "503" ]]; then
    fail_tc "02" "GET /health/ready unexpected HTTP ${ready_code}"
  else
    pass_tc "02" "GET /health/ready (HTTP ${ready_code})"
  fi

  if [[ -z "$BEARER" || -z "$INSTALLATION_ID" || -z "$CHILD_ID" ]]; then
    not_run_tc "03" "Set LM_UAT_BEARER, LM_UAT_INSTALLATION_ID, LM_UAT_CHILD_ID"
    not_run_tc "04" "blocked by TC-03 prerequisites"
    not_run_tc "05" "blocked by TC-03 prerequisites"
  else
    read_json="$(curl -fsS -H "Authorization: Bearer ${BEARER}" \
      "${API_BASE}/v1/devices/${INSTALLATION_ID}/active-child" 2>/dev/null)" || read_json=""
    if [[ -z "$read_json" ]]; then
      fail_tc "03" "GET active-child before bind failed"
      not_run_tc "04" "blocked by TC-03 failure"
      not_run_tc "05" "blocked by TC-03 failure"
    else
      expected_rev="$(node -e "
        const j=JSON.parse(process.argv[1]);
        if(typeof j.binding_revision!=='number') process.exit(2);
        process.stdout.write(String(j.binding_revision));
      " "$read_json" 2>/dev/null)" || expected_rev=""
      if [[ -z "$expected_rev" ]]; then
        fail_tc "03" "GET active-child missing binding_revision"
        not_run_tc "04" "blocked by TC-03 failure"
        not_run_tc "05" "blocked by TC-03 failure"
      else
        bind_payload="$(curl -fsS -X PUT \
          -H "Authorization: Bearer ${BEARER}" \
          -H "Content-Type: application/json" \
          -d "{\"child_id\":\"${CHILD_ID}\",\"expected_binding_revision\":${expected_rev}}" \
          "${API_BASE}/v1/devices/${INSTALLATION_ID}/active-child" 2>/dev/null)" || bind_payload=""
        if [[ -z "$bind_payload" ]]; then
          fail_tc "03" "PUT active-child bind failed"
          not_run_tc "04" "blocked by TC-03 failure"
          not_run_tc "05" "blocked by TC-03 failure"
        else
          pass_tc "03" "PUT active-child (CAS rev ${expected_rev})"
          read_back="$(curl -fsS -H "Authorization: Bearer ${BEARER}" \
            "${API_BASE}/v1/devices/${INSTALLATION_ID}/active-child" 2>/dev/null)" || read_back=""
          if [[ -z "$read_back" ]]; then
            fail_tc "04" "GET active-child read-back failed"
          elif ! grep -q "\"child_id\":\"${CHILD_ID}\"" <<<"$read_back"; then
            fail_tc "04" "child_id mismatch after bind"
          else
            pass_tc "04" "GET active-child read-back"
          fi

          if [[ "$WITH_DB" == "1" && -n "${DATABASE_URL:-}" ]]; then
            run_tc05_db_suite || true
          else
            not_run_tc "05" "Set LM_UAT_WITH_DB=1 and disposable DATABASE_URL for ingest/db suite"
          fi
        fi
      fi
    fi
  fi
fi

not_run_tc "06" "client hub production buffer (client repo)"

echo ""
echo "========== LMP-134 backend UAT summary =========="
for line in "${TC_OUTCOMES[@]}"; do
  echo "TC-${line}"
done
echo "--------------------------------------------------"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "OVERALL: FAIL"
  exit 1
fi
if [[ "$NOT_RUN_COUNT" -gt 0 ]]; then
  echo "OVERALL: NOT_RUN"
  exit 3
fi
echo "OVERALL: PASS"
exit 0
