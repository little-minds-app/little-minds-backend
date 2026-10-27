#!/usr/bin/env bash
# LMP-19 backend pointer documentation checks (QA-UI-001 non-UI path).
# Verifies pointer docs exist, link to the canonical client docs, and preserve
# LOCKED ADR-018 / F-034 / F-028 signals without duplicating the full client matrix.
# Exit 0 on success; non-zero on failure. Print PASS/FAIL per test ID.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

pass() { echo "PASS $1 — $2"; }
fail() { echo "FAIL $1 — $2"; FAIL=1; }

require_file() {
  local id="$1" path="$2"
  if [[ -f "$ROOT/$path" ]]; then
    pass "$id" "exists: $path"
  else
    fail "$id" "missing: $path"
  fi
}

require_grep() {
  local id="$1" path="$2" pattern="$3" desc="$4"
  if [[ -f "$ROOT/$path" ]] && grep -Eq "$pattern" "$ROOT/$path"; then
    pass "$id" "$desc"
  else
    fail "$id" "$desc (pattern not found in $path)"
  fi
}

echo "=== LMP-19 backend pointer documentation checks ==="
echo "ROOT=$ROOT"

# LMP-19-TC-001 — required pointer docs + Blueprint exist
require_file "LMP-19-TC-001a" "docs/device-support-matrix.md"
require_file "LMP-19-TC-001b" "docs/adr/README.md"
require_file "LMP-19-TC-001c" "docs/environments-staging-isolation.md"
require_file "LMP-19-TC-001d" "docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md"

# LMP-19-TC-002 — pointer role + canonical client links + LOCKED / F-034 signals
require_grep "LMP-19-TC-002a" "docs/device-support-matrix.md" 'canonical|Canonical' "matrix pointer declares canonical location"
require_grep "LMP-19-TC-002b" "docs/device-support-matrix.md" 'little-minds-client' "matrix pointer references client repo"
require_grep "LMP-19-TC-002c" "docs/device-support-matrix.md" '\*\*LOCKED\*\*|LOCKED' "matrix pointer declares LOCKED decisions"
require_grep "LMP-19-TC-002d" "docs/device-support-matrix.md" 'TECHNICAL ASSUMPTION' "matrix pointer marks TECHNICAL ASSUMPTION boundary"
require_grep "LMP-19-TC-002e" "docs/device-support-matrix.md" 'F-034' "F-034 referenced"
require_grep "LMP-19-TC-002f" "docs/device-support-matrix.md" 'ADR-018' "ADR-018 referenced"
require_grep "LMP-19-TC-002g" "docs/device-support-matrix.md" 'Landscape-only' "ADR-018 landscape-only surfaces listed"
require_grep "LMP-19-TC-002h" "docs/device-support-matrix.md" 'Portrait \+ landscape' "Parent Gate/Settings dual orientation listed"
require_grep "LMP-19-TC-002i" "docs/device-support-matrix.md" 'no orientation lock' "Next.js Parent Dashboard unlocked orientation listed"
require_grep "LMP-19-TC-002j" "docs/device-support-matrix.md" 'iOS' "iOS form factors mentioned"
require_grep "LMP-19-TC-002k" "docs/device-support-matrix.md" 'Android' "Android form factors mentioned"
require_grep "LMP-19-TC-002l" "docs/device-support-matrix.md" 'Phone' "Phone form factor present"
require_grep "LMP-19-TC-002m" "docs/device-support-matrix.md" 'Tablet' "Tablet form factor present"
require_grep "LMP-19-TC-002n" "docs/environments-staging-isolation.md" 'LOCKED' "staging isolation marked LOCKED"
require_grep "LMP-19-TC-002o" "docs/environments-staging-isolation.md" 'synthetic|Synthetic' "staging synthetic fixtures called out"
require_grep "LMP-19-TC-002p" "docs/environments-staging-isolation.md" 'little-minds-client' "staging pointer references client repo"
require_grep "LMP-19-TC-002q" "docs/adr/README.md" 'little-minds-client' "ADR pointer references client repo"
require_grep "LMP-19-TC-002r" "docs/adr/README.md" 'canonical|Canonical' "ADR pointer declares canonical location"

# LMP-19-TC-003 — ADR index ↔ Approved ADRs (incl. ADR-018) + Blueprint
require_grep "LMP-19-TC-003a" "docs/adr/README.md" 'ADR-013' "ADR-013 indexed"
require_grep "LMP-19-TC-003b" "docs/adr/README.md" 'ADR-014' "ADR-014 indexed"
require_grep "LMP-19-TC-003c" "docs/adr/README.md" 'ADR-015' "ADR-015 indexed"
require_grep "LMP-19-TC-003d" "docs/adr/README.md" 'ADR-016' "ADR-016 indexed"
require_grep "LMP-19-TC-003e" "docs/adr/README.md" 'ADR-017' "ADR-017 indexed"
require_grep "LMP-19-TC-003f" "docs/adr/README.md" 'ADR-018' "ADR-018 indexed"
require_grep "LMP-19-TC-003g" "docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md" 'ADR-018' "Blueprint contains ADR-018"
require_grep "LMP-19-TC-003h" "docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md" 'Landscape-only' "Blueprint ADR-018 landscape-only policy present"

# LMP-19-TC-004 — runner self-presence (CI wires this script)
require_file "LMP-19-TC-004a" "scripts/check-lmp19-docs.sh"

if [[ "$FAIL" -ne 0 ]]; then
  echo "=== RESULT: FAILED ==="
  exit 1
fi
echo "=== RESULT: PASSED ==="
exit 0
