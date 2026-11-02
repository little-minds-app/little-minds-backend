# LMP-51 — Reliable offline event ingestion: implementation decisions

Status: **Proposed / implementation gate**. Issue: LMP-51 (V1/P0, F-012/F-021). Depends on merged LMP-50. The target is reliable delivery, **not** analytics aggregation (LMP-52), dashboards (LMP-53/54), or new gameplay.

## Existing contract and gaps

- Canonical ActivitySessionV1 and ActivityEventV1: `contracts/schemas/activity/` (schema_version `1.0.0`); client-supplied child_id / received_at forbidden.
- Ajv validation, privacy firewall, latest-effective authoritative server consent helpers and a **pure** event ID acknowledgement helper exist in `src/modules/activity-ingestion/`. There is no live ingest route.
- `ActivityEvent.eventId` is a primary key. But `ActivityEvent.playSessionId` is non-null while parent-scope events intentionally omit play_session_id: resolve this before persistence.
- Flutter Near/Far uses a **demo-only in-memory** buffer, numeric schema version and fixture IDs; it must not be uploaded as wire V1.
- Durable outbox, authorization-aware ingest and actual persistence are not shipped by LMP-50.

## Decisions to implement (review before enabling live ingestion)

1. **Ownership and consent fail closed:** authenticate an active parent session; derive parent identity server-side, establish child/session/device/content ownership using DB relationships. Never trust a client child_id, parent_id or client `consent.decision=granted`. Authorize optional scopes only from current server-attested effective records; revoke/deny blocks upload. Define consent source and replay rules for essential scopes in a documented contract.
2. **Idempotency:** stable event_id (UUIDv4/v7) across retries. Transactional unique event insert. Store and compare canonical semantic fingerprint for duplicate event IDs: identical repeats are `duplicate_noop`, mismatched payloads are permanent `idempotency_conflict`. A concurrent insert must produce the same result as sequential replay. Require replay authorization and scope isolation before revealing duplicate existence across accounts.
3. **Out-of-order:** session metadata is idempotently upserted and verified before dependent events; delayed/out-of-order events may be stored without deriving KPI until LMP-52. No fabricated parent-only play session. Resolve nullable FK versus dedicated parent-event persistence **with explicit migration and ownership model**, including session association and deletion semantics.
4. **Response/ACK:** `POST /v1/events/batch` requires session auth, bounded count and request bytes, versioned request/response, explicit per-event `accepted`, `duplicate_noop`, permanent `rejected` with stable reason code and retryable transient outcomes. HTTP transport timeout or ambiguous ACK means retry unchanged event_id. No raw user payload in errors.
5. **Durable Flutter outbox:** atomic SQLite enqueue; account partition tied to authenticated parent (never rebind events on logout/account switch), immutable event IDs and canonical payload, crash recovery of in-flight items, per-item ACK deletion, backoff+jitter, Retry-After support, 401 refresh-or-pause, terminal quarantine, disk quota and explicit overflow behavior. Avoid background execution guarantees the OS does not provide.
6. **Privacy & lifecycle:** reject PII before enqueue and again on ingest; optional consent withdrawals block subsequent transmission and purge/quarantine pending optional events; retention, deletion and disk quota require an approved documented policy before production rollout. Expose only count/status/latency metrics, no raw payloads or secrets in logs.

## Initial non-binding limits pending contract validation

- Max **50** events per request, plus a separately enforced JSON byte size limit.
- Retry exponential backoff with full jitter starting around **2 seconds**, bounded maximum and Retry-After override.
- LMP-51 acceptance must explicitly test ambiguous ACK (server commit then network failure), multi-parent local queue isolation, concurrent duplicate submission, same-ID/different-payload conflict, late parent-only event, and revoked consent.

## Delivery phases and exit gates

**A. Contract & migration (first):** write ADR/decision and OpenAPI request/response, choose parent-only storage strategy and consent policy, Prisma migration & migration tests. No unreviewed endpoint.
**B. Backend:** Nest guards, validators, transactional persistence, real PostgreSQL concurrency/HTTP E2E, replay/authorization tests.
**C. Flutter:** durable outbox + generated client pin, typed emitter adaptation, lifecycle/retry, deterministic tests.
**D. Fullstack:** offline/network-loss, duplicate, reorder, consent, account switch, migration and CI; independent security review; human merge authorization.

**Stop conditions:** any unresolved parent-only FK/ownership decision, ambiguous consent policy, cross-account replay leakage, or schema mismatch blocks live ingest. Do not silently invent retention periods or enable third-party analytics.

## Verification matrix (minimum)

- offline enqueue persists across app restart and process crash
- timeout after DB commit returns idempotent duplicate on retry
- 10 duplicate submissions / concurrent requests -> one DB event
- same ID changed payload -> conflict (without leaking other users' event data)
- completion before start does not create incorrect KPI or FK corruption
- session/device/content cross-parent references rejected
- server consent withdrawn despite prior client grant -> no optional event ingest
- parent-only event without play_session_id persists correctly
- 401/429/5xx partial-batch retry behavior; queue quota and invalid schema
- Flutter account switch and logout cannot upload previous parent's pending events
- clean migrations and schema-contract compatibility, plus CI and code review

This document scopes implementation; it does **not** imply any of these live behaviors are already implemented or tested.
