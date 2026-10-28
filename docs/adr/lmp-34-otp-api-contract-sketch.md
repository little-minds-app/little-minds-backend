# LMP-34 — GSM OTP API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Sketch only — **not** published until ADR-020 **Accept** + implementation PR OpenAPI **`0.5.0`**. Live contract stays **`0.4.0`**. |
| **Parent ADR** | [ADR-020](./ADR-020-gsm-otp-sign-in.md) (**Proposed**) |
| **Jira** | LMP-34 |

> **Selected:** LM-owned OTP; delivery-only SMS; **U7 Option A**.  
> **Recommended (await Accept):** numeric limits, KVKK notice binding (§ below), U12/U13 mechanics.  
> Do **not** treat proposals as Accepted security/legal parameters.

---

## Architecture note (selected)

- Backend owns OTP generate/verify and parent/session lifecycle (ADR-019 `SessionIssuerService` / future `mintSessionTx`).
- `SmsSender` is **delivery-only** (`FakeSmsSender` now; Netgsm / Twilio Programmable Messaging / Plivo = future candidates — **not** approved).
- Firebase Phone Auth / Twilio Verify are **not** `SmsSender` implementations.

---

## Privacy notice binding (recommended — ADR-020 §6)

- Notice ≠ ToS ≠ optional consent.
- Present notice **before/at** phone collection; bind evidence at **start**.
- Server owns active notice catalog; clients do not invent authoritative versions.
- **Verify has no privacy fields** — avoids new-vs-existing client branching and account-existence oracles (**U12**).

---

## Paths (proposed)

### `POST /v1/auth/phone/start`

Unauthenticated; rate-limited (durable IP + subject + global). TR-only Day-1 (**U10** proposal).

**200** uniform `PhoneOtpStartResponse` (anti-enumeration). Never returns `otp_code`.  
**400** generic `invalid_request` (non-TR / malformed / **invalid or missing notice presentation** — same shape for all callers).  
**429** `otp_cooldown` / `rate_limited`.  
**503** `sms_unavailable` (uniform).

### `POST /v1/auth/phone/verify`

**Uniform** for existing and new parents. Body: `challenge_id` + `code` (+ optional device/surface) only.

**U7 Option A** server-side: existing phone identity → sign in; unknown → create parent + phone identity + copy challenge notice evidence; then `mintSessionTx` in the **same** DB transaction (ADR-020 §9–§10).

**200** `TokenPairResponse`.  
**401** `otp_invalid` (uniform).  
**400** malformed body only (not “missing privacy for new users”).  
**429** rate limited.

---

## Schemas (proposed)

### PhoneOtpStartRequest

```yaml
PhoneOtpStartRequest:
  type: object
  additionalProperties: false
  required: [phone, notice_presentation]
  properties:
    phone: { type: string, minLength: 5, maxLength: 32 }
    country_code: { type: string, maxLength: 8 }
    notice_presentation:
      type: object
      additionalProperties: false
      description: |
        Uniform for ALL callers (existing and new). Server validates against
        owned notice catalog. Preferred shapes (Accept picks one):
        (A) notice_version + notice_locale matching active published pair, or
        (B) opaque short-lived notice_presentation_token minted by server.
      properties:
        notice_version: { type: string, maxLength: 64 }
        notice_locale: { type: string, maxLength: 16 }
        notice_presentation_token: { type: string, maxLength: 512 }
      # Exactly one Accept-approved shape required at implementation time
    client_surface: { type: string, maxLength: 32 }
    device_id: { $ref: '#/components/schemas/UuidV4OrV7' }
```

### PhoneOtpStartResponse

```yaml
PhoneOtpStartResponse:
  type: object
  additionalProperties: false
  required: [challenge_id, expires_in, resend_after]
  properties:
    challenge_id: { $ref: '#/components/schemas/UuidV4OrV7' }
    expires_in: { type: integer, enum: [300] }      # U2 proposal
    resend_after: { type: integer, enum: [60] }     # U4 proposal
    # Optional echo of bound notice_version is Accept-optional; must not
    # differ by account existence.
```

### PhoneOtpVerifyRequest

```yaml
PhoneOtpVerifyRequest:
  type: object
  additionalProperties: false
  required: [challenge_id, code]
  properties:
    challenge_id: { $ref: '#/components/schemas/UuidV4OrV7' }
    code: { type: string, pattern: '^[0-9]{6}$' }   # U1 proposal
    client_surface: { type: string, maxLength: 32 }
    device_id: { $ref: '#/components/schemas/UuidV4OrV7' }
    # Intentionally NO privacy_notice_version — bound at start (ADR-020 §6.4)
```

### AuthError extensions (U15 proposal)

Additive: `otp_invalid`, `otp_cooldown`, `sms_unavailable`.

---

## Proposed rate / abuse numbers (not enablement)

See ADR-020 §8: 5 attempts/challenge; 60s resend; 3 SMS/phone/15m; 10 SMS/phone/24h; 5 SMS/IP/15m; 30 SMS/IP/24h; 10 verify/IP/min; 500 SMS/day global planning candidate. Prefer PostgreSQL durable counters.

---

## Out of scope Day-1

Provider link; phone change/recovery (**U18**); public fake OTP route (**U17**); real staging SMS (**U19**); non-TR (**U10**); vendor SDKs; optional-consent subsystem; child guardianship flows; live OpenAPI phone paths; applied migrations.

---

## Prisma sketch (non-live)

```sql
-- After Accept only
CREATE TABLE otp_challenges (
  id uuid PRIMARY KEY,
  provider text NOT NULL,
  subject_key text NOT NULL,
  code_hash text NOT NULL,
  status text NOT NULL,
  delivery_state text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  send_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  last_sent_at timestamptz,
  sealed_destination text,
  notice_version text NOT NULL,
  notice_locale text NOT NULL,
  notice_presented_at timestamptz NOT NULL,
  presentation_surface text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX otp_challenges_one_pending_per_subject
  ON otp_challenges (provider, subject_key) WHERE status = 'pending';

CREATE TABLE otp_delivery_attempts (
  id uuid PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES otp_challenges(id) ON DELETE CASCADE,
  adapter text NOT NULL,
  result text NOT NULL,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE otp_abuse_counters (
  bucket_type text NOT NULL,
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL,
  send_count integer NOT NULL DEFAULT 0,
  verify_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_type, bucket_key, window_start)
);
-- Parent-linked notice evidence reuses/extends privacy_notice_acknowledgments
-- inside the verify transaction for U7 creates (ADR-020 §6 / §9).
```

Hash: `HMAC-SHA256(OTP_PEPPER, challenge_id || ":" || subject_key || ":" || code)`  
Subject: `hex(HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164))`
