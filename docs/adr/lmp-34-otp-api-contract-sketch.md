# LMP-34 — GSM OTP API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Sketch only — **not** published until ADR-020 **Accept** + implementation PR OpenAPI **`0.5.0`**. Live contract stays **`0.4.0`**. |
| **Parent ADR** | [ADR-020](./ADR-020-gsm-otp-sign-in.md) (**Proposed**) |
| **Jira** | LMP-34 |

> Numerical fields below mirror **recommended proposals** (U1–U6, U14–U16). Only **U7 Option A** and LM-owned / delivery-only SMS architecture are human-**selected**. Do not treat proposals as Accepted security parameters.

---

## Architecture note (selected)

- Backend owns OTP generate/verify and parent/session lifecycle (ADR-019 `SessionIssuerService`).
- `SmsSender` is **delivery-only** (`FakeSmsSender` now; future Netgsm / Twilio Programmable Messaging / Plivo candidates — **not** approved or integrated).
- Firebase Phone Auth / Twilio Verify are **not** `SmsSender` implementations (they own verification).

---

## Paths (proposed)

### `POST /v1/auth/phone/start`

Unauthenticated; rate-limited (durable IP + subject + global). TR-only Day-1 (**U10** proposal).

**200** uniform `PhoneOtpStartResponse` for well-formed requests (anti-enumeration). Never returns `otp_code`.  
**400** generic `invalid_request` (non-TR / malformed).  
**429** `otp_cooldown` / `rate_limited`.  
**503** `sms_unavailable` (uniform — no existence oracle).

### `POST /v1/auth/phone/verify`

**U7 Option A:** existing phone identity → sign in; unknown → create parent + phone identity (no silent cross-provider merge).  
Prefer **one DB transaction**: validate/consume challenge + identity resolve/create + session mint (`mintSessionTx` prerequisite — ADR-020 §8). JWT sign after commit.

**200** `TokenPairResponse` (LMP-33).  
**401** `otp_invalid` (uniform).  
**400** malformed / privacy-notice field issues when required for new subjects.  
**429** rate limited.

---

## Schemas (proposed)

### PhoneOtpStartRequest

```yaml
PhoneOtpStartRequest:
  type: object
  additionalProperties: false
  required: [phone]
  properties:
    phone: { type: string, minLength: 5, maxLength: 32 }
    country_code: { type: string, maxLength: 8 }
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
    privacy_notice_version:
      type: string
      maxLength: 64
      description: |
        Exact requiredness for new vs existing subjects is an Accept consistency
        item with U7/U12/U13 — notice ack ≠ optional-processing consent.
    client_surface: { type: string, maxLength: 32 }
    device_id: { $ref: '#/components/schemas/UuidV4OrV7' }
```

### AuthError extensions (U15 proposal)

Additive: `otp_invalid`, `otp_cooldown`, `sms_unavailable`.

---

## Proposed rate / abuse numbers (not enablement)

See ADR-020 §7: 5 attempts/challenge; 60s resend; 3 SMS/phone/15m; 10 SMS/phone/24h; 5 SMS/IP/15m; 30 SMS/IP/24h; 10 verify/IP/min; 500 SMS/day global planning candidate.

Prefer PostgreSQL durable counters.

---

## Out of scope Day-1

Provider link, phone change/recovery (**U18**), public fake OTP route (**U17**), real staging SMS (**U19**), non-TR numbers (**U10**), vendor SDKs/credentials, live OpenAPI phone paths, applied migrations.

---

## Prisma sketch (non-live)

```sql
-- After Accept only
CREATE TABLE otp_challenges (
  id uuid PRIMARY KEY,
  provider text NOT NULL,
  subject_key text NOT NULL,
  code_hash text NOT NULL,
  status text NOT NULL,          -- pending|consumed|expired|locked|superseded
  delivery_state text NOT NULL,  -- pending_send|sent|failed|superseded
  attempt_count integer NOT NULL DEFAULT 0,
  send_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  last_sent_at timestamptz,
  sealed_destination text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX otp_challenges_one_pending_per_subject
  ON otp_challenges (provider, subject_key) WHERE status = 'pending';

CREATE TABLE otp_delivery_attempts (
  id uuid PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES otp_challenges(id) ON DELETE CASCADE,
  adapter text NOT NULL,         -- fake|production (vendor name not required)
  result text NOT NULL,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE otp_abuse_counters (
  bucket_type text NOT NULL,     -- subject|ip|global
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL,
  send_count integer NOT NULL DEFAULT 0,
  verify_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_type, bucket_key, window_start)
);
```

Hash: `HMAC-SHA256(OTP_PEPPER, challenge_id || ":" || subject_key || ":" || code)`  
Subject: `hex(HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164))`
