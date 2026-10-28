# Activity session & event contracts (LMP-50)

**Blueprint:** F-012 / E08 / §14.1 / §38.2–38.4 / ADR-014 / ADR-017  
**Owner:** `little-minds-backend`  
**Product schema version:** `1.0.0` (`contracts/schemas/activity/VERSION`)  
**OpenAPI contract version:** see `contracts/VERSION` (independent semver)

## Purpose

Define versioned **ActivitySessionV1** and **ActivityEventV1** wire documents with provenance, purpose-specific consent fields, typed §14.1 payloads, and fail-closed privacy validation — **without** enabling live ingest.

## Artifacts

| Path | Role |
|---|---|
| `contracts/schemas/activity/*.schema.json` | Authoritative Ajv JSON Schema |
| `contracts/schemas/activity/VERSION` | Product `schema_version` (`1.0.0`) |
| `contracts/fixtures/activity/` | Golden + Near/Far compat fixtures |
| `contracts/openapi.yaml` → `components.schemas.Activity*` | Documented OpenAPI components (no path) |
| `src/modules/activity-ingestion/` | Validators, privacy lint, consent helpers, Near/Far compat adapter |

## Approved decisions

1. **Schemas only** — no `POST /v1/events/batch` / live ingest in this task  
2. **`schema_version`** is semver string `"1.0.0"`, separate from OpenAPI `info.version`  
3. Accept **UUIDv4 and UUIDv7**  
4. Consent scopes are **purpose-specific**; client `decision: granted` is **not** authorization  
5. Near/Far local fixtures are **compat input only** — client emitters are not modified here  
6. Backend-first; **no client pin bump** in this PR  

## Rejected on the wire

- Client `received_at` (server-only)  
- Client `child_id` / unauthorized identity fields  
- Unknown properties (`additionalProperties: false`)  
- Unknown `event_type` outside §14.1  
- PII, free text, media blobs, raw coords, advertising IDs (recursive privacy lint)  
- Paid AI / analytics SDK payloads or dependencies  

## Consent

Events declare `consent_scope` + `consent_policy_version`. Sessions carry a `consent` object including `decision` for UX evidence. Authorization uses **server consent records** (`isConsentScopeAuthorized`); a client `granted` decision never unlocks optional scopes alone.

Draft scope catalog (legal placeholders): `essential_play_events`, `essential_service_telemetry`, `optional_product_analytics`.

## Parent-only events

`mission_feedback_submitted` and `mentor_card_opened` use `provenance.actor_scope: parent` and **omit** `play_session_id` (do not fabricate a child play session).

## Prisma alignment (no migrations in LMP-50)

See `prisma/MAPPING.md` § LMP-50. Wire fields map to existing `ActivitySession` / `ActivityEvent` columns. `child_id` and `received_at` remain **persistence/server** fields. Parent-only events without `play_session_id` need a later ingest persistence strategy — not invented here. Retention day counts remain unresolved.

## Near/Far compatibility

`adaptNearFarFixtureToActivityEventV1` documents required deltas (UUID ids, semver schema_version, consent/provenance injection, drop nested `mentor_adjacency` / free-text `materials`). It does not change the Flutter client.

## Client pin (follow-up)

After this backend PR merges, the client may pin the merge SHA and adopt schemas. Do **not** invent `/v1/events/batch` in the client pin until a backend task publishes that path.

## Tests

`npm test -- src/modules/activity-ingestion/` covers TC-EV-001…024 (ingest-quality flags / live HTTP deferred where noted).
