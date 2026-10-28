# Parent identity sessions (LMP-33 / ADR-019)

Authoritative design: [`docs/adr/ADR-019-parent-identity-secure-session-lifecycle.md`](./adr/ADR-019-parent-identity-secure-session-lifecycle.md).

## Runtime summary

| Item | Behavior |
|---|---|
| Access JWT | Ed25519 (`jose`), 15 minutes, Bearer |
| Refresh | Opaque, peppered HMAC hash, absolute 30-day session; single-winner transactional rotate |
| Reuse detection | Indexed `parent_session_refresh_hash_lookups` (O(1); no scan cap) |
| Protected routes | Always load `parent_sessions` by `sid` (immediate revoke) |
| Cap | Max 20 active sessions per parent (`FOR UPDATE` on parent row) |
| Client IP | Transport peer only — **never** trusts `X-Forwarded-For` for bootstrap/rate limits |
| Dev bootstrap | Flag + allowlist + loopback **peer** + loopback **LISTEN_HOST** + local `PUBLIC_API_BASE_URL`; **rejects proxied** requests (XFF/Forwarded) |
| OpenAPI | `contracts/VERSION` **0.4.0** |

## Environment

See `.env.example`. Staging/production require `JWT_ACCESS_*_PEM` and a strong non-local `REFRESH_TOKEN_PEPPER`; `AUTH_DEV_BOOTSTRAP_ENABLED` must be false. When bootstrap is enabled locally, `LISTEN_HOST` must be `127.0.0.1`/`::1` (Nest binds only there) and `PUBLIC_API_BASE_URL` must be a local host — this fails closed against a public reverse proxy that would otherwise make every peer look like loopback. Public verify PEMs are non-secret; private key + pepper are secrets. No paid KMS in V1.

### Local simulator / device workflow (bootstrap)

`POST /v1/auth/dev/session` is intentionally unreachable via shared Docker publishes, LAN binds (`0.0.0.0`), or any reverse proxy that sets `X-Forwarded-*` / `Forwarded` / `X-Real-IP`. Safe local workflows:

1. Run the API on the host with `LISTEN_HOST=127.0.0.1` and call bootstrap from the same machine (iOS Simulator / Android emulator via `http://127.0.0.1:3000` or the platform loopback alias).
2. Do **not** put nginx/Caddy/Cloudflare in front of a bootstrap-enabled process.
3. Physical devices on the LAN cannot use bootstrap while the fail-closed bind is in force — use a host-side curl/bootstrap then paste tokens, or wait for LMP-34 GSM OTP mint.

## Client integration requirements (ADR-019 — remaining work outside this PR)

These are **normative client rules**; backend already enforces single-winner rotation and reuse revoke.

| Requirement | Client must |
|---|---|
| Single-flight refresh | At most one in-flight `POST /v1/auth/token/refresh` per session; coalesce concurrent callers |
| Consumed refresh | **Never** retry a refresh token after any response (success, `401`, network ambiguity) |
| Lost refresh response | If the request may have succeeded but the body was lost → **re-authenticate** (do not resubmit the old refresh) |
| Access TTL | Expect ~15m access JWT; refresh before expiry when online |
| Logout | Prefer refresh body and/or Bearer; expired-but-signed access JWT may still revoke by `sid` |
| Session cap | Handle `403 session_limit_exceeded` (logout one device or logout-all) |
| Bootstrap | **Never** call `POST /v1/auth/dev/session` from staging/production builds |

GSM OTP login mint is **LMP-34** and must call `SessionIssuerService.mintSession` after verify — do not invent a second session store.

## GSM OTP

Owned by **LMP-34** — must call `SessionIssuerService.mintSession` after verify. Do not invent a second session store.
