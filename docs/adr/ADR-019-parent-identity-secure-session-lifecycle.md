# ADR-019 — Parent identity & secure session lifecycle

| Field | Value |
|---|---|
| **Status** | **Proposed** — human security/product review required before implementation |
| **Date** | 2026-10-28 |
| **Jira** | [LMP-33](https://little-minds-app.atlassian.net/browse/LMP-33) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-015`) |
| **Blueprint** | F-001, F-031 · §12 Auth · §13.1 identity tables · §29 · §31.1 / ADR-002 · §31.4 privacy · §27.4 local identity · §38 ownership |
| **Supersedes / completes** | ADR-002 *implementation/security design* gap (architecture direction remains; this ADR proposes the missing session design) |
| **Repos** | `little-minds-backend` only for this proposal. Client ADR index sync after human acceptance (ADR-014). |
| **Companion sketch** | [`lmp-33-session-api-contract-sketch.md`](./lmp-33-session-api-contract-sketch.md) (non-normative until Accepted + OpenAPI bump) |

> **Hard gate:** Do **not** implement production authentication, Prisma migrations for sessions, or live OpenAPI auth paths until this ADR is **Accepted** by a human reviewer. No paid auth vendors. No GSM OTP here (LMP-34).

---

## 1. Context

LMP-33 requires a stable parent identity domain and a secure session lifecycle (refresh, expire, revoke, logout), Nest auth guards, parent ownership / cross-account denial, privacy-safe logging, and automated success + reject tests.

**Already on `main` (as of `7e4bf87`, LMP-32):**

- Prisma `ParentAccount` + `ParentIdentity` (LMP-22); synthetic seed parent/children
- Empty Nest `IdentityModule` stub (LMP-20)
- Nest `PrismaModule` / `PrismaService` for readiness (LMP-32)
- Structured redacted logging, correlation IDs, allowlisted context (LMP-32 / ADR-013)
- OpenAPI `0.3.0` health + readiness only — **no** `/v1/auth/*`
- Env catalog reserves `JWT_SECRET` as a documentation placeholder (LMP-28) — **not** sufficient for the asymmetric design below

**ADR-002 (resolved direction):** self-hosted NestJS `IdentityModule`, extraction-ready ports, established crypto libraries, no Supabase Auth, SMS OTP via adapter (LMP-34). Implementation/security design was explicitly left open — this ADR fills that gap for sessions.

---

## 2. Decision summary (Proposed)

| Topic | Proposed decision |
|---|---|
| Access token | Short-lived **JWT**, **15 minutes** TTL, **asymmetric** signature, `Authorization: Bearer` |
| Refresh token | **Opaque** random secret, **30-day absolute max** lifetime, stored **hashed** server-side |
| Sessions | One DB row per independent multi-device session; refresh rotates tokens; reuse detection invalidates family |
| Transport | Access + refresh in JSON body / Bearer header for API clients (mobile). **No cookies in LMP-33** (web cookie strategy deferred to LMP-38) |
| Identity key | Canonical subject is `parent_accounts.id` (UUID). Never GSM/email/provider id as PK |
| Authorization | Every child-scoped operation checks `child.parent_id === authenticated.parent_id` |
| Dev/test bootstrap | Deterministic, `APP_ENV=development\|test` only, hard-disabled in staging/production |
| OTP / providers | **Out of scope** — LMP-34 (+ later LMP-35) |
| Paid services | **Forbidden** for identity in this ADR |

---

## 3. Token model

### 3.1 Access token (JWT)

| Property | Proposed value |
|---|---|
| Format | JWS compact serialization |
| Algorithm (preferred) | **EdDSA** with **Ed25519** (`alg: EdDSA`) via maintained library (`jose` proposed). Fallback if ops cannot ship Ed25519: **RS256** (RSA-2048+) — **Unresolved #U1** until human confirms Ed25519 readiness |
| TTL | **`exp - iat = 900` seconds (15 minutes)** — fixed; not configurable per client in V1 |
| Clock skew | Verify with ≤ **60s** leeway |
| Header | `alg`, `typ: JWT`, `kid` (key id for rotation) |
| Claims (allowlist only) | See below — **no** phone, email, names, child ids, tokens |

**Required claims:**

| Claim | Meaning |
|---|---|
| `iss` | Stable issuer string, e.g. `little-minds-backend` (or env `JWT_ISSUER`) |
| `aud` | `little-minds-parent` (parent API audience; admin uses a different audience later) |
| `sub` | `parent_accounts.id` (UUID string) |
| `sid` | `parent_sessions.id` (session UUID) |
| `jti` | Unique access-token id (UUID) — for future denylist if needed; **not** persisted by default in LMP-33 |
| `iat` / `exp` | Issued / expiry UTC epoch seconds |
| `token_use` | Literal `access` |

**Explicitly excluded from JWT:** child ids, roles beyond parent, PII, refresh material, provider subjects.

**Verification:** Nest `ParentAuthGuard` verifies signature with current + previous public keys (rotation window), `iss`/`aud`/`token_use`/`exp`, then loads session by `sid` and rejects if session revoked/expired or `parent.lifecycle !== active`.

### 3.2 Refresh token (opaque)

| Property | Proposed value |
|---|---|
| Format | Cryptographically random **≥ 256 bits** entropy; encode as URL-safe base64 (≈43+ chars). Prefix optional `lmr1.` for version sniffing |
| Lifetime | **Absolute max 30 days** from session `created_at`. No sliding extension past absolute expiry in V1 (**Unresolved #U2** if product wants idle sliding) |
| Persistence | Store **only** `SHA-256` hash of `pepper \|\| token` (or HMAC-SHA256 with server pepper). **Never** store plaintext refresh tokens |
| Presentation | Client sends refresh token on refresh/logout endpoints in JSON body field `refresh_token` |
| Binding | Bound to `parent_sessions.id` + `parent_id`. Optional `device_id` FK when client supplies a known device (**Unresolved #U3** for mandatory device binding) |

### 3.3 Why hybrid (JWT access + opaque refresh)

- Access JWT avoids a DB hit on every read-mostly call after signature verify, while session revocation still requires a cheap `sid` lookup (or cache) for logout/compromise — **Proposed:** always check session row (or short TTL cache keyed by `sid`) so logout is immediate.
- Opaque refresh enables server-side rotation, reuse detection, and multi-device revoke without JWT refresh pitfalls.
- Aligns with Blueprint QA language (JWT validation) and privacy rules (never log access/refresh tokens).

---

## 4. Session lifecycle

### 4.1 Session creation (ports only in LMP-33)

`IdentityModule` exposes an internal **`SessionIssuer` port** used by:

1. **LMP-34** phone verify (and later LMP-35 providers) — production mint path  
2. **Dev/test bootstrap** (§8) — non-production only  

LMP-33 does **not** publish public “login with password” or OTP routes.

On mint: create `parent_sessions` row + return `{ access_token, refresh_token, token_type, expires_in, session_id, parent_id }`.

### 4.2 Refresh (rotation)

`POST /v1/auth/token/refresh`:

1. Hash presented refresh token; lookup session by hash (constant-time compare path).
2. Reject if missing, expired (`expires_at` / absolute max), or `revoked_at` set → `401`.
3. **Rotate:** generate new refresh token; update hash; set `last_refreshed_at`; optionally keep previous hash in `previous_refresh_token_hash` with short grace (**Proposed: 10 seconds**) for concurrent refresh (**§4.4**).
4. Issue new access JWT (`sid` unchanged unless policy says otherwise — **Proposed: same `sid`**).
5. Return new token pair.

### 4.3 Refresh token reuse detection

Each session has a **`token_family_id`** (UUID, stable for the session lifetime).

If a refresh token hash matches neither current nor grace previous hash, but the token was previously valid in this family (detect via optional `refresh_token_hash_history` **or** simpler rule):

**Proposed V1 rule (simpler):**

- Only current (+ grace previous) hashes are valid.
- Presentation of an **unknown** token → generic `401`.
- Presentation of the **immediately superseded** token **after grace expired** → treat as **reuse**: revoke **this session** (and optionally entire family — same as session) with `revoked_reason = refresh_reuse`, return `401`.

**Unresolved #U4:** Whether reuse also revokes **all** sessions for the parent (account-wide) vs current session only. **Proposed default: current session only** + structured security log event (no token material).

### 4.4 Concurrent refresh

Two parallel refresh calls with the same valid token:

**Proposed:** transactional update `WHERE refresh_token_hash = :hash`; winner rotates; loser within **10s grace** may present the old token once and receive the **same new pair already issued** (idempotent read of rotated credentials stored encrypted-at-rest is **not** desired).  

**Revised Proposed (safer, no storing plaintext new token):**

- Winner rotates; stores only new hash.
- Loser within grace: if previous hash matches, **issue another rotation** (another new pair) only if `refresh_generation` advanced by exactly 1 and request falls inside grace — **or** return `409` with `code: refresh_in_progress` and ask client to retry with backoff.

**Preferred Proposed for human review:** **strict single-winner rotation** + **409 refresh_conflict** for concurrent loser (no grace plaintext). Clients retry once with the refresh token they still hold only if they did not receive a new pair; if winner already consumed the token, loser must re-authenticate. Document client guidance in OpenAPI.

Mark final concurrency choice as **Unresolved #U5** with recommended **strict single-winner + 409**.

### 4.5 Expiry

- Access JWT: cryptographic `exp` (15m).
- Session / refresh: `expires_at = created_at + 30 days` (absolute). Expired sessions fail refresh and fail guard session checks.

### 4.6 Logout (single session)

`POST /v1/auth/logout` with refresh token (and/or valid access token identifying `sid`):

- Set `revoked_at = now()`, `revoked_reason = logout`.
- Clear refresh hashes.
- Return `204`.

Idempotent: already-revoked → still `204`.

### 4.7 Logout-all

`POST /v1/auth/logout-all` requires valid **access** token:

- Revoke **all** non-revoked sessions for `sub` parent with `revoked_reason = logout_all`.
- Return `204` + optional body `{ revoked_session_count }` (**Proposed: include count**).

### 4.8 Revoke one session by id

`DELETE /v1/auth/sessions/{sessionId}`:

- Authenticated parent may revoke **own** session only.
- Cross-account session id → `404` (no existence leak) or `403` — **Proposed: `404`**.

### 4.9 List sessions

`GET /v1/auth/sessions` — return minimized metadata (id, created_at, last_refreshed_at, device_id if any, user_agent_summary). **No** token material.

---

## 5. Prisma schema changes (Proposed)

New models (additive migration; no destructive changes to existing tables).

```prisma
enum ParentSessionRevokeReason {
  logout
  logout_all
  refresh_reuse
  admin_revoke
  account_deletion
  expired // optional tombstone reason if job marks rows
  security_event
}

model ParentSession {
  id                         String                     @id @default(uuid()) @db.Uuid
  parentId                   String                     @map("parent_id") @db.Uuid
  tokenFamilyId              String                     @map("token_family_id") @db.Uuid
  refreshTokenHash           String?                    @map("refresh_token_hash")
  previousRefreshTokenHash   String?                    @map("previous_refresh_token_hash")
  previousRefreshValidUntil  DateTime?                  @map("previous_refresh_valid_until") @db.Timestamptz(6)
  refreshGeneration          Int                        @default(0) @map("refresh_generation")
  expiresAt                  DateTime                   @map("expires_at") @db.Timestamptz(6)
  revokedAt                  DateTime?                  @map("revoked_at") @db.Timestamptz(6)
  revokedReason              ParentSessionRevokeReason? @map("revoked_reason")
  deviceId                   String?                    @map("device_id") @db.Uuid
  /// Coarse client surface only, e.g. "ios" | "android" | "web" | "unknown" — not a fingerprint
  clientSurface              String?                    @map("client_surface")
  /// Truncated / allowlisted UA summary; never raw full UA if it carries identifiers
  userAgentSummary           String?                    @map("user_agent_summary")
  createdAt                  DateTime                   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt                  DateTime                   @updatedAt @map("updated_at") @db.Timestamptz(6)
  lastRefreshedAt            DateTime?                  @map("last_refreshed_at") @db.Timestamptz(6)

  parent ParentAccount @relation(fields: [parentId], references: [id], onDelete: Restrict)
  device Device?       @relation(fields: [deviceId], references: [id], onDelete: SetNull)

  @@unique([refreshTokenHash], map: "parent_sessions_refresh_token_hash_key")
  @@index([parentId, revokedAt], map: "parent_sessions_parent_revoked_idx")
  @@index([tokenFamilyId], map: "parent_sessions_token_family_idx")
  @@index([expiresAt], map: "parent_sessions_expires_at_idx")
  @@map("parent_sessions")
}
```

Also add reverse relations on `ParentAccount` and `Device`.

**Indexes / uniqueness notes:**

- Unique on `refresh_token_hash` where non-null (Prisma unique allows multiple nulls in PostgreSQL).
- Do **not** unique `previous_refresh_token_hash` globally if grace overlaps — lookup by equality in transaction scoped to session.

### 5.1 Migration strategy

1. Additive Prisma migration `…_parent_sessions` only.
2. No backfill (no existing sessions).
3. Deploy order: migrate → deploy API that understands sessions.
4. Rollback: drop table only if no production sessions yet; after sessions exist, forward-fix (stop issuing, revoke all) rather than destructive rollback without approval.
5. Update `prisma/MAPPING.md` when Accepted (map `ParentSession` → §29/§31 session persistence — catalog gap called out as intentional extension).

**Note:** Blueprint §13.1 does not yet list `parent_sessions`. This ADR proposes adding it as the persistence for “secure sessions” required by §12 / §29 / ADR-002. Human acceptance = product approval of that catalog extension.

---

## 6. OpenAPI / HTTP contract (Proposed)

Authoritative live contract remains `contracts/openapi.yaml` **0.3.0** until Accepted. Full request/response shapes live in the companion sketch. Summary:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/v1/auth/token/refresh` | refresh body | Rotate tokens |
| `POST` | `/v1/auth/logout` | refresh and/or Bearer | Revoke current session |
| `POST` | `/v1/auth/logout-all` | Bearer access | Revoke all parent sessions |
| `GET` | `/v1/auth/sessions` | Bearer access | List own sessions |
| `DELETE` | `/v1/auth/sessions/{sessionId}` | Bearer access | Revoke one own session |
| `GET` | `/v1/parent/me` | Bearer access | Stable parent identity probe + guard smoke |
| `POST` | `/v1/auth/dev/session` | none + **dev gate** | Dev/test bootstrap only |

**Security scheme:** `http` `bearer` JWT (`parentAccessToken`).

**Standard errors (problem-style or existing Nest JSON — align with health style minimally):**

| HTTP | When |
|---|---|
| `400` | Malformed body / validation |
| `401` | Missing/invalid/expired access or refresh; reuse after revoke |
| `403` | Authenticated but forbidden (prefer avoid for cross-account child access — use 404) |
| `404` | Unknown session id / cross-account child or session |
| `409` | Concurrent refresh conflict (if U5 accepted) |
| `429` | Rate limit (**Unresolved #U6** exact limits) |
| `503` | Misconfigured signing keys in non-dev |

**Ownership probe (LMP-33):** a protected child-scoped example is required for AC tests. **Proposed:** implement authorization helper `assertParentOwnsChild(parentId, childId)` and expose **only** a minimal internal/test route **or** `GET /v1/children/{childId}` stub that returns `{ id }` when owned else `404`. Prefer **not** inventing full child profile API — **Unresolved #U7** whether a tiny `GET /v1/children/{childId}` identity stub is in LMP-33 or deferred to child-profile task with tests using a harness endpoint under `/v1/auth/ownership-check` (dev/test only). **Recommended:** authenticated `POST /v1/auth/ownership-check` with body `{ child_id }` → `{ owned: true }` / `404` for deny — keeps child CRUD out of LMP-33.

---

## 7. Parent identity & authorization boundaries

1. **Canonical id:** `parent_accounts.id` only.
2. **Provider rows:** `parent_identities` remain the link table; LMP-33 may read them but does not create phone identities (LMP-34).
3. **Lifecycle:** sessions mint/refresh only if `lifecycle = active` and `deleted_at IS NULL`.
4. **Child ownership:** `ChildProfile.parentId === AuthContext.parentId`; never trust client-supplied `parent_id`.
5. **Cross-account:** deny with `404` for child/session resources (anti-enumeration).
6. **Admin staff auth:** out of scope (LMP-65); different audience and module.
7. **Kids Mode device credentials:** out of scope (`KidsModeAuthorization`); distinct from parent sessions.
8. **Account deletion:** must revoke all sessions (`revoked_reason = account_deletion`) — deletion workflow may land in a later privacy task; SessionIssuer must expose `revokeAllForParent`.

---

## 8. Development / test authentication bootstrap (no OTP)

| Rule | Proposed |
|---|---|
| Route | `POST /v1/auth/dev/session` |
| Enabled when | `APP_ENV` ∈ {`development`,`test`} **AND** `AUTH_DEV_BOOTSTRAP_ENABLED=true` |
| Disabled when | `APP_ENV` ∈ {`staging`,`production`} — **hard fail closed** even if flag true (boot should warn/reject enabling) |
| Body | `{ "parent_id": "<uuid>" }` limited to **seed / allowlisted synthetic** parents in development; tests may create ephemeral parents in DB |
| Effect | Calls same `SessionIssuer` as production mint |
| OpenAPI | Documented with `x-environment: development-only` warning; generators may include but clients must not call in staging builds |
| Logging | Log `event=dev_session_issued` with `parent_id` **hash or last-4 of uuid only** — **Unresolved #U8** whether parent UUID is allowlisted in auth security logs. Prefer `parent_id` as UUID is an internal opaque id already used in DB; still avoid logging tokens |

No fake OTP, no Mailpit, no SMS in LMP-33.

---

## 9. Secrets, keys, and rotation

### 9.1 Env keys (Proposed replacements)

Deprecate undocumented use of reserved `JWT_SECRET` for this design. Propose:

| Key | Class | Purpose |
|---|---|---|
| `JWT_ACCESS_PRIVATE_KEY_PEM` | Secret | Ed25519 (or RSA) private PEM for signing |
| `JWT_ACCESS_PUBLIC_KEY_PEM` | Secret or mount | Current verify key (can be derived; storing both is ok) |
| `JWT_PREVIOUS_PUBLIC_KEY_PEM` | Secret/mount | Optional previous public key during rotation |
| `JWT_KEY_ID` | Public | Current `kid` |
| `JWT_PREVIOUS_KEY_ID` | Public | Previous `kid` |
| `JWT_ISSUER` | Public | Default `little-minds-backend` |
| `JWT_AUDIENCE` | Public | Default `little-minds-parent` |
| `REFRESH_TOKEN_PEPPER` | Secret | Pepper for refresh hashing |
| `AUTH_DEV_BOOTSTRAP_ENABLED` | Public flag | Dev/test only |

Update LMP-28 catalogs (`.env.example`, `env.secrets.ts`, `environments-config.md`) **during implementation**, not in this ADR-only PR beyond documentation pointers in the ADR.

**Unresolved #U9:** Whether public verify keys are treated as secret mounts or non-secret config. **Proposed:** treat private key + pepper as secrets; public keys may be public config but still not logged in full if PEM blobs are large — log `kid` only.

### 9.2 Key rotation procedure

1. Generate new key pair; set new `JWT_KEY_ID`.
2. Move old public key to `JWT_PREVIOUS_*` for ≥ access TTL (15m) + skew.
3. Sign new access tokens with new key only.
4. Remove previous after window.
5. Refresh tokens unaffected (opaque, DB-bound).
6. Document runbook in implementation PR; no automatic cloud KMS required for V1 (**Unresolved #U10** KMS vs file/env PEM).

### 9.3 Libraries

Use maintained libraries only (`jose` proposed for JWS; Node `crypto` for random + SHA-256). **Do not** hand-roll JWT or OAuth.

---

## 10. Privacy-safe logging (reuse LMP-32)

- Never log access tokens, refresh tokens, JWTs, Authorization headers, cookies, OTP, phone, email, child names/DOB.
- Extend `STRUCTURED_LOG_ALLOWLIST` (implementation task) with auth events: `auth_event`, `session_id`, `token_family_id`, `revoke_reason`, `parent_id` (**if U8 allows**).
- Existing `redact.ts` already redacts `token`, `jwt`, `bearer`, `authorization`, `refreshtoken`, `accesstoken`.
- Failed auth: log generic `auth_failed` + reason enum (`expired`, `invalid`, `revoked`, `reuse`) — **no** token fragments.
- Request interceptor continues to omit query strings and bodies.

---

## 11. Automated security tests (for implementation PR; not this ADR PR)

| Layer | Cases |
|---|---|
| Unit | Hashing; JWT sign/verify; claim allowlist; revoke state machine; reuse detection |
| API | Refresh success; expired access → 401; expired refresh → 401; logout; logout-all; list/delete sessions |
| AuthZ | Parent A cannot read Parent B child (`404`); ownership-check deny/allow |
| Privacy | Logger/redaction fixtures include JWT + refresh samples → `[REDACTED]` |
| Env gate | Dev bootstrap disabled when `APP_ENV=staging|production` |
| Regression | Health/readiness unaffected |

CI: existing Nest lint/typecheck/test/e2e + contract checks once OpenAPI bumped in implementation.

---

## 12. Ownership boundary with LMP-34

| Concern | LMP-33 (this ADR) | LMP-34 |
|---|---|---|
| Session table + issuer + guards | ✅ | consumes issuer |
| Refresh / logout / logout-all / sessions | ✅ | — |
| `/v1/parent/me`, ownership helper | ✅ | — |
| Dev/test session bootstrap | ✅ | — |
| `POST /v1/auth/phone/start` | ❌ | ✅ |
| `POST /v1/auth/phone/verify` | ❌ | ✅ (calls SessionIssuer) |
| OTP storage, rate limits, fake SMS, E.164 | ❌ | ✅ |
| Apple/Google/email adapters | ❌ | LMP-35 |
| Web cookie session UX | ❌ | LMP-38 (must use same tokens/APIs) |
| Admin staff MFA/RBAC | ❌ | LMP-65 |

LMP-34 must not invent a second session store.

---

## 13. Alternatives considered

| Alternative | Why not (Proposed) |
|---|---|
| Opaque access tokens only | Extra DB/cache hit every request; Blueprint QA expects JWT validation |
| JWT refresh tokens | Harder rotation/reuse detection; larger steal window |
| Symmetric HS256 (`JWT_SECRET`) | Weaker key distribution/rotation story; ADR prefers asymmetric |
| Supabase / Auth0 / Cognito | Paid/external; contradicts ADR-002 |
| Cookies in LMP-33 | Web-specific; LMP-38 |

---

## 14. Unresolved decisions — **STOP for human review**

Do **not** implement until these are accepted or explicitly deferred with an owner:

| ID | Question | Recommendation |
|---|---|---|
| **U1** | Ed25519 vs RS256 for access JWT? | Ed25519 (`jose`) |
| **U2** | Absolute 30-day refresh only vs sliding idle timeout? | Absolute 30-day only for V1 |
| **U3** | Mandatory `device_id` on sessions? | Optional in V1 |
| **U4** | Refresh reuse → revoke one session or all parent sessions? | One session + security log |
| **U5** | Concurrent refresh: 409 vs grace re-read? | Strict single-winner + `409` |
| **U6** | Rate limits for refresh/logout/dev? | e.g. refresh 30/min/IP + 10/min/session — needs product/ops OK |
| **U7** | Ownership test surface: `/v1/auth/ownership-check` vs child stub? | `/v1/auth/ownership-check` |
| **U8** | Allow `parent_id` UUID in structured auth logs? | Yes (opaque internal id); still redact PII |
| **U9** | Public key secret classification? | Private+pepper secret; public PEM non-secret |
| **U10** | KMS vs env PEM for V1 keys? | Env/file PEM for local+early staging; KMS later |
| **U11** | Accept `parent_sessions` as Blueprint catalog extension? | Yes via this ADR |
| **U12** | OpenAPI version bump strategy on Accept? | Additive `0.4.0` in **implementation** PR, not this ADR PR |
| **U13** | Access-path session check: always DB vs cache? | DB first; optional short cache later |
| **U14** | Max concurrent sessions per parent? | Uncapped V1 **or** soft cap 20 — needs product call |
| **U15** | Client ADR index update timing? | After Accept, sync client `docs/adr/README.md` (separate small task/PR) |

---

## 15. Implementation plan (after Accept only)

1. Human marks this ADR **Accepted** (and records U1–U15 resolutions).
2. Implementation PR on LMP-33: Prisma migration, SessionIssuer, guards, routes, OpenAPI `0.4.0`, env catalog, tests, redaction allowlist extensions.
3. No merge / no Jira Done without green CI + human review (existing Definition of Done).
4. LMP-34 integrates phone verify → SessionIssuer.

---

## 16. Consequences

**Positive:** Clear extraction-ready Identity boundary; revocable multi-device sessions; privacy-aligned token handling; testable without OTP; no paid auth.

**Negative / follow-ups:** Catalog extension for `parent_sessions`; key management ops burden; client must handle 15m refresh; web cookie story still open (LMP-38); deletion UX still not fully specified (ADR-002 remainder).
