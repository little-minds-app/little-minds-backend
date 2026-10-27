#!/usr/bin/env bash
# LMP-23 OpenAPI contract checks: validate, compatibility, generate, drift.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== LMP-23 contract checks ==="

test -f contracts/openapi.yaml
test -f contracts/VERSION
test -f contracts/compatibility/required-contract.json
test -f contracts/README.md

npm run contracts:validate
npm run contracts:compat
npm run contracts:generate

if ! git diff --exit-code -- contracts/generated >/dev/null; then
  echo "FAIL contracts:drift — contracts/generated is out of date. Run: npm run contracts:generate"
  git --no-pager diff -- contracts/generated | head -n 200
  exit 1
fi

# Also fail if generate created untracked files under contracts/generated
if [[ -n "$(git ls-files --others --exclude-standard -- contracts/generated)" ]]; then
  echo "FAIL contracts:drift — untracked files under contracts/generated"
  git ls-files --others --exclude-standard -- contracts/generated
  exit 1
fi

echo "PASS contracts:drift — generated clients match git"
echo "=== RESULT: PASSED ==="
