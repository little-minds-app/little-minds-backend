#!/usr/bin/env bash
# LMP-134 backend UAT helper — health probes + optional authenticated API checks.
# Exit codes: 0 PASS | 1 FAIL | 2 NOT_RUN (stack unreachable / prerequisites missing)
set -u -o pipefail

API_BASE="${LM_API_BASE:-http://127.0.0.1:3000}"
BEARER="${LM_UAT_BEARER:-}"
INSTALLATION_ID="${LM_UAT_INSTALLATION_ID:-}"
CHILD_ID="${LM_UAT_CHILD_ID:-}"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

not_run() {
  echo "NOT_RUN: $*" >&2
  exit 2
}

curl_json() {
  curl -fsS "$@"
}

echo "== LMP-134 backend UAT (API_BASE=${API_BASE}) =="

if ! curl_json "${API_BASE}/health" >/dev/null 2>&1; then
  not_run "GET /health unreachable — start Nest API or set LM_API_BASE"
fi

live="$(curl_json "${API_BASE}/health")" || fail "GET /health non-200"
echo "TC-01 PASS GET /health"

ready_code="$(curl -s -o /tmp/lm134-ready.json -w '%{http_code}' "${API_BASE}/health/ready")"
if [[ "$ready_code" != "200" && "$ready_code" != "503" ]]; then
  fail "GET /health/ready unexpected status ${ready_code}"
fi
echo "TC-02 PASS GET /health/ready (HTTP ${ready_code})"

if [[ -z "$BEARER" || -z "$INSTALLATION_ID" || -z "$CHILD_ID" ]]; then
  not_run "Set LM_UAT_BEARER, LM_UAT_INSTALLATION_ID, LM_UAT_CHILD_ID for bind/read/ingest checks"
fi

bind_payload="$(curl -fsS -X PUT \
  -H "Authorization: Bearer ${BEARER}" \
  -H "Content-Type: application/json" \
  -d "{\"child_id\":\"${CHILD_ID}\"}" \
  "${API_BASE}/v1/devices/${INSTALLATION_ID}/active-child")" || fail "TC-03 device bind"
echo "TC-03 PASS PUT /v1/devices/{installationId}/active-child"

read_back="$(curl -fsS -H "Authorization: Bearer ${BEARER}" \
  "${API_BASE}/v1/devices/${INSTALLATION_ID}/active-child")" || fail "TC-04 device read"
if ! grep -q "\"child_id\":\"${CHILD_ID}\"" <<<"$read_back"; then
  fail "TC-04 child_id mismatch after bind"
fi
echo "TC-04 PASS GET /v1/devices/{installationId}/active-child"

echo "TC-05 SKIP ingest batch (requires content_version_id fixture + session payload — run test:db/lmp-134 ingest suite)"
echo "TC-06 SKIP client hub production buffer (client repo)"

echo "OVERALL: PASS (backend health + device bind/read)"
