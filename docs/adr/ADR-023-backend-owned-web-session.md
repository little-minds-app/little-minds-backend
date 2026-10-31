# ADR-023 — Backend-owned opaque parent web session (IMPLEMENTATION DRAFT)

Status: **Proposed / pending review and CI**, LMP-38. Builds on ADR-019 (existing parent sessions). The browser does not receive JWTs or rotating refresh tokens.

## Security model

1. Next.js BFF calls the existing phone OTP verify endpoint. Its short-lived access token is never returned to the browser. Next immediately sends the access token to `POST /v1/auth/web/session` with a bearer header.
2. `ParentAuthGuard` verifies the token, active parent and parent session. The new web service checks `client_surface=web`, locks the parent session row, and permanently **disables native refresh** on that session by removing its current refresh hash and history lookup; it creates one unique web session row.
3. The backend returns a fresh random 256-bit opaque `handle` and expiry to the **server-to-server** Next.js route. Next only sets the handle in a `Secure, HttpOnly, SameSite=Strict, Path=/` cookie (production `__Host-lm_web_session`; distinct dev cookie on localhost). Legacy browser bearer/refresh cookies are cleared.
4. On `GET /v1/auth/web/me`, the backend hashes the opaque handle with a domain-separated HMAC key and looks up the durable record in PostgreSQL. Every request rechecks the bound parent account and parent session's active/expiry state. **No refresh occurs.** Multiple Next/backend replicas can authorize simultaneously without rotating the same token. This avoids the cross-replica replay race by design.
5. `POST /v1/auth/web/logout` revokes the opaque handle and its underlying parent session, idempotently. Existing logout-all and account deletion invalidate linked web sessions by invalidating their parent sessions. Expiry is bounded by the original parent session's absolute lifetime (30 days).

## Tradeoffs

- A stolen opaque handle remains a bearer credential until revoked/expired; cookie security, CSRF protection, TLS, short reasonable absolute expiry, and session revocation are required.
- No sliding session renewal: on absolute expiry the parent signs in again. This is deliberate to avoid unsafe refresh semantics. Browser sessions can be shortened later after product/security review.
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

Do **not** merge or transition Jira Done until integration tests and deployment/security review pass.
