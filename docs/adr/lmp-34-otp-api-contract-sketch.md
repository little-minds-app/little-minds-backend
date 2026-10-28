# LMP-34 — GSM OTP API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Sketch only — **not** published in `contracts/openapi.yaml` until ADR-020 is **Accepted** and the **implementation** PR bumps OpenAPI (proposed **`0.5.0`** — **U14**). This docs PR does **not** change live **`0.4.0`**. |
| **Parent ADR** | [ADR-020](./ADR-020-gsm-otp-sign-in.md) |
| **Jira** | LMP-34 |
| **Depends** | Reuses LMP-33 `TokenPairResponse` / `AuthError` shapes from live `0.4.0` |

> Field names, enums, and HTTP status choices below are **illustrative**. Numeric cooldowns/TTLs and anti-enumeration status policy are **Unresolved** in ADR-020 (U1–U6, U12, U15). Do not treat this sketch as authority to invent those defaults in code.

---

## Security scheme

Reuse LMP-33 `parentAccessToken` for post-login calls. Phone start/verify are **unauthenticated** (rate-limited).

---

## Paths (proposed)

### `POST /v1/auth/phone/start`

```yaml
/v1/auth/phone/start:
  post:
    operationId: startPhoneOtp
    summary: Request a GSM OTP challenge (rate-limited)
    tags: [Auth]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/PhoneOtpStartRequest'
    responses:
      '200':
        description: |
          Challenge accepted for delivery attempt. Anti-enumeration policy (always-200 vs
          differentiated errors) is Unresolved U12 — do not invent in implementation.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PhoneOtpStartResponse'
      '400':
        $ref: '#/components/responses/AuthError'
      '429':
        $ref: '#/components/responses/AuthError'
      '503':
        description: SMS adapter unavailable / circuit open
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthError'
```

### `POST /v1/auth/phone/verify`

```yaml
/v1/auth/phone/verify:
  post:
    operationId: verifyPhoneOtp
    summary: Verify GSM OTP and mint parent session via SessionIssuer
    tags: [Auth]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/PhoneOtpVerifyRequest'
    responses:
      '200':
        description: OTP consumed; returns LMP-33 token pair
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TokenPairResponse'
      '400':
        $ref: '#/components/responses/AuthError'
      '401':
        description: Invalid / expired / consumed / locked OTP (generic)
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthError'
      '403':
        description: session_limit_exceeded from mint (ADR-019)
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthError'
      '429':
        $ref: '#/components/responses/AuthError'
```

---

## Schemas (proposed)

### PhoneOtpStartRequest

```yaml
PhoneOtpStartRequest:
  type: object
  additionalProperties: false
  required: [phone]
  properties:
    phone:
      type: string
      description: |
        National or E.164 input; server re-normalizes. Exact dial-code field split
        (phone vs country_code) may be refined on Accept.
      minLength: 5
      maxLength: 32
    country_code:
      type: string
      description: Optional ISO/dial hint; server must not trust without normalization
      maxLength: 8
    client_surface:
      type: string
      description: Coarse surface (ios|android|web) — not a fingerprint
      maxLength: 32
    device_id:
      $ref: '#/components/schemas/UuidV4OrV7'
```

### PhoneOtpStartResponse

```yaml
PhoneOtpStartResponse:
  type: object
  additionalProperties: false
  required: [challenge_id]
  properties:
    challenge_id:
      $ref: '#/components/schemas/UuidV4OrV7'
    expires_in:
      type: integer
      description: Seconds until OTP expiry — value from Accept U2; omit until set
      minimum: 1
    resend_after:
      type: integer
      description: Seconds until resend allowed — value from Accept U4; omit until set
      minimum: 0
    # NEVER include otp_code in staging/production schemas.
```

### PhoneOtpVerifyRequest

```yaml
PhoneOtpVerifyRequest:
  type: object
  additionalProperties: false
  required: [challenge_id, code]
  properties:
    challenge_id:
      $ref: '#/components/schemas/UuidV4OrV7'
    code:
      type: string
      description: User-entered OTP — never log; length from Accept U1
      minLength: 4
      maxLength: 16
    client_surface:
      type: string
      maxLength: 32
    device_id:
      $ref: '#/components/schemas/UuidV4OrV7'
```

### AuthError extensions (proposed — U15)

Extend live LMP-33 `AuthError.error` enum **additively** in the implementation PR:

```text
otp_invalid
otp_cooldown
sms_unavailable
```

Retain existing: `invalid_request`, `invalid_token`, `expired_token`, `revoked_session`, `refresh_reuse`, `rate_limited`, `session_limit_exceeded`, `bootstrap_disabled`, `database_unavailable`.

---

## Out of scope paths (not in LMP-34 Day-1 sketch)

| Path | Owner |
|---|---|
| `POST /v1/auth/identities/link` | LMP-35 / recovery follow-up (ADR-020 U18) |
| `POST /v1/parents/register` | Only if Accept picks explicit register (**U7-B**) |
| Apple / Google / email OTP | LMP-35 |
| Dev OTP echo endpoint | Test-only if Accept picks **U17**; never in published staging/production contract |

---

## Prisma migration sketch (non-live)

Illustrative only — column nullability/enums await Accept (U8, U15, U16):

```sql
-- proposed additive migration after ADR-020 Accept
CREATE TABLE otp_challenges (
  id              uuid PRIMARY KEY,
  provider        text NOT NULL,
  subject_key     text NOT NULL,
  code_hash       text NOT NULL,
  status          text NOT NULL,
  attempt_count   integer NOT NULL DEFAULT 0,
  send_count      integer NOT NULL DEFAULT 0,
  expires_at      timestamptz NOT NULL,
  consumed_at     timestamptz,
  last_sent_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX otp_challenges_subject_status_idx
  ON otp_challenges (provider, subject_key, status, expires_at);

CREATE TABLE otp_delivery_attempts (
  id                   uuid PRIMARY KEY,
  challenge_id         uuid NOT NULL REFERENCES otp_challenges(id) ON DELETE CASCADE,
  adapter              text NOT NULL,
  result               text NOT NULL,
  provider_message_id  text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX otp_delivery_attempts_challenge_idx
  ON otp_delivery_attempts (challenge_id);
```

No plaintext OTP column. No phone PK on `parent_accounts`.
