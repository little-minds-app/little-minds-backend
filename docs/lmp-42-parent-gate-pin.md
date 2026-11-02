# LMP-42 Parent Gate PIN security contract (implementation checklist)

Status: implementation in progress; **not accepted for release**.

## Product rules
- A verified parent creates and confirms a six-digit PIN before accessing adult-only surfaces. Children can continue to use Kids Mode without PIN creation.
- Every transition from Kids Mode to an adult surface requires a fresh PIN challenge, **even if a parent session exists**. Parent session != adult-mode unlock.
- Parent-specific PIN: switching parent accounts never imports an unlock or PIN.
- Exit to Kids Mode, logout, account switch, session invalidation, app restart and background transition invalidate adult-mode unlock.
- All settings, purchase, profile-management and reporting routes (including deep links) are gated.
- Recover or change forgotten PIN only by fresh, server-verified identity proof (OTP or equivalent), not by an existing access token.

## Backend requirements
- Six ASCII digits, no default PIN, no logs or analytics collection.
- Salted, memory-hard password derivation (e.g. scrypt with carefully bounded work factor) plus a server-held pepper; constant-time verification.
- Database-backed, atomic failed-attempt increments and escalating lockouts. Multiple simultaneous attempts must not evade the throttle; never reset lockout on app reinstall.
- PIN setup/change/recovery and verification must verify the active parent and current session, and never trust a client-provided parent ID.
- A successful verification provides a short-lived, narrowly-scoped adult grant bound to parent and session. Adult-sensitive operations must not rely solely on the mobile UI route.
- Avoid returning sensitive distinctions (PIN exists / account association) to unauthorized callers.
- Include database, service, HTTP E2E and revocation/race tests. Add authorization-negative cases.

## Implementation tracking
- [x] Parent-specific salted scrypt persistence, attempts and escalating lockout
- [x] Fresh linked-identity step-up for setup and reset, with single-use proof
- [x] Five-minute opaque grants bound to parent and current session
- [x] Serialized PIN verification/grant issuance and OTP reset (parent-row lock)
- [x] Token-scoped explicit revocation; a delayed lock cannot revoke a new grant
- [x] Parent-sensitive profile read/write and child profile write authorization
- [x] Minimal child-list/child-get remains accessible with active parent session, for Kids Mode profile selection only; output is child_id, nickname, age_months, preferred_locale. No adult profile fields, contact data, purchase/reporting data.
- [x] OpenAPI contract and generated clients
- [x] Flutter challenge, enrollment, recovery and background lock
- [x] PostgreSQL two-client verification/reset race regression
- [ ] Fresh CI and independent final security review
- [ ] Manual iOS/Android device acceptance

## Revocation and residual risks
The mobile app deletes the local adult-mode grant immediately. The server revokes only the captured old token. If a DELETE fails due to network loss, the app retries every five seconds while alive and again on resume until the token's five-minute expiry. Remote revocation cannot be guaranteed while the device is offline or terminated: the previous token remains valid server-side until expiration, provided the parent session remains active. No token is persisted for retry across process death. This residual risk must be accepted explicitly before shipping; sensitive operations still check the parent session and current grant.
