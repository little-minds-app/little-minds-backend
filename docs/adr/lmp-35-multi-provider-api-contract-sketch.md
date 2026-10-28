# LMP-35 — Multi-provider auth API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Non-live companion to **Proposed** ADR-021. Live OpenAPI remains **`0.5.0`** until implementation proposes **`0.6.0`**. |
| **Parent ADR** | [ADR-021](./ADR-021-multi-provider-identity-adapters.md) (**Proposed**) |
| **Jira** | LMP-35 |

> **Proposed (security-critical):** Apple/Google ID token verify matrix (iss/aud/JWKS/exp/iat/skew/typ/**mandatory nonce+replay**); `email_norm_v1`; Email OTP limits + durable counters + **deliveryState=sent** verify gate; **no silent email link**.  
> **Recommended pending Accept:** **U7 Option A**. Linking = **LMP-36**.

---

## Architecture note

- LM verifies Apple/Google ID tokens; never trusts client-supplied `sub`/email/name for binding.
- Email OTP: LM-owned; `MailSender` delivery-only; verify only after durable `sent`.
- Sessions: ADR-019 `mintSessionTx` only.

---

## Privacy

Option A notice fields on email start and Apple/Google auth; verify has no privacy fields; uniform invalid notice → `invalid_request`.

---

## OpenAPI version

| Phase | Version |
|---|---|
| This docs PR | Live **`0.5.0`** unchanged |
| Future implementation | Propose **`0.6.0`** |

---

## Paths (proposed)

### `POST /v1/auth/apple` / `POST /v1/auth/google`

**Required:** `id_token`, `nonce`, `notice_version`, `notice_locale`.  
Optional: `client_surface`, `device_id`.

Server: full ADR-021 §4/§5 verify; reject unverified client identity fields if present (ignore or `400` — prefer **ignore unknown** with `additionalProperties: false` so extras fail closed).

**200** `TokenPairResponse`  
**401** `invalid_token` (uniform — covers bad sig, iss/aud, exp/iat, nonce miss/replay)  
**400** `invalid_request` (malformed / notice)

### Nonce issuance (proposed companion)

`POST /v1/auth/oidc/nonce` (name TBD) — returns short-lived nonce for Apple/Google; rate-limited; **or** document client-nonce pre-registration. Nonce is **mandatory** on Apple/Google auth either way.

### `POST /v1/auth/email/start`

**Required:** `email`, `notice_version`, `notice_locale`.  
Normalize via **`email_norm_v1`**; durable counters; commit challenge; send outside txn.

**200** `{ challenge_id, expires_in: 600, resend_after: 60 }` — never OTP  
**400** `invalid_request`  
**429** `otp_cooldown` / `rate_limited`  
**503** `mail_unavailable`

### `POST /v1/auth/email/verify`

**Required:** `challenge_id`, `code` only.  
Gate: pending + `deliveryState=sent`.

**200** `TokenPairResponse`  
**401** `otp_invalid`  
**429** rate limited

### Not in LMP-35

- `/v1/auth/link/*` — **LMP-36**
- Existence probes; Firebase exchange

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

# GoogleAuthRequest: identical shape

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

## Email OTP limits (sketch mirror)

| Limit | Value |
|---|---|
| TTL / cooldown / attempts | 600 s / 60 s / 5 |
| Sends / subject / 15m / 24h | 3 / 10 |
| Sends / IP / 15m / 24h | 10 / 40 |
| Verify / IP / min | 10 |

---

## Errors

| Code | Use |
|---|---|
| `invalid_request` | Malformed / notice / email_norm reject |
| `invalid_token` | Apple/Google verify or nonce failure |
| `otp_invalid` | Email OTP / not durable-sent |
| `otp_cooldown` / `rate_limited` | Limits |
| `mail_unavailable` | Send/persist failure (no auto-resend) |
| `session_limit_exceeded` | ADR-019 |

---

## U7

**Recommended pending Accept:** Option A auto-create on unknown verified subject. No silent cross-provider email link.
