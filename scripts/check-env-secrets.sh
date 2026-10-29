#!/usr/bin/env bash
# LMP-28 — env/secrets leakage and example-file contract checks.
# Exit 0 on success; non-zero on failure.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

pass() { echo "PASS $1 — $2"; }
fail() { echo "FAIL $1 — $2"; FAIL=1; }

echo "=== LMP-28 env/secrets contract checks ==="
echo "ROOT=$ROOT"

# --- gitignore allow/deny ---
if grep -Eq '^\.env$' "$ROOT/.gitignore" \
  && grep -Eq '^\.env\.\*$' "$ROOT/.gitignore" \
  && grep -Eq '^!\.env\.example$' "$ROOT/.gitignore" \
  && grep -Eq '^!\.env\.\*\.example$' "$ROOT/.gitignore"; then
  pass "LMP-28-TC-001" ".gitignore ignores .env/.env.* and allows example templates"
else
  fail "LMP-28-TC-001" ".gitignore missing required .env ignore/allow rules"
fi

if grep -Eq '^infrastructure/environments/\*$' "$ROOT/.gitignore" \
  && grep -Eq '^!infrastructure/environments/\*\.example$' "$ROOT/.gitignore"; then
  pass "LMP-28-TC-002" ".gitignore scopes infrastructure/environments examples"
else
  fail "LMP-28-TC-002" ".gitignore missing infrastructure/environments rules"
fi

# --- no committed real env files ---
BAD_ENV_FILES="$(
  git -C "$ROOT" ls-files | grep -E '(^|/)\.env($|\.)' | grep -Ev '\.example$' || true
)"
if [[ -n "$BAD_ENV_FILES" ]]; then
  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    fail "LMP-28-TC-003" "committed env file not allowed: $path"
  done <<<"$BAD_ENV_FILES"
else
  pass "LMP-28-TC-003" "no committed non-example .env files"
fi

# --- required example files ---
for rel in \
  ".env.example" \
  "infrastructure/environments/development.env.example" \
  "infrastructure/environments/staging.env.example" \
  "infrastructure/environments/production.env.example" \
  "docs/environments-config.md"
do
  if [[ -f "$ROOT/$rel" ]]; then
    pass "LMP-28-TC-004" "exists: $rel"
  else
    fail "LMP-28-TC-004" "missing: $rel"
  fi
done

# --- example content contracts ---
python3 - <<'PY' "$ROOT"
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
fail = 0

def ok(msg):
    print(f"PASS LMP-28-TC-005 — {msg}")

def bad(msg):
    global fail
    fail = 1
    print(f"FAIL LMP-28-TC-005 — {msg}")

root_example = (root / ".env.example").read_text(encoding="utf-8")
for token in (
    "APP_ENV=development",
    "PUBLIC_API_BASE_URL=",
    "DATABASE_URL=",
    "PUBLIC configuration",
    "SECRET configuration",
):
    if token not in root_example:
        bad(f".env.example missing token: {token}")

# Staging/production examples must declare APP_ENV and placeholders (no local postgres defaults as active secrets)
for name, app_env in (
    ("staging.env.example", "staging"),
    ("production.env.example", "production"),
):
    text = (root / "infrastructure/environments" / name).read_text(encoding="utf-8")
    if f"APP_ENV={app_env}" not in text:
        bad(f"{name} missing APP_ENV={app_env}")
    if "PUBLIC_API_BASE_URL=https://" not in text:
        bad(f"{name} missing https PUBLIC_API_BASE_URL")
    if "CHANGE_ME" not in text:
        bad(f"{name} missing CHANGE_ME placeholders")
    # Active (uncommented) local compose passwords must not appear
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("#") or not stripped:
            continue
        if re.search(r"^(POSTGRES_PASSWORD|MINIO_ROOT_PASSWORD|S3_SECRET_KEY)=postgres$", stripped):
            bad(f"{name} active local placeholder: {stripped}")
        if re.search(r"^(POSTGRES_PASSWORD|MINIO_ROOT_PASSWORD|S3_SECRET_KEY)=minioadmin$", stripped):
            bad(f"{name} active local placeholder: {stripped}")
        if re.search(r"^DATABASE_URL=.*://postgres:postgres@", stripped):
            bad(f"{name} must not use postgres:postgres DATABASE_URL")

