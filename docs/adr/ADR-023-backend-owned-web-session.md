# ADR-023 — Backend-owned opaque parent web session (ACCEPTED SECURITY DECISION)

**Status: Accepted — explicit Product Owner approval on 2026-10-31. Implementation and merge remain separate gates.**\n\n**Jira:** LMP-38 · **Blueprint:** canonical client `docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md` (V2.7 baseline), F-001, F-015, F-031, §§12, 21, 29, 31, 38 · **Accepted dependencies:** ADR-014 (canonical docs/contract ownership), ADR-019 (sessions), ADR-020 (GSM OTP/privacy), ADR-021 (multi-provider) · **Implementation PRs:** backend #22 + client #16 (both Draft).\n\n**Approved decision:** Backend-owned web session boundary and **30-minute meaningful-activity inactivity timeout** were explicitly accepted by the Product Owner on 2026-10-31. This is a material change from the existing implementation: **the policy requires PostgreSQL-enforced idle expiration; implementation in PR #22 must pass CI and security tests.** Approval is not permission to merge unfinished code.

## Security model

1. Next.js BFF calls the existing phone OTP verify endpoint. Its short-lived access token is never returned to the browser. Next immediately sends the access token to `POST /v1/auth/web/session` with a bearer header.
2. `ParentAuthGuard` verifies the token, active parent and parent session. The new web service checks `client_surface=web`, locks the parent session row, and permanently **disables native refresh** on that session by removing its current refresh hash and history lookup; it creates one unique web session row.
3. The backend returns a fresh random 256-bit opaque `handle` and expiry to the **server-to-server** Next.js route. Next only sets the handle in a `Secure, HttpOnly, SameSite=Strict, Path=/` cookie (production `__Host-lm_web_session`; distinct dev cookie on localhost). Legacy browser bearer/refresh cookies are cleared.
4. On `GET /v1/auth/web/me`, the backend hashes the opaque handle with a domain-separated HMAC key and looks up the durable record in PostgreSQL. Every request rechecks the bound parent account and parent session's active/expiry state. **No refresh occurs.** Multiple Next/backend replicas can authorize simultaneously without rotating the same token. This avoids the cross-replica replay race by design.
5. `POST /v1/auth/web/logout` revokes the opaque handle and its underlying parent session, idempotently. Existing logout-all and account deletion invalidate linked web sessions by invalidating their parent sessions. Expiry is bounded by the original parent session's absolute lifetime (30 days).

## Accepted normative session lifetime and security policy

| Property | Accepted decision | Verification |
|---|---|---|
| Absolute lifetime | 30 days from the original `parent_sessions.created_at`; **never** extended by activity | Time-travel / DB expiry and browser denial |
| Inactivity timeout | **30 minutes** since most recent successful authenticated web activity, independent of absolute expiry | At 29m59s authorized; at 30m+ denied; clock skew boundary tests |
| Activity definition | A successful authenticated `/v1/auth/web/me` call or authorized web parent API request. Do **not** count unauthenticated requests, background polling, failures, or static asset fetches. | Tests with polling disabled and server-rendered page |
| Expiry enforcement | Backend/DB is authoritative: reject when `now >= min(parent_session.expires_at, web_session.expires_at, last_activity_at + 30 minutes)`. On rejection, revoke web session and require fresh OTP. | Expired handle returns 401 across replicas |
| Race safety | Perform eligibility check and `last_activity_at` update atomically in PostgreSQL (single conditional UPDATE/RETURNING with active parent/session constraints, or equivalently locked transaction); never read-then-unconditionally-touch. Use DB clock and prove logout/revoke cannot be resurrected. | Two distinct DB connections, revoke vs activity race |
| Cookie | Production `__Host-lm_web_session` (Secure, HttpOnly, Path=/, no Domain, SameSite=Strict). Handle is random >=256 bits, HMAC-hashed at rest. | Raw Set-Cookie test over HTTPS |
| Browser credentials | Browser does not receive JWT or refresh tokens. BFF-only exchange protected by independent secret and private backend ingress; native sessions preserve ADR-019 rotation. | No credential leakage; wrong BFF secret rejected |
| Logout | Revoke web handle + parent session on backend immediately. On unavailable backend, display **revocation unconfirmed**; never report server logout success. | Backend down, recovered, and cross-replica tests |
| Renewal | No refresh-token-based web renewal; no extension of the 30-day absolute lifetime. 30-minute inactivity clock advances only on meaningful authenticated activity, **not** background keep-alive. | Idle and absolute expiry tests |
| Sensitive actions | Require explicit new parent authentication or step-up where applicable; defer exact action inventory to owning Jira tasks. | Protected-action E2E |
| Secrets | `LM_WEB_BFF_SECRET` strong independent secret (>=32 random bytes recommended), provisioned on BFF and backend, never browser/public env or logs; validate on deployment/startup; key rotation runbook. | Missing/wrong/placeholder secret tests |

