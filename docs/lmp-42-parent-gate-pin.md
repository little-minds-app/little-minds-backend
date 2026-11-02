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
- [x] Parent-scoped Prisma persistence model
- [x] Explicit SQL migration
- [ ] PIN create/change/reset endpoints with fresh identity proof
- [ ] Atomic rate limiter, verification and adult grant issuance/revocation
- [ ] OpenAPI contract and generated clients
- [ ] Flutter setup/challenge screens and navigation integration
- [ ] Phone/tablet and session/account-switch regression tests
- [ ] CI, security review and manual UAT

The persistence model alone does **not** enforce the gate. Do not merge or enable PIN UI until the full flow is implemented and verified.
