# activity-ingestion (LMP-50)

**Status:** Versioned **ActivitySessionV1** / **ActivityEventV1** contracts + Ajv validators.  
**Not in this task:** live `POST /v1/events/batch`, Nest controllers, Prisma migrations, analytics SDKs, client pin bumps.

## Artifacts

| Path | Role |
|---|---|
| `contracts/schemas/activity/` | Authoritative JSON Schema (`schema_version` **1.0.0**) |
| `contracts/fixtures/activity/` | Golden valid + Near/Far compat raw fixtures |
| `contracts/openapi.yaml` components | Documented OpenAPI schemas (no ingest path) |
| `*.validator.ts` / `*.privacy.ts` / `*.consent.ts` | Fail-closed validation |

## Rules (approved)

- Schemas only — no ingest route
- `schema_version` semver string `"1.0.0"` (≠ OpenAPI `info.version`)
- Accept UUIDv4 and UUIDv7
- Consent scopes are purpose-specific; client `decision: granted` is **not** authorization
- Authorization uses **latest-effective** server-attested records (`source: server_consent_store | sync_scope_grant`, trustworthy `effective_at` / optional `revision`); client `decision: granted` never authorizes; conflicts/forged/missing ordering fail closed
- Validator issues use stable codes/paths and do not echo untrusted payload values
- Near/Far is compat input only — do not modify the client in this task
- Reject client `received_at`, `child_id`, unauthorized identity; reject unknown properties

## Validate locally

```bash
npm test -- src/modules/activity-ingestion/
```
