# IdentityModule (LMP-33 / ADR-019 + LMP-34 / ADR-020 + LMP-35 / ADR-021)

Parent identity session lifecycle, GSM OTP, and Apple / Google / Email OTP
sign-in inside the Nest modular monolith.

## In scope

- Session mint port (`SessionIssuerService` / `mintSessionTx`) for all providers
- Opaque refresh + Ed25519 access JWT (`jose`)
- Refresh / logout / logout-all / session list+revoke
- `GET /v1/parent/me`
- `ParentAuthGuard` + internal `assertParentOwnsChild` helper
- Strictly gated `POST /v1/auth/dev/session` (local/test only)
- GSM OTP `POST /v1/auth/phone/start|verify` (LMP-34) — LM-owned OTP + delivery-only `SmsSender`
- Apple / Google / Email OTP (LMP-35) — JWKS+nonce, nonce-or-PKCE, `email_norm_v1`, `MailSender`

## Out of scope

- Explicit account linking / recovery — **LMP-36**
- Web cookie session UX — **LMP-38**
- Phone change / recovery — deferred (**U18**)
- Paid SMS / Apple/Google production enablement / real staging SMTP — gated (**U19** / ADR-021 U22)
- Public ownership-check HTTP API — **forbidden** by ADR-019
- Public fake OTP inbox / notice-token endpoints — **forbidden** (U17 / Option A)

## Design reference

- Sessions: `docs/adr/ADR-019-parent-identity-secure-session-lifecycle.md` (**Accepted**)
- GSM OTP: `docs/adr/ADR-020-gsm-otp-sign-in.md` (**Accepted** 2026-10-28)
- Multi-provider: `docs/adr/ADR-021-multi-provider-identity-adapters.md` (**Accepted** 2026-10-28) · sketch `docs/adr/lmp-35-multi-provider-api-contract-sketch.md`
- Privacy notice catalog: `docs/privacy-notice-catalog.md`
- Live OpenAPI: **`0.6.1`** (`pkce/start` + provider-bound nonce)