docs = (root / "docs/environments-config.md").read_text(encoding="utf-8")
for token in ("LM_API_BASE_URL", "development", "staging", "production", "PUBLIC_API_BASE_URL"):
    if token not in docs:
        bad(f"docs/environments-config.md missing {token}")

# Reject obvious private-key / AWS-key shaped blobs in tracked example files
danger = re.compile(
    r"BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}"
)
for path in [
    root / ".env.example",
    *(root / "infrastructure/environments").glob("*.example"),
]:
    text = path.read_text(encoding="utf-8")
    if danger.search(text):
        bad(f"possible real secret material in {path.relative_to(root)}")

if fail == 0:
    ok("example files use safe placeholders and document APP_ENV + LM_API_BASE_URL")
sys.exit(fail)
PY

# --- OpenAPI version consistency (additive bumps allowed; do not invent product paths) ---
# LMP-50+ may bump contracts/VERSION (e.g. 0.1.0 → 0.2.0) when adding components.
# This check must NOT hardcode a single pin version; client pins a commit SHA separately.
VERSION_FILE="$ROOT/contracts/VERSION"
OPENAPI_FILE="$ROOT/contracts/openapi.yaml"
if [[ ! -f "$VERSION_FILE" || ! -f "$OPENAPI_FILE" ]]; then
  fail "LMP-28-TC-006" "contracts/VERSION and contracts/openapi.yaml must exist"
else
  CONTRACT_VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
  if [[ ! "$CONTRACT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    fail "LMP-28-TC-006" "contracts/VERSION must be semver X.Y.Z (got: ${CONTRACT_VERSION})"
  elif ! grep -Eq "^[[:space:]]*version:[[:space:]]*['\"]?${CONTRACT_VERSION}['\"]?[[:space:]]*$" "$OPENAPI_FILE"; then
    fail "LMP-28-TC-006" "OpenAPI info.version must match contracts/VERSION (${CONTRACT_VERSION})"
  else
    # Path keys under `paths:` must stay health-only (descriptions may mention future /v1/...).
    PATH_KEYS="$(
      awk '
        /^paths:/ { in_paths=1; next }
        in_paths && /^[^[:space:]]/ { in_paths=0 }
        in_paths && /^[[:space:]]+\/[^[:space:]]+:[[:space:]]*$/ {
          key=$1
          sub(/:$/, "", key)
          gsub(/^[[:space:]]+/, "", key)
          print key
        }
      ' "$OPENAPI_FILE"
    )"
    if [[ -z "$PATH_KEYS" ]]; then
      fail "LMP-28-TC-006" "OpenAPI paths: must declare at least /health"
    else
      EXTRA_PATHS=""
      while IFS= read -r p; do
        [[ -z "$p" ]] && continue
        # LMP-32 health + LMP-33 parent session paths (ADR-019). No other /v1 invent.
        case "$p" in
          /health|/health/ready|/v1/auth/token/refresh|/v1/auth/logout|/v1/auth/logout-all|/v1/auth/sessions|/v1/auth/sessions/{sessionId}|/v1/parent/me|/v1/auth/dev/session|/v1/auth/phone/start|/v1/auth/phone/verify|/v1/auth/oidc/nonce|/v1/auth/google/pkce/start|/v1/auth/apple|/v1/auth/google|/v1/auth/email/start|/v1/auth/email/verify)
            ;;
          *)
            EXTRA_PATHS="${EXTRA_PATHS}${p} "
            ;;
        esac
      done <<<"$PATH_KEYS"
      if [[ -n "$EXTRA_PATHS" ]]; then
        fail "LMP-28-TC-006" "OpenAPI path surface outside health+LMP-33/34/35 auth allowlist; unexpected: ${EXTRA_PATHS}"
      else
        pass "LMP-28-TC-006" "OpenAPI VERSION=${CONTRACT_VERSION} synced; paths health+LMP-33/LMP-34/LMP-35 auth (additive bumps OK)"
      fi
    fi
  fi
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "=== RESULT: FAILED ==="
  exit 1
fi
echo "=== RESULT: PASSED ==="
exit 0
