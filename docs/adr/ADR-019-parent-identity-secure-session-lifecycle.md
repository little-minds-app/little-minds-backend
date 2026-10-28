# ADR-019 — Parent identity & secure session lifecycle

| Field | Value |
|---|---|
| **Status** | **Proposed** — revised from human-review direction; still requires explicit human **Accept** before implementation |
| **Date** | 2026-10-28 (revised same day) |
| **Jira** | [LMP-33](https://little-minds-app.atlassian.net/browse/LMP-33) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-015`) |
| **Blueprint** | F-001, F-031 · §12 Auth · §13.1 identity tables · §29 · §31.1 / ADR-002 · §31.4 privacy · §27.4 local identity · §38 ownership |
| **Supersedes / completes** | ADR-002 *implementation/security design* gap (architecture direction remains; this ADR specifies the session design) |
| **Repos** | `little-minds-backend` only in this PR. **After Accept**, sync the client ADR index (ADR-014) in a separate client task/PR — **not** in this backend docs PR. |
| **Companion sketch** | [`lmp-33-session-api-contract-sketch.md`](./lmp-33-session-api-contract-sketch.md) (non-normative until Accepted; live OpenAPI stays `0.3.0` until the **implementation** PR) |

> **Hard gate:** Do **not** implement production authentication, Prisma session migrations, or live OpenAPI auth paths until this ADR is **Accepted** by an explicit human decision. Status remains **Proposed** until then. No paid auth vendors. No GSM OTP here (LMP-34).

---

## 1. Context

LMP-33 requires a stable parent identity domain and a secure session lifecycle (refresh, expire, revoke, logout), Nest auth guards, parent ownership / cross-account denial, privacy-safe logging, and automated success + reject tests.

**Already on `main` (as of `7e4bf87`, LMP-32):**

- Prisma `ParentAccount` + `ParentIdentity` (LMP-22); synthetic seed parent/children
- Empty Nest `IdentityModule` stub (LMP-20)
- Nest `PrismaModule` / `PrismaService` for readiness (LMP-32)
- Structured redacted logging, correlation IDs, allowlisted context (LMP-32 / ADR-013)
- OpenAPI `0.3.0` health + readiness only — **no** `/v1/auth/*`
- Env catalog reserves `JWT_SECRET` as a documentation placeholder (LMP-28) — **not** used by this asymmetric design

**ADR-002 (resolved direction):** self-hosted NestJS `IdentityModule`, extraction-ready ports, established crypto libraries, no Supabase Auth, SMS OTP via adapter (LMP-34). This ADR fills the remaining session security design gap.

---

## 2. Decision summary (Proposed — review-aligned)

| Topic | Decision |
|---|---|
| Access token | **JWT**, **Ed25519** via `jose`, **15 minutes** TTL, `Authorization: Bearer` |
| Refresh token | **Opaque** (≥256-bit), **peppered hash** at rest, **absolute 30-day** session/refresh expiry |
| Sessions | Independent multi-device rows; optional `device_id`; **max 20 active** per parent |
| Rotation | Transactional **single-winner**; bounded hash **history** for reuse detection |
| Reuse | Revokes **that session only** |
| Concurrent / lost refresh | No client retry of a consumed refresh token; **single-flight** client refresh; lost response → re-authenticate |
| Transport | JSON body + Bearer for API clients. **No cookies in LMP-33** (LMP-38) |
| Protected requests | **Always** load session row by `sid` so revoke/logout takes **immediate** effect |
| Ownership | Internal guards/helpers + integration tests only — **no** public ownership-check API |
| Dev bootstrap | Local/test only; **no** arbitrary impersonation on shared/remote-reachable dev hosts |
| Logging | Never JWT, refresh tokens, credentials, or parent/child PII / raw parent identifiers |
| Keys | Signing key + pepper = **secrets**; public verify keys = **non-secret**; **no paid KMS** in V1 |
| OpenAPI | Live **`0.4.0` only in the implementation PR**, not this docs PR |
| Catalog | Additive `parent_sessions` persistence is an accepted Blueprint catalog extension (on ADR Accept) |
| OTP / paid auth | Out of scope — LMP-34+; no paid identity services |

---

## 3. Token model

### 3.1 Access token (JWT)

| Property | Value |
|---|---|
| Format | JWS compact serialization |
| Algorithm | **EdDSA / Ed25519** (`alg: EdDSA`) via maintained library **`jose`** |
| TTL | **`exp - iat = 900` seconds (15 minutes)** — fixed in V1 |
| Clock skew | Verify with ≤ **60s** leeway |
| Header | `alg`, `typ: JWT`, `kid` |
| Claims | Allowlisted only — **no** phone, email, names, child ids, tokens |

**Required claims:**

| Claim | Meaning |
|---|---|
| `iss` | Stable issuer (env `JWT_ISSUER`, default `little-minds-backend`) |
| `aud` | `little-minds-parent` (admin uses a different audience later) |
| `sub` | `parent_accounts.id` (UUID string) |
| `sid` | `parent_sessions.id` |
| `jti` | Unique access-token id (UUID); not persisted by default in LMP-33 |
| `iat` / `exp` | Issued / expiry UTC epoch seconds |
| `token_use` | Literal `access` |

**Verification on every protected request:**

1. Verify JWS with current (+ optional previous) **public** keys and claim checks.
2. **Query `parent_sessions` by `sid`** (no TTL cache that can outlive revoke in V1).
3. Reject if session missing, `revoked_at` set, `expires_at` passed, or parent not `lifecycle = active` / soft-deleted.

Immediate logout/revoke is therefore effective on the next authenticated call.

### 3.2 Refresh token (opaque)

| Property | Value |
|---|---|
| Format | ≥ **256 bits** CSPRNG; URL-safe base64; optional version prefix `lmr1.` |
| Lifetime | **Absolute** `expires_at = session.created_at + 30 days` — **no** sliding extension in V1 |
| Persistence | **HMAC-SHA256** (or SHA-256 of `pepper \|\| token`) with server **`REFRESH_TOKEN_PEPPER`**. Never store plaintext |
| Presentation | JSON body field `refresh_token` on refresh/logout |
| Binding | Bound to session + parent; **`device_id` optional** |

### 3.3 Why hybrid

Access JWT keeps per-request crypto verify cheap; mandatory session-row check enforces revoke. Opaque refresh enables rotation, bounded history reuse detection, and multi-device logout without JWT-refresh pitfalls.

---

## 4. Session lifecycle

### 4.1 Session creation (ports)

`IdentityModule` exposes internal **`SessionIssuer`** used by:

1. **LMP-34** phone verify (later LMP-35 providers) — production mint  
2. **Dev/test bootstrap** (§8) — tightly gated  

No public password login or OTP routes in LMP-33.

**Active session cap:** at most **20** sessions per parent with `revoked_at IS NULL` and `expires_at > now()`. When full, mint returns **`403`** with `error: session_limit_exceeded` (client must logout a session or logout-all). Expired rows do not count; a maintenance job may tombstone them later.

On success: create row + return token pair (`access_token`, `refresh_token`, `token_type`, `expires_in`, `session_id`, `parent_id`).

### 4.2 Refresh (single-winner rotation)

`POST /v1/auth/token/refresh`:

1. Hash presented token; find session where **current** `refresh_token_hash` matches.
2. If no current match: run **reuse detection** (§4.3).
3. If expired or revoked → `401`.
4. In a DB transaction:  
   `UPDATE parent_sessions SET refresh_token_hash = :newHash, …, refresh_generation = refresh_generation + 1 WHERE id = :id AND refresh_token_hash = :presentedHash`.  
   - **0 rows updated** → another winner already rotated → treat presented token as **consumed** → `401 invalid_token` (**do not** instruct the client to retry that token).  
   - **1 row** → append prior hash to bounded history (§4.3); issue new access JWT (same `sid`); return new pair.

### 4.3 Bounded refresh-token hash history (reuse detection)

Each session keeps a **bounded ring of prior refresh-token hashes** (not plaintext):

| Field | Purpose |
|---|---|
| `refresh_token_hash` | Sole **currently valid** hash |
| `refresh_token_hash_history` | JSON array of `{ "h": "<hash>", "g": <generation>, "at": "<iso>" }`, **max length 8** (oldest dropped) |
| `token_family_id` | Stable per session (audit / correlation without raw parent ids) |
| `refresh_generation` | Monotonic counter |

**Rules:**

| Presented hash | Outcome |
|---|---|
| Equals current | Rotate (winner path) |
| Found in history (any prior generation) | **Reuse** → revoke **this session only** (`revoked_reason = refresh_reuse`), clear current + history hashes, `401` `refresh_reuse` |
| Unknown | `401` `invalid_token` (generic; no existence leak) |

History exists so a stolen older token cannot silently mint after rotation; presenting it burns **that** session, not every device.

### 4.4 Concurrent refresh & lost responses

**Server**

- Single-winner transactional update on current hash (§4.2).
- Concurrent loser (same consumed token): `401 invalid_token` — **never** `409` that tells the client to resubmit the consumed refresh token.
- No server path returns a previously issued plaintext refresh token.

**Client (normative guidance for implementers / OpenAPI description)**

1. **Single-flight refresh:** at most one in-flight refresh per app process; coalesce callers on that promise.
2. On `200`, **persist the new pair atomically** to secure storage, then discard the old refresh token.
3. **Do not retry a refresh token** after it has been successfully used, after a `401`/`refresh_reuse`, or when the outcome of a refresh HTTP call is **unknown** (timeout / connection drop after send).
4. **Lost-response recovery:** if the client cannot confirm that new tokens were received and persisted, clear local auth state and **re-authenticate** (LMP-34 sign-in). Retrying the old refresh token risks reuse detection and session revoke — that retry is **forbidden** by this ADR.
5. Parallel dual-flight bugs should surface as `401` for the loser; recover via re-auth, not refresh retry.

### 4.5 Expiry

- Access JWT: `exp` at 15 minutes.
- Session/refresh: absolute 30 days from `created_at`. Guards and refresh both enforce `expires_at`.

### 4.6 Logout (single session)

`POST /v1/auth/logout` — refresh body and/or Bearer access (`sid`):

- `revoked_at = now()`, `revoked_reason = logout`; clear current hash + history.
- **`204` No Content** (idempotent if already revoked).

### 4.7 Logout-all

`POST /v1/auth/logout-all` — Bearer access required:

- Revoke all non-revoked sessions for the authenticated parent (`revoked_reason = logout_all`).
- **`200 OK`** with body `{ "revoked_session_count": <integer> }` — **only** this shape (not 204). Count includes rows transitioned in this call (0 if none were active).

### 4.8 Revoke one session / list

- `DELETE /v1/auth/sessions/{sessionId}` → **`204`**; cross-account/unknown → **`404`**.
- `GET /v1/auth/sessions` → minimized summaries only (no token material).

---

## 5. Prisma schema changes (Proposed)

Additive migration only. **`parent_sessions` is an accepted catalog extension** relative to Blueprint §13.1 once this ADR is Accepted (documents secure-session persistence required by §12 / §29 / ADR-002).

```prisma
enum ParentSessionRevokeReason {
  logout
  logout_all
  refresh_reuse
  admin_revoke
  account_deletion
  expired
  security_event
  session_limit // reserved if a future policy auto-evicts; V1 mint fails closed instead
}

model ParentSession {
  id                       String                     @id @default(uuid()) @db.Uuid
  parentId                 String                     @map("parent_id") @db.Uuid
  tokenFamilyId            String                     @map("token_family_id") @db.Uuid
  refreshTokenHash         String?                    @map("refresh_token_hash")
  /// Bounded ring of prior hashes for reuse detection — max 8 entries; never plaintext tokens
  refreshTokenHashHistory  Json                       @default("[]") @map("refresh_token_hash_history")
  refreshGeneration        Int                        @default(0) @map("refresh_generation")
  expiresAt                DateTime                   @map("expires_at") @db.Timestamptz(6)
  revokedAt                DateTime?                  @map("revoked_at") @db.Timestamptz(6)
  revokedReason            ParentSessionRevokeReason? @map("revoked_reason")
  deviceId                 String?                    @map("device_id") @db.Uuid
  clientSurface            String?                    @map("client_surface")
  userAgentSummary         String?                    @map("user_agent_summary")
  createdAt                DateTime                   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt                DateTime                   @updatedAt @map("updated_at") @db.Timestamptz(6)
  lastRefreshedAt          DateTime?                  @map("last_refreshed_at") @db.Timestamptz(6)

  parent ParentAccount @relation(fields: [parentId], references: [id], onDelete: Restrict)
  device Device?       @relation(fields: [deviceId], references: [id], onDelete: SetNull)

  @@unique([refreshTokenHash], map: "parent_sessions_refresh_token_hash_key")
  @@index([parentId, revokedAt], map: "parent_sessions_parent_revoked_idx")
  @@index([tokenFamilyId], map: "parent_sessions_token_family_idx")
  @@index([expiresAt], map: "parent_sessions_expires_at_idx")
  @@map("parent_sessions")
}
```

### 5.1 Migration strategy

1. Additive migration `…_parent_sessions`.
2. No backfill.
3. Deploy migrate → then API that understands sessions.
4. Rollback only before production sessions exist; otherwise forward-fix.
5. Update `prisma/MAPPING.md` in the **implementation** PR.

---

## 6. OpenAPI / HTTP contract (Proposed sketch)

Live contract remains **`contracts/openapi.yaml` `0.3.0`** in this docs PR. After ADR **Accept**, the **implementation** PR publishes additive **`0.4.0`**. Full shapes: companion sketch.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/v1/auth/token/refresh` | refresh body | Single-winner rotate |
| `POST` | `/v1/auth/logout` | refresh and/or Bearer | Revoke current → **204** |
| `POST` | `/v1/auth/logout-all` | Bearer | Revoke all → **200** + count |
| `GET` | `/v1/auth/sessions` | Bearer | List own sessions |
| `DELETE` | `/v1/auth/sessions/{sessionId}` | Bearer | Revoke one → **204** / **404** |
| `GET` | `/v1/parent/me` | Bearer | Parent identity probe |
| `POST` | `/v1/auth/dev/session` | gated | Local/test bootstrap only |

**Not published:** any `/v1/auth/ownership-check` (or similar) public route.

| HTTP | When |
|---|---|
| `400` | Malformed body |
| `401` | Invalid/expired/consumed/reused token; revoked session |
| `403` | `session_limit_exceeded`; bootstrap disabled / policy deny |
| `404` | Unknown or non-owned session id; non-owned child resources |
| `429` | Rate limited |
| `503` | Signing keys missing outside allowed local misconfig paths |

### 6.1 Ownership verification (no public API)

Implement `assertParentOwnsChild(parentId, childId)` (and equivalents) as **internal** Nest guards/helpers used by future child-scoped controllers. LMP-33 automated tests exercise ownership via:

- unit tests of the helper, and  
- integration/e2e tests against a **test-only** harness or against `/v1/parent/me` + session APIs plus a minimal **test module route that is not part of the published OpenAPI contract** (or against the first real child-scoped route when it lands).

**Do not** ship a publicly documented ownership-check endpoint.

---

## 7. Parent identity & authorization boundaries

1. Canonical id: `parent_accounts.id`.
2. `parent_identities` readable; phone identity creation is LMP-34.
3. Mint/refresh only when parent `lifecycle = active` and `deleted_at IS NULL`.
4. Child ops: `child.parent_id === AuthContext.parentId`; never trust client `parent_id`.
5. Cross-account child/session → **`404`**.
6. Admin auth (LMP-65) and Kids Mode credentials are separate.
7. Account deletion must `revokeAllForParent` (`account_deletion`).

---

## 8. Development / test authentication bootstrap (no OTP)

| Rule | Value |
|---|---|
| Route | `POST /v1/auth/dev/session` |
| Enable | `APP_ENV ∈ {development, test}` **and** `AUTH_DEV_BOOTSTRAP_ENABLED=true` |
| Hard deny | `APP_ENV ∈ {staging, production}` even if the flag is true (fail closed at boot or request) |

**Anti-impersonation / shared-host controls (required):**

1. **Parent allowlist only** — request `parent_id` must be in `AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST` (default: LMP-22 seed parent UUID only). Arbitrary UUID impersonation is **rejected** (`403` / `404`).
2. **Loopback-only by default** — when enabled, accept bootstrap only from loopback peers (`127.0.0.1` / `::1`) **or** when `AUTH_DEV_BOOTSTRAP_LISTEN=loopback` and the API is not advertised on a shared LAN/public URL. If the process is bound/reachable beyond loopback (shared remote IDE, tunnel, cloud agent with public ingress), bootstrap must remain **disabled** unless a separate, reviewed break-glass flag is explicitly approved later (default **off**; not introduced here).
3. Automated tests use `APP_ENV=test` with allowlisted synthetic parents created in-suite — still no production OTP.
4. OpenAPI sketch marks the route development-only; staging/production clients must never call it.

Effect: same `SessionIssuer` as production mint, including the **20-session** cap.

---

## 9. Secrets, keys, and rate limits

### 9.1 Env / secret classification

| Key | Class | Purpose |
|---|---|---|
| `JWT_ACCESS_PRIVATE_KEY_PEM` | **Secret** | Ed25519 signing key |
| `JWT_ACCESS_PUBLIC_KEY_PEM` | **Non-secret** | Current verify key |
| `JWT_PREVIOUS_PUBLIC_KEY_PEM` | **Non-secret** | Previous verify key during rotation |
| `JWT_KEY_ID` / `JWT_PREVIOUS_KEY_ID` | Public | `kid` values |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Public | Claim defaults |
| `REFRESH_TOKEN_PEPPER` | **Secret** | Refresh hashing pepper |
| `AUTH_DEV_BOOTSTRAP_*` | Public flags / allowlist | Dev gate only |

V1 key custody: **secure injected secrets or protected files** (env / secret mount). **No paid KMS** required for V1. Log `kid` only — never PEM blobs or pepper.

Rotation: new key pair → sign with new `kid` → keep previous **public** key for ≥ 15m + skew → drop previous.

Library: **`jose`** for JWS; Node `crypto` for random + HMAC/SHA-256. No hand-rolled JWT.

### 9.2 Rate limits (Proposed)

| Scope | Limit |
|---|---|
| `POST /v1/auth/token/refresh` | **30 / minute / IP** and **10 / minute / session** (session key = current hash lookup id or `sid` after resolve) |
| `POST /v1/auth/logout` / `logout-all` | Same order of magnitude as refresh IP limit is sufficient; implementation may share IP bucket |
| `POST /v1/auth/dev/session` | **Stricter:** **5 / minute / IP** (and still allowlist + loopback gates) |

Exceed → `429` `rate_limited`.

**Multi-instance limitation:** in-process / single-node counters are **best-effort** only. Multiple API replicas do not share memory; effective limits scale with instance count unless a later shared store (Redis, etc.) is approved. V1 documents this limitation; do **not** introduce a paid rate-limit SaaS. Sticky IP load balancing reduces but does not eliminate the gap. Security tests should cover the single-node behavior.

---

## 10. Privacy-safe logging (LMP-32)

**Never** enter structured logs (fields or messages):

- Access JWTs, refresh tokens, Authorization headers, cookies  
- Credentials, OTP, signing keys, pepper  
- Raw **parent identifiers** (`parent_id` / `sub`), child ids/names, phone, email, DOB, free-text PII  

**Allowlisted auth context examples:** `auth_event`, `session_id`, `token_family_id`, `refresh_generation`, `revoke_reason`, `error` enum, `client_surface`, rate-limit bucket class — after `allowlistAndRedactContext`. Prefer `session_id` / `token_family_id` over parent ids for correlation.

Failed auth: `auth_failed` + reason enum (`expired`, `invalid`, `revoked`, `reuse`, `rate_limited`) — **no** token fragments.

---

## 11. Automated security tests (implementation PR)

| Layer | Cases |
|---|---|
| Unit | Ed25519 sign/verify; hashing; history reuse; single-winner race; session cap |
| API | Refresh success; consumed token → 401; reuse → session revoked; logout **204**; logout-all **200**+count; list/delete |
| AuthZ | Helper deny/allow; cross-account child → 404 via integration harness (**no** public ownership route) |
| Privacy | Redaction fixtures: JWT/refresh/parent_id/child PII → redacted or dropped |
| Env gate | Bootstrap denied for staging/production, non-allowlisted parent, non-loopback |
| Rate limit | Single-node refresh/IP and per-session limits |
| Regression | Health/readiness unchanged |

---

## 12. Ownership boundary with LMP-34

| Concern | LMP-33 | LMP-34 |
|---|---|---|
| Session table, issuer, guards, refresh/logout/sessions | ✅ | consumes issuer |
| `/v1/parent/me` | ✅ | — |
| Dev/test bootstrap (gated) | ✅ | — |
| Internal ownership helpers + tests | ✅ | — |
| `POST /v1/auth/phone/start\|verify` | ❌ | ✅ |
| OTP / fake SMS / E.164 / abuse limits | ❌ | ✅ |
| Apple/Google/email | ❌ | LMP-35 |
| Web cookies | ❌ | LMP-38 |
| Admin MFA/RBAC | ❌ | LMP-65 |

LMP-34 must **not** invent a second session store.

---

## 13. Alternatives considered

| Alternative | Why not |
|---|---|
| Opaque access only | Extra design vs Blueprint JWT QA language |
| JWT refresh | Weak rotation/reuse story |
| HS256 `JWT_SECRET` | Rejected — Ed25519 asymmetric |
| Paid IdP / KMS | Contradicts ADR-002 / cost policy for V1 |
| Public ownership-check API | Rejected — internal helpers only |
| Client retry of consumed refresh | Rejected — causes reuse revoke; use single-flight + re-auth |
| Cookies in LMP-33 | Deferred to LMP-38 |

---

## 14. U1–U15 resolution table (human-review direction)

Status of this ADR document remains **Proposed** until an explicit human **Accept**. The table records the approved *direction* applied in this revision:

| ID | Topic | Resolution |
|---|---|---|
| **U1** | JWT algorithm | **Ed25519** via **`jose`**; access TTL **15 minutes** |
| **U2** | Refresh lifetime | **Absolute 30-day** session expiry; no sliding idle in V1 |
| **U3** | Device binding | **Optional** `device_id`; sessions remain independent |
| **U4** | Refresh reuse blast radius | Revoke **affected session only** |
| **U5** | Concurrent refresh | Transactional **single-winner**; loser `401`; **no** client retry of consumed token; **single-flight** client refresh; lost response → **re-authenticate** |
| **U6** | Rate limits | Refresh **30/min/IP** + **10/min/session**; bootstrap **5/min/IP**; document **multi-instance** best-effort limits |
| **U7** | Ownership surface | **Internal** guards/helpers + integration tests; **no** public ownership-check API |
| **U8** | Parent ids in logs | **Avoid raw parent identifiers** in security logs; use `session_id` / `token_family_id` |
| **U9** | Key classification | **Public verify keys non-secret**; signing key + pepper **secrets** |
| **U10** | KMS | **No paid KMS** for V1; secure injected secrets / protected files |
| **U11** | `parent_sessions` catalog | **Accept** additive persistence extension on ADR Accept |
| **U12** | OpenAPI bump | Live **`0.4.0` only in implementation PR** (not this docs PR) |
| **U13** | Session check on access | **Always query** session persistence on protected requests |
| **U14** | Max sessions | **20 active** per parent; mint **`403 session_limit_exceeded`** when full |
| **U15** | Client ADR index | **After Accept**, sync client index in a **separate** client PR — document only here |

### Remaining open items (non-blocking for Accept if deferred explicitly)

| Item | Note |
|---|---|
| Shared rate-limit store | Optional later; V1 documents multi-instance limitation |
| Exact Nest error JSON envelope | Align with existing Nest/HTTP conventions in implementation |
| Test harness shape for ownership e2e | Must remain unpublished in OpenAPI |
| Break-glass remote-dev bootstrap | Default off; requires separate review if ever needed |

---

## 15. Implementation plan (after explicit Accept only)

1. Human flips ADR-019 to **Accepted** (or records Accept in PR review).
2. Separate LMP-33 **implementation** PR: migration, SessionIssuer, guards, routes, OpenAPI **0.4.0**, env catalog, tests.
3. Separate **client** PR: ADR index sync (U15).
4. No merge-as-Done / no Jira Done from this docs PR. LMP-34 wires phone verify → SessionIssuer afterward.

---

## 16. Consequences

**Positive:** Clear IdentityModule session design; immediate revoke; reuse resistance with bounded history; privacy-safe logging; testable without OTP; no paid auth/KMS.

**Negative / follow-ups:** Clients must single-flight refresh and re-auth on lost refresh responses; 20-session cap UX; multi-instance rate limits are approximate until a shared store exists; web cookies still LMP-38; account-deletion UX remains a later privacy task.
