# ADR-023 — Backend-owned browser session for LMP-38 (PROPOSED)

Status: **PROPOSED — architecture review required before implementation or merge**. Scope: LMP-38, dependencies LMP-25/LMP-33 and ADR-019.

## Decision proposal

A browser receives a random **opaque session identifier** in a Secure, HttpOnly, SameSite=Strict cookie. The browser never receives backend access or refresh tokens. The Next.js layer becomes a thin same-origin proxy; only the identity backend is authorized to renew or revoke a browser session. This replaces the in-memory `refreshFlights` Map in PR #16. The existing native-mobile refresh contract and replay-detection semantics remain unchanged.

### Durable state and trust boundary

Add a PostgreSQL-backed `web_parent_sessions` record with:
- `id` UUID; `opaque_handle_hash` unique HMAC-SHA256 of a random 256-bit cookie token, never persist the raw cookie.
- `parent_session_id` FK to existing `parent_sessions`; `parent_id` FK to `parent_accounts`.
- `refresh_token_ciphertext` AEAD-encrypted current backend refresh token with external rotation-aware key ID; plaintext is never persisted or logged.
- `expires_at`, `revoked_at`, `last_used_at`, `refresh_generation`, `created_at`.
- Restrict lookup by hashed handle and ensure ownership, account lifecycle, and absolute expiration on every access. Rate-limit by hashed session handle plus coarse IP.

Keep the opaque cookie scoped to the web origin, `__Host-lm_web_session`, `Secure`, `HttpOnly`, `Path=/`, `SameSite=Strict`, no `Domain`. For insecure localhost development use a separate explicit dev-only cookie name, never enable this relaxation in production.

### Backend endpoints (new versioned contract)

- `POST /v1/auth/web/session`: exchange **verified** existing phone/email OTP result for opaque web session on the backend. Do not expose bearer/refresh tokens through Next -> browser JSON.
- `GET /v1/auth/web/me`: authenticate opaque cookie/handle; validate access JWT against the existing parent session; refresh **inside the backend** if needed; return profile only.
- `POST /v1/auth/web/logout`: revoke both web record and linked parent session idempotently, clear cookie. CSRF-origin and content type protections apply.
- Optional `POST /v1/auth/web/session/refresh` only if needed; prefer refresh via a safe, server-side operation with one owner.

### Atomic refresh algorithm

1. Hash opaque handle; begin DB transaction and `SELECT ... FOR UPDATE` the **web session row**. The lock is shared by every backend instance.
2. After acquiring the lock, re-read session generation, expiry, revocation and parent state. Compare current access-token expiration.
3. If refresh needed, rotate **exactly once** under the lock and update encrypted refresh token + generation atomically. A second request must re-read the updated credential after lock release; never submit the old token again.
4. Publish new access token only in backend-owned server response/session state. Do not return raw credentials to the browser.
5. On failed upstream refresh, do not discard a previously committed rotation; distinguish retryable transport failures from definitive revoked/invalid state.
6. Because the existing `SessionIssuerService.refresh` acquires its own Prisma transaction and immediately commits, design a transaction-aware refresh primitive first. Never run that nested transaction while holding the web-session row lock without establishing lock order and deadlock tests. The code owner must choose either a shared transaction or a carefully justified two-phase claim state with fencing.
7. Delete/revoke on logout and account deletion; enforce lifetime and periodic cleanup, and bind a cookie hash to one session only.

### Required safety/evidence gates

- Same cookie, two simultaneous requests routed to **distinct** backend replicas -> one rotation, both profile reads succeed, no `refresh_reuse` revocation.
- Session invalidation across replicas, expiry, replay/reuse detection for **native** refresh tokens unchanged.
- OTP completion never includes raw tokens in browser response; session fixation resistance (fresh cookie on new login); no token leakage in logs or errors.
- Multi-tab browser tests, CSRF/origin enforcement, logout with backend down, failed refresh, network response loss, Set-Cookie ordering, direct protected URL access.
- Integration tests against PostgreSQL, E2E against Next.js + backend, reproducible lockfiles and green CI; legal review of privacy notice before release.

### Migration plan and compatibility

1. Land reviewed backend transaction primitives and migration behind a feature flag, with native auth unchanged.
2. Add new backend web session API and OpenAPI contract; contract-check generated TS client.
3. Replace Next.js raw token cookies/Map in client PR #16 with opaque cookie proxy. Do not enable old unsafe transparent refresh as a fallback.
4. Run concurrent multi-replica database tests and browser E2E, then retire legacy web routes and enable staged release.

## Rejected shortcuts

- Node process-global `Map` or `navigator.locks`: not shared across instances and cannot enforce backend ownership.
- Redis lock alone around legacy refresh: lock without a durable rotated credential does not prevent stale-token reuse after another instance completes.
- Returning the same new plaintext refresh token to each concurrent request without encrypted short-lived persistence: breaks existing token secrecy and replay semantics.

**Current status:** design only, no backend endpoint, schema migration or concurrency test has yet been implemented. LMP-38 remains To Do, PR #16 remains Draft.
