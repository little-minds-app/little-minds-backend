# LMP-35 — Multi-provider auth API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Non-live companion to **Proposed** ADR-021. Live OpenAPI remains **`0.5.0`** until a future **implementation** PR publishes **`0.6.0`**. |
| **Parent ADR** | [ADR-021](./ADR-021-multi-provider-identity-adapters.md) (**Proposed**) |
| **Jira** | LMP-35 |

> **Proposed:** Apple / Google ID token verify; LM-owned Email OTP; no silent merge; mint via ADR-019 `mintSessionTx`.  
> **Needs human Approve:** first-time create (**U7**), Email OTP numbers.  
> **Deferred:** account linking (LMP-36); production email vendor; client ADR sync.

---

## Architecture note

- Backend verifies Apple/Google **ID tokens** (JWKS) and owns Email OTP generate/verify.
- `MailSender` is **delivery-only** (Mailpit/fake locally; production SMTP **unapproved**).
- Firebase Auth / hosted OTP-verify products are **not** systems of record.
- All success paths call `SessionIssuerService.mintSessionTx` then sign JWT post-commit.

---

## Privacy notice binding (proposed)

- Notice ≠ ToS ≠ optional consent (ADR-020 §6).
- Present notice before email collect / Apple|Google credential submit.
- **Email start:** uniform `notice_version` + `notice_locale` (Option A).
- **Apple / Google:** uniform notice fields on the auth request used for first-time create (same shape for existing/new — anti-enum).
- Verify / token exchange responses do **not** branch on “new vs existing” privacy requirements.
- Server catalog; staging/prod require that exact entry `published: true`.

---

## Proposed live version

| Phase | OpenAPI |
|---|---|
| This docs PR | Keep live **`0.5.0`** (phone routes only) |
| LMP-35 implementation PR (after Accept + auth) | Propose bump **`0.6.0`** additive paths below |

---

## Paths (proposed)

### `POST /v1/auth/apple`

Unauthenticated. Body: Apple ID token + notice fields + optional nonce/device.

**200** `TokenPairResponse`  
**401** `invalid_token` / generic auth failure (uniform)  
**400** `invalid_request` (malformed / invalid notice — uniform)

### `POST /v1/auth/google`

Same shape as Apple with Google ID token.

### `POST /v1/auth/email/start`

Unauthenticated; rate-limited. Body: email + `notice_version` + `notice_locale`.

**200** uniform start response (`challenge_id`, `expires_in`, `resend_after`) — never returns OTP  
**400** `invalid_request` (malformed email / notice — uniform)  
**429** `otp_cooldown` / `rate_limited`  
**503** `mail_unavailable` (proposed parallel to `sms_unavailable`)

### `POST /v1/auth/email/verify`

Body: `challenge_id` + `code` (+ optional device/surface) only — **no** privacy fields.

**200** `TokenPairResponse`  
**401** `otp_invalid`  
**429** rate limited

### Explicitly **not** in LMP-35 sketch

- `/v1/auth/link/*` account linking — **LMP-36**
- Public “is this email registered?” probes
- Firebase session exchange endpoints

---

## Schemas (illustrative)

### AppleAuthRequest / GoogleAuthRequest

```yaml
AppleAuthRequest:
  type: object
  additionalProperties: false
  required: [id_token, notice_version, notice_locale]
  properties:
    id_token: { type: string, minLength: 20, maxLength: 8192 }
    nonce: { type: string, maxLength: 128 }
    notice_version: { type: string, maxLength: 64 }
    notice_locale: { type: string, maxLength: 16 }
    client_surface: { type: string, maxLength: 32 }
    device_id: { type: string, maxLength: 128 }
```

Google request mirrors Apple (`id_token` = Google ID token).

### EmailOtpStartRequest

```yaml
EmailOtpStartRequest:
  type: object
  additionalProperties: false
  required: [email, notice_version, notice_locale]
  properties:
    email: { type: string, format: email, maxLength: 320 }
    notice_version: { type: string, maxLength: 64 }
    notice_locale: { type: string, maxLength: 16 }
    client_surface: { type: string, maxLength: 32 }
```

### EmailOtpVerifyRequest

```yaml
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

## Errors (proposed)

| Code | When |
|---|---|
| `invalid_request` | Malformed body / notice / email shape (uniform) |
| `invalid_token` | Apple/Google token failed verification (generic message) |
| `otp_invalid` | Email OTP wrong/expired/locked/not durable-sent |
| `otp_cooldown` | Resend too soon / in-flight |
| `rate_limited` | Durable counter exceeded |
| `mail_unavailable` | MailSender failure after challenge commit (no auto-resend) |
| `session_limit_exceeded` | ADR-019 cap |

Anti-enumeration: do not reveal whether email/Apple/Google subject already exists via distinct error codes on start/auth.

---

## U7 note (non-normative until Approve)

If human Approves **Option A**, verify/auth success for unknown subjects creates parent + identity + notice evidence + session in one txn.  
If **Option B**, unknown subjects return a uniform failure directing clients to a future register flow — **not** sketched as live paths here.

---

## Non-goals

- Publishing these paths in live `contracts/openapi.yaml` in this docs PR
- Linking APIs, password auth, magic-link without OTP challenge table
- Client SDK changes
