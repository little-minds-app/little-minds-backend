# contracts/

Authoritative **OpenAPI** artifacts for `little-minds-backend` (Blueprint §12.2, ADR-014).

Backend is the single source of truth. Clients **must not** import a floating `main` branch URL. Pin a specific backend **git commit** (or future release tag) and the path below.

## Artifacts (LMP-23)

| Path | Role |
|---|---|
| `openapi.yaml` | Canonical OpenAPI 3.0.3 document |
| `VERSION` | Contract semver (must match `info.version` in `openapi.yaml`) |
| `compatibility/required-contract.json` | Minimum path/schema gate (breaking removals fail CI) |
| `generated/typescript/` | Deterministic TypeScript types (`openapi-typescript`) |
| `generated/dart/` | Deterministic Dart client (`openapi-generator` / `dart`) |

**Current contract version:** see `VERSION` (starts at `0.1.0`).  
**Current surface:** `GET /health` only. Blueprint §15 `/v1/...` routes are **not** invented here.

## How clients pin (no mutable `main`)

1. Choose a backend commit SHA where `contracts/openapi.yaml` is the revision you need (after human merge of the LMP-23 PR, use that merge commit; during parallel work, pin the backend feature-branch HEAD SHA from the OpenAPI PR).
2. Fetch **only** that revision of the artifact, for example:

```bash
# Replace COMMIT with the exact backend SHA (never "main")
COMMIT=REPLACE_WITH_BACKEND_COMMIT_SHA
curl -fsSL \
  "https://raw.githubusercontent.com/little-minds-app/little-minds-backend/${COMMIT}/contracts/openapi.yaml" \
  -o openapi.yaml

# Optional integrity: confirm VERSION at the same commit
curl -fsSL \
  "https://raw.githubusercontent.com/little-minds-app/little-minds-backend/${COMMIT}/contracts/VERSION"
```

3. Record the pin in the client repo (e.g. `BACKEND_CONTRACT_COMMIT=…` + `BACKEND_CONTRACT_VERSION=0.1.0`) and regenerate TypeScript/Dart clients **inside** `little-minds-client`.
4. Bump the pin deliberately when adopting a new backend contract revision; CI on the client should fail if generation or compatibility checks break.

Do **not** submodule or relative-import backend `src/`. Do **not** point generators at `…/main/contracts/openapi.yaml`.

## Local / CI commands

```bash
npm run contracts:validate   # OpenAPI parse + VERSION sync
npm run contracts:compat     # Allowlist + required fields / breaking gate
npm run contracts:generate   # Regen TS + Dart under contracts/generated/
npm run contracts:check      # validate + compat + generate + git drift
npm run test                 # includes OpenAPI Jest contract tests
```

Java 11+ is required for the OpenAPI Generator CLI (Dart). Node 20 matches `.nvmrc`.

## Scope policy

- Additive `/v1/...` paths land with the Jira feature that implements them — not as speculative stubs.
- Removing or weakening required fields without bumping **major** `VERSION` fails `contracts:compat`.
- Paths outside `compatibility/required-contract.json` → `allowedPaths` fail CI (prevents accidental product API invention in this task).
