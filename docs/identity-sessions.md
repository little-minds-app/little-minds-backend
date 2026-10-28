# Parent identity sessions (LMP-33 / ADR-019)

Authoritative design: [`docs/adr/ADR-019-parent-identity-secure-session-lifecycle.md`](./adr/ADR-019-parent-identity-secure-session-lifecycle.md).

## Runtime summary

| Item | Behavior |
|---|---|
| Access JWT | Ed25519 (`jose`), 15 minutes, Bearer |
| Refresh | Opaque, peppered HMAC hash, absolute 30-day session |
| Protected routes | Always load `parent_sessions` by `sid` (immediate revoke) |
| Cap | Max 20 active sessions per parent |
| Dev bootstrap | `POST /v1/auth/dev/session` — development/test + flag + allowlist + loopback only |
| OpenAPI | `contracts/VERSION` **0.4.0** |

## Environment

See `.env.example`. Staging/production require `JWT_ACCESS_*_PEM` and a strong `REFRESH_TOKEN_PEPPER`. Public verify PEMs are non-secret; private key + pepper are secrets. No paid KMS in V1.

## GSM OTP

Owned by **LMP-34** — must call `SessionIssuerService.mintSession` after verify. Do not invent a second session store.
