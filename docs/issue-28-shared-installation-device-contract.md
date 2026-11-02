# Issue #28 — Shared installation / parent-scoped device contract

## Identity and authorization
- `device_id` in mobile authentication requests is an **untrusted installation hint** (UUID), never an authorization credential.
- The backend derives the database `devices.id` deterministically from **both** the supplied installation UUID and the verified session parent ID (`scopedDeviceId`). A legacy `devices.id` equal to the installation UUID remains bound to its original owner to avoid touching previously attached child, screen-time, sync, or activity data.
- `parent_sessions.device_id` stores the **parent-scoped database device identifier**, not necessarily the client-supplied installation UUID. Client code MUST NOT assume these values are identical.
- A device-specific protected endpoint MUST resolve the parent-scoped database device identifier on the server, verify ownership against the authenticated `parentId`, and enforce revocation and child ownership. It MUST NOT use a raw installation UUID directly as an owner-scoped `devices.id`. No such generic client-facing device resolver is introduced by PR #29.
- No ownership transfer, migration of child data, or clearing a revoked binding is permitted.

## Revocation semantics
A device row's `revoked_at` applies to **that parent's registration**. It does not globally ban the installation for other independently verified parents. Revocation of the parent-scoped or legacy row blocks re-login for that same parent and installation ID. A changed/reinstalled installation ID is a distinct client claim and is **not** a tamper-resistant hardware identity. Global risk/block policy would require a separate mechanism.

## Mobile state / cache
- On account switch, revoke prior server session and clear access/refresh token storage; child data and screen-time caches must be parent scoped or invalidated before the new parent accesses them.
- The mobile auth repository currently submits the installation UUID only on login; its `deviceId()` is **process-memory** generated. It must not be interpreted as a persistent hardware/device identifier.
- Future device/activity APIs require an explicit server-authorized parent-scoped device reference, not a client-side reproduction of the SHA-256 derivation.
- This PR is a backend session-mint fix, not approval of yet-unimplemented downstream device APIs or client cache behavior.

## Proof gates
Unit tests and real-Postgres tests for A/logout/B with the same installation, existing legacy row preservation, session separation, concurrent registration, and scoped revocation. Manual TC-08 on the same simulator and Flutter cache isolation remain required before merge.