**Important implementation delta:** `WebParentSessionService.requireActive` currently checks absolute expiry and revocation only. The `lastUsedAt` column exists but is unused. The inactivity policy above is **not implemented** and requires backend migration/logic, realistic HTTP regression tests, and a corresponding Next.js UX before this ADR can be treated as delivered. The existing 30-day cookie Max-Age is an upper bound; server-side idle denial takes precedence. The browser must handle a 401 after idle expiry by clearing its opaque session cookie and requesting fresh authentication.

### Decision and approval record

- **Proposal owner:** LMP-38 implementation team.
- **Product owner decision:** **ACCEPTED 2026-10-31** — user explicitly approved 30-day absolute lifetime, 30-minute inactivity timeout and documented security conditions. Independent deployment/security verification remains required.
- **Human acceptance recorded:** Explicit approval of (a) 30-day non-sliding absolute lifetime; (b) 30-minute meaningful-activity inactivity timeout; (c) opaque backend session/BFF boundary; (d) follow-up implementation and testing gates.
- **After acceptance:** Record the decision in Jira, synchronize canonical client ADR index under ADR-014, and implement/test the specified policy. Keep PRs Draft until all acceptance evidence passes.

## Tradeoffs

- A stolen opaque handle remains a bearer credential until revoked/expired; cookie security, CSRF protection, TLS, short reasonable absolute expiry, and session revocation are required.
- No extension of absolute lifetime: on expiry the parent signs in again. **Accepted 30-minute meaningful-activity inactivity policy** is separate and currently unimplemented; do not confuse an idle activity clock with refresh token rotation.
- A backend outage is not equivalent to an invalid session; Next must show retry instead of clearing the cookie on 503.
- The existing OTP verify API still returns native credentials to its *trusted server caller*. This does not imply a browser may receive those tokens; Next must keep this exchange server-side.
- The backend currently accepts `X-LM-Web-Session` as a bearer handle from Next and does not itself set cookies; strict origin/CSRF protection is enforced at the same-origin BFF boundary. A production deployment must ensure the backend is not inadvertently exposed to unauthenticated cross-origin browser callers.

## Existing code / migration

- `prisma/schema.prisma`, `prisma/migrations/20261031093000_web_parent_sessions/migration.sql`
- `src/modules/identity/session/web-parent-session.service.ts`
- `src/modules/identity/controllers/web-session.controller.ts`
- `test/web-parent-session.db.spec.ts`
- Client implementation: `little-minds-client` PR #16.

## Acceptance and review gates

- CI Prisma migrations/typecheck/Jest; real PostgreSQL tests: concurrent two-service access, native refresh disabled after exchange, logout/revocation, non-web conversion rejected, handle validity/expiry.
- Next.js real HTTP/browser tests: OTP success/failure, server-side token secrecy, cookie persistence, multi-replica GET, logout with backend unavailable, parent route unauthorized/expiry, CSRF.
- Validate lockfile reproducibility, check unapproved privacy notice, test gateway configuration and confirm LMP-25 dependency.

Do **not** merge or transition Jira Done until explicit ADR acceptance, implementation of the accepted lifetime policy, real Next.js + NestJS + PostgreSQL E2E, LMP-25 prerequisite review, legal/privacy gate, and deployment/security review pass.
