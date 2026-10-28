# IdentityModule (LMP-33 / ADR-019 + LMP-34 / ADR-020)

Parent identity session lifecycle and GSM OTP sign-in inside the Nest modular monolith.

## In scope

- Session mint port (`SessionIssuerService` / `mintSessionTx`) for LMP-34+ providers
- Opaque refresh + Ed25519 access JWT (`jose`)
- Refresh / logout / logout-all / session list+revoke
- `GET /v1/parent/me`
- `ParentAuthGuard` + internal `assertParentOwnsChild` helper
- Strictly gated `POST /v1/auth/dev/session` (local/test only)
- GSM OTP `POST /v1/auth/phone/start|verify` (LMP-34) — LM-owned OTP + delivery-only `SmsSender`

## Out of scope

- Apple / Google / email adapters — **LMP-35** (ADR-021 **Accepted** — Phase B = separate implementation PR after docs merge auth)
- Explicit account linking / recovery — **LMP-36**
- Web cookie session UX — **LMP-38**
- Phone change / recovery — deferred (**U18**)
- Paid SMS vendor SDKs / real staging SMS — gated (**U19**)
- Public ownership-check HTTP API — **forbidden** by ADR-019
- Public fake OTP inbox / notice-token endpoints — **forbidden** (U17 / Option A)

## Design reference

- Sessions: `docs/adr/ADR-019-parent-identity-secure-session-lifecycle.md` (**Accepted**)
- GSM OTP: `docs/adr/ADR-020-gsm-otp-sign-in.md` (**Accepted** 2026-10-28 — U7 Option A + notice Option A + U1–U17; U18–U20 deferred)
- Multi-provider (Apple / Google / Email OTP): `docs/adr/ADR-021-multi-provider-identity-adapters.md` (**Accepted** 2026-10-28 — U7 Option A; Apple mandatory nonce; Google nonce-or-PKCE; `email_norm_v1`; deliveryState=sent) · sketch `docs/adr/lmp-35-multi-provider-api-contract-sketch.md`
- Privacy notice catalog (engineering placeholder / legal blocker): `docs/privacy-notice-catalog.md`
