# LMP-35 — Multi-provider auth API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Normative companion to **Accepted** ADR-021. Live OpenAPI remains **`0.5.0`** until implementation publishes **`0.6.0`**. |
| **Parent ADR** | [ADR-021](./ADR-021-multi-provider-identity-adapters.md) (**Accepted** 2026-10-28) |
| **Jira** | LMP-35 |

> **Accepted:** U7 Option A; Apple JWKS + mandatory nonce; Google prefer nonce else auth-code+PKCE only (fail-closed); `email_norm_v1`; Email OTP 3/10 subject, 10/40 IP, 2000/day unactivated ceiling; verify only `deliveryState=sent`; no silent email link (LMP-36).

---

## Architecture

- Apple: ID token + **mandatory nonce** + JWKS claim matrix.
- Google: **prefer** ID token + nonce; else **authorization-code + PKCE** server exchange then JWKS-verify ID token — **never** ID-token-without-nonce fallback.
- Email OTP: LM-owned; `MailSender` delivery-only; **`deliveryState=sent`** before verify.
- Sessions: `mintSessionTx` only. Reject unverified client identity fields.

---

## Privacy

Option A `notice_version` + `notice_locale` on email start and Apple/Google auth; verify has no privacy fields.

---

## OpenAPI

| Phase | Version |
|---|---|
| This docs PR | Live **`0.5.0`** |
| Phase B implementation | Propose **`0.6.0`** |

---

## Paths (proposed for 0.6.0)

### `POST /v1/auth/apple`

Required: `id_token`, `nonce`, `notice_version`, `notice_locale`.  
**401** `invalid_token` on JWKS/claim/nonce/replay failure.

### `POST /v1/auth/google`

One of:

- **Nonce path:** `id_token` + `nonce` + notice fields (preferred when platform supports nonce, e.g. iOS 9+).
- **PKCE path:** `authorization_code` + `code_verifier` (+ redirect/client metadata as required) + notice fields — server exchanges with PKCE; verifies ID token via JWKS.

If neither path can be satisfied → **fail-closed** (`401` / `400`) — no weak ID-token-only acceptance.

### `POST /v1/auth/oidc/nonce` (or equivalent)

Issues short-lived nonce for Apple / Google nonce path; rate-limited.

### `POST /v1/auth/email/start`

Required: `email`, `notice_version`, `notice_locale`. Apply **`email_norm_v1`**.  
**200** `{ challenge_id, expires_in: 600, resend_after: 60 }`.

### `POST /v1/auth/email/verify`

Required: `challenge_id`, `code` only. Gate: pending + **`deliveryState=sent`**.

### Not in LMP-35

`/v1/auth/link/*` — **LMP-36**.

---

## Schemas (illustrative)

```yaml
AppleAuthRequest:
  type: object
  additionalProperties: false
  required: [id_token, nonce, notice_version, notice_locale]
  properties:
    id_token: { type: string, minLength: 20, maxLength: 8192 }
    nonce: { type: string, minLength: 8, maxLength: 128 }
    notice_version: { type: string, maxLength: 64 }
    notice_locale: { type: string, maxLength: 16 }
    client_surface: { type: string, maxLength: 32 }
    device_id: { type: string, maxLength: 128 }

GoogleAuthNonceRequest:
  type: object
  additionalProperties: false
  required: [id_token, nonce, notice_version, notice_locale]
  properties:
    id_token: { type: string, minLength: 20, maxLength: 8192 }
    nonce: { type: string, minLength: 8, maxLength: 128 }
    notice_version: { type: string, maxLength: 64 }
    notice_locale: { type: string, maxLength: 16 }
    client_surface: { type: string, maxLength: 32 }
    device_id: { type: string, maxLength: 128 }

GoogleAuthCodeRequest:
  type: object
  additionalProperties: false
  required: [authorization_code, code_verifier, notice_version, notice_locale]
  properties:
    authorization_code: { type: string, minLength: 8, maxLength: 2048 }
    code_verifier: { type: string, minLength: 43, maxLength: 128 }
    redirect_uri: { type: string, maxLength: 2048 }
    notice_version: { type: string, maxLength: 64 }
    notice_locale: { type: string, maxLength: 16 }
    client_surface: { type: string, maxLength: 32 }
    device_id: { type: string, maxLength: 128 }

EmailOtpStartRequest:
  type: object
  additionalProperties: false
  required: [email, notice_version, notice_locale]
  properties:
    email: { type: string, maxLength: 320 }
    notice_version: { type: string, maxLength: 64 }
    notice_locale: { type: string, maxLength: 16 }
    client_surface: { type: string, maxLength: 32 }

EmailOtpVerifyRequest:
  type: object
  additionalProperties: false
  required: [challenge_id, code]
  properties:
    challenge_id: { type: string, format: uuid }
    code: { type: string, pattern: '^[0-9]{6}$' }
    client_surface: { type: string, maxLength: 32 }
    device_id: { type: string, maxLength: 128 }
```

---

## Email OTP limits (Accepted)

| Limit | Value |
|---|---|
| TTL / cooldown / attempts | 600 s / 60 s / 5 |
| Sends / subject / 15m / 24h | **3** / **10** |
| Sends / IP / 15m / 24h | **10** / **40** |
| Verify / IP / min | 10 |
| Global / day | **2000** unactivated ceiling |

---

## Errors

| Code | Use |
|---|---|
| `invalid_request` | Malformed / notice / `email_norm_v1` reject |
| `invalid_token` | Apple/Google verify, nonce, or PKCE exchange failure |
| `otp_invalid` | Email OTP / not durable-sent |
| `otp_cooldown` / `rate_limited` | Limits |
| `mail_unavailable` | Send/persist failure (no auto-resend) |
| `session_limit_exceeded` | ADR-019 |

---

## U7

**Accepted Option A:** unknown verified subject → create parent + identity + notice + session in one txn. No silent cross-provider email link.
