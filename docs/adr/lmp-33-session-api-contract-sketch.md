# LMP-33 — Session API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Sketch only — **not** published in `contracts/openapi.yaml` until ADR-019 is **Accepted** and the **implementation** PR bumps OpenAPI to **`0.4.0`**. This docs PR does **not** change live `0.3.0`. |
| **Parent ADR** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) |
| **Jira** | LMP-33 |

---

## Security scheme

```yaml
components:
  securitySchemes:
    parentAccessToken:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        Parent access JWT (Ed25519 / EdDSA, token_use=access, aud=little-minds-parent,
        TTL 900s). Server always loads parent_sessions by sid so revoke is immediate.
```

---

## Shared schemas

### TokenPairResponse

```yaml
TokenPairResponse:
  type: object
  additionalProperties: false
  required: [access_token, refresh_token, token_type, expires_in, session_id, parent_id]
  properties:
    access_token:
      type: string
      description: JWT access token — never log
    refresh_token:
      type: string
      description: Opaque refresh token — never log; secure client storage only
    token_type:
      type: string
      enum: [Bearer]
    expires_in:
      type: integer
      enum: [900]
      description: Access TTL seconds (15 minutes)
    session_id:
      $ref: '#/components/schemas/UuidV4OrV7'
    parent_id:
      $ref: '#/components/schemas/UuidV4OrV7'
```

### LogoutAllResponse

```yaml
LogoutAllResponse:
  type: object
  additionalProperties: false
  required: [revoked_session_count]
  properties:
    revoked_session_count:
      type: integer
      minimum: 0
      description: Sessions transitioned to revoked in this call
```

### AuthError

```yaml
AuthError:
  type: object
  additionalProperties: false
  required: [error, message]
  properties:
    error:
      type: string
      enum:
        - invalid_request
        - invalid_token
        - expired_token
        - revoked_session
        - refresh_reuse
        - rate_limited
        - session_limit_exceeded
        - bootstrap_disabled
    message:
      type: string
      description: Safe message — no tokens, credentials, or parent/child PII
```

### ParentSessionSummary

```yaml
ParentSessionSummary:
  type: object
  additionalProperties: false
  required: [session_id, created_at, expires_at, revoked]
  properties:
    session_id:
      $ref: '#/components/schemas/UuidV4OrV7'
    created_at:
      type: string
      format: date-time
    last_refreshed_at:
      type: string
      format: date-time
      nullable: true
    expires_at:
      type: string
      format: date-time
    revoked:
      type: boolean
    client_surface:
      type: string
      enum: [ios, android, web, unknown]
      nullable: true
    device_id:
      $ref: '#/components/schemas/UuidV4OrV7'
      nullable: true
    user_agent_summary:
      type: string
      nullable: true
      maxLength: 128
```

### ParentMeResponse

```yaml
ParentMeResponse:
  type: object
  additionalProperties: false
  required: [parent_id, locale, timezone, lifecycle]
  properties:
    parent_id:
      $ref: '#/components/schemas/UuidV4OrV7'
    locale:
      type: string
    timezone:
      type: string
    lifecycle:
      type: string
      enum: [active, pending_deletion, deleted]
```

---

## Paths

### `POST /v1/auth/token/refresh`

- **Auth:** none (refresh token in body)
- **Body:** `{ "refresh_token": string }`
- **200:** `TokenPairResponse`
- **400:** `invalid_request`
- **401:** `invalid_token` | `expired_token` | `revoked_session` | `refresh_reuse`
- **429:** `rate_limited` (30/min/IP and 10/min/session; multi-instance best-effort — see ADR-019 §9.2)
- **Semantics:** transactional single-winner rotation; bounded hash history for reuse (ADR-019 §4.2–4.4). **Clients must not retry a consumed refresh token.**

### `POST /v1/auth/logout`

- **Auth:** optional Bearer; **Body:** `{ "refresh_token"?: string }` — at least one of Bearer or refresh required
- **204:** empty (idempotent)
- **400 / 401:** as above

### `POST /v1/auth/logout-all`

- **Auth:** Bearer required
- **200:** `LogoutAllResponse` `{ "revoked_session_count": N }` — **not** 204
- **401:** invalid/expired access

### `GET /v1/auth/sessions`

- **Auth:** Bearer
- **200:** `{ "sessions": ParentSessionSummary[] }`
- **401:** …

### `DELETE /v1/auth/sessions/{sessionId}`

- **Auth:** Bearer
- **204:** revoked (idempotent if already revoked and owned)
- **404:** unknown or not owned
- **401:** …

### `GET /v1/parent/me`

- **Auth:** Bearer
- **200:** `ParentMeResponse`
- **401:** …

### Ownership checks

**No public path.** Ownership is enforced by internal Nest guards/helpers and covered by automated tests (ADR-019 §6.1). Do not add `/v1/auth/ownership-check` to the live OpenAPI contract.

### `POST /v1/auth/dev/session` (local / automated test only)

- **Auth:** none
- **Gates (all required):**
  - `APP_ENV ∈ {development, test}`
  - `AUTH_DEV_BOOTSTRAP_ENABLED=true`
  - `parent_id` ∈ configured **allowlist** (default: seed parent only) — **no arbitrary impersonation**
  - Loopback / non-shared reachability policy per ADR-019 §8
- **Hard fail** when `APP_ENV` is `staging` or `production`
- **Body:** `{ "parent_id": UuidV4OrV7, "client_surface"?: …, "device_id"?: Uuid }`
- **200:** `TokenPairResponse`
- **403:** `bootstrap_disabled` | `session_limit_exceeded`
- **404:** parent not on allowlist / not found (anti-enumeration-friendly)
- **429:** stricter bootstrap limit (**5/min/IP**)

---

## Out of scope paths (LMP-34+)

```text
POST /v1/auth/phone/start
POST /v1/auth/phone/verify
POST /v1/auth/identities/link
```

These call the shared SessionIssuer from LMP-33 after identity verification.

---

## Client notes (normative with ADR-019)

1. Store refresh tokens only in platform secure storage; never logs/analytics/crash payloads.
2. **Single-flight refresh:** one in-flight refresh; coalesce waiters on that promise.
3. On `200`, persist the new token pair **atomically**, then drop the old refresh token.
4. On API `401` with access token, attempt **one** single-flight refresh **only if** a refresh token is still believed unused.
5. **Do not** resubmit a refresh token after success, after `401`/`refresh_reuse`, or when the HTTP outcome is **unknown** (timeout after send). **Lost-response recovery = clear local session and re-authenticate** (LMP-34). Retrying a consumed refresh token can revoke the session via reuse detection.
6. On `403 session_limit_exceeded`, logout an existing session or call logout-all before minting again.
7. Web cookie wrapping is LMP-38; same bearer/refresh semantics underneath.
