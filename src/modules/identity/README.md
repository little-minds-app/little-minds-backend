# IdentityModule (LMP-33 / ADR-019)

Parent identity session lifecycle inside the Nest modular monolith.

## In scope

- Session mint port (`SessionIssuerService`) for LMP-34+ providers
- Opaque refresh + Ed25519 access JWT (`jose`)
- Refresh / logout / logout-all / session list+revoke
- `GET /v1/parent/me`
- `ParentAuthGuard` + internal `assertParentOwnsChild` helper
- Strictly gated `POST /v1/auth/dev/session` (local/test only)

## Out of scope (this module's LMP-33 surface)

- GSM OTP (`POST /v1/auth/phone/*`) — **LMP-34** (Proposed ADR-020; LM-owned OTP + delivery-only SMS)
- Apple / Google / email adapters — **LMP-35**
- Web cookie session UX — **LMP-38**
- Public ownership-check HTTP API — **forbidden** by ADR-019

## Design reference

- Sessions: `docs/adr/ADR-019-parent-identity-secure-session-lifecycle.md` (**Accepted**)
- GSM OTP: `docs/adr/ADR-020-gsm-otp-sign-in.md` (**Accepted** 2026-10-28 — U7 Option A + notice Option A + U1–U17; U18–U20 deferred; implementation = separate PR; no runtime in docs PR)
