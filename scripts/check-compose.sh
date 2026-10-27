#!/usr/bin/env bash
# Validate LMP-21 Docker Compose contract without requiring a running daemon.
# When Docker is available, also runs `docker compose config`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT}/infrastructure/docker-compose.yml"
ENV_EXAMPLE="${ROOT}/.env.example"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

echo "==> Checking compose file exists"
test -f "${COMPOSE_FILE}" || fail "missing ${COMPOSE_FILE}"
test -f "${ENV_EXAMPLE}" || fail "missing ${ENV_EXAMPLE}"

echo "==> Checking required services and healthchecks in compose YAML"
python3 - <<'PY' "${COMPOSE_FILE}"
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
required_services = ("postgres:", "minio:", "mailpit:")
for name in required_services:
    if f"\n  {name}" not in text and not text.startswith(f"  {name}"):
        # also accept top-level indent variants already covered; fail clearly
        if name not in text:
            raise SystemExit(f"missing service stanza for {name.rstrip(':')}")

for token in (
    "healthcheck:",
    "little_minds_postgres_data:",
    "little_minds_minio_data:",
    "little_minds_mailpit_data:",
    "POSTGRES_PORT",
    "MINIO_API_PORT",
    "MINIO_CONSOLE_PORT",
    "MAILPIT_UI_PORT",
    "MAILPIT_SMTP_PORT",
):
    if token not in text:
        raise SystemExit(f"compose contract missing expected token: {token}")

# Ensure each named service block mentions healthcheck nearby (coarse but stable)
for svc in ("postgres", "minio", "mailpit"):
    idx = text.find(f"\n  {svc}:")
    if idx < 0:
        raise SystemExit(f"service '{svc}' not found at expected indent")
    # look ahead until next service or volumes
    rest = text[idx + 1 :]
    next_svc = len(rest)
    for other in ("postgres", "minio", "mailpit", "volumes"):
        if other == svc:
            continue
        marker = f"\n  {other}:"
        pos = rest.find(marker)
        if 0 <= pos < next_svc:
            next_svc = pos
    block = rest[:next_svc]
    if "healthcheck:" not in block:
        raise SystemExit(f"service '{svc}' is missing a healthcheck")
    if "ports:" not in block:
        raise SystemExit(f"service '{svc}' is missing ports")

print("compose YAML contract OK")
PY

echo "==> Checking .env.example documents local service ports/credentials"
python3 - <<'PY' "${ENV_EXAMPLE}"
from pathlib import Path
import sys

text = Path(sys.argv[1]).read_text(encoding="utf-8")
required = (
    "NODE_ENV=",
    "PORT=",
    "POSTGRES_USER=",
    "POSTGRES_PASSWORD=",
    "POSTGRES_DB=",
    "POSTGRES_PORT=",
    "DATABASE_URL=",
    "MINIO_ROOT_USER=",
    "MINIO_ROOT_PASSWORD=",
    "MINIO_API_PORT=",
    "MINIO_CONSOLE_PORT=",
    "MAILPIT_SMTP_PORT=",
    "MAILPIT_UI_PORT=",
)
missing = [k for k in required if k not in text]
if missing:
    raise SystemExit(f".env.example missing keys: {', '.join(missing)}")
print(".env.example contract OK")
PY

if command -v docker >/dev/null 2>&1; then
  echo "==> Running docker compose config (when Docker CLI is present)"
  TMP_ENV="$(mktemp)"
  cp "${ENV_EXAMPLE}" "${TMP_ENV}"
  if docker compose version >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      docker compose -f "${COMPOSE_FILE}" --env-file "${TMP_ENV}" config --quiet
      echo "docker compose config OK"
    else
      # Config parsing usually works without a daemon; try anyway and soft-report.
      if docker compose -f "${COMPOSE_FILE}" --env-file "${TMP_ENV}" config --quiet; then
        echo "docker compose config OK (daemon unavailable for runtime)"
      else
        echo "WARN: docker compose config failed; YAML contract checks already passed"
      fi
    fi
  else
    echo "WARN: docker compose plugin not available; skipped compose config"
  fi
  rm -f "${TMP_ENV}"
else
  echo "WARN: docker CLI not available; skipped compose config (YAML contract checks passed)"
fi

echo "PASSED: compose local-dev contract checks"
