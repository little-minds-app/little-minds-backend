# LMP-33 — Session API contract sketch (non-normative)

| Field | Value |
|---|---|
| **Status** | Sketch only — **not** published in `contracts/openapi.yaml` until ADR-019 is **Accepted** and an implementation PR bumps OpenAPI (proposed `0.4.0`) |
| **Parent ADR** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) |
| **Jira** | LMP-33 |

This document exists so reviewers can evaluate exact paths and schemas without changing the live client contract pin.

---

## Security scheme

```yaml
components:
  securitySchemes:
    parentAccessToken:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Parent access JWT (token_use=access, aud=little-minds-parent)
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
      description: Opaque refresh token — never log; store only in secure client storage
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
        - refresh_conflict
        - rate_limited
        - bootstrap_disabled
    message:
      type: string
      description: Safe, non-enumerating message (no token/PII)
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
- **400:** `AuthError` `invalid_request`
- **401:** `invalid_token` | `expired_token` | `revoked_session` | `refresh_reuse`
- **409:** `refresh_conflict` (if ADR U5 accepted)
- **429:** `rate_limited`

### `POST /v1/auth/logout`

- **Auth:** optional Bearer; **Body:** `{ "refresh_token"?: string }` — at least one of Bearer or refresh required
- **204:** empty
- **400 / 401:** as above

### `POST /v1/auth/logout-all`

- **Auth:** Bearer required
- **200:** `{ "revoked_session_count": integer }` **or** **204** (ADR recommends including count)
- **401:** invalid/expired access

### `GET /v1/auth/sessions`

- **Auth:** Bearer
- **200:** `{ "sessions": ParentSessionSummary[] }`
- **401:** …

### `DELETE /v1/auth/sessions/{sessionId}`

- **Auth:** Bearer
- **204:** revoked (idempotent if already revoked **and** owned)
- **404:** unknown or not owned
- **401:** …

### `GET /v1/parent/me`

- **Auth:** Bearer
- **200:** `ParentMeResponse`
- **401:** …

### `POST /v1/auth/ownership-check` (recommended test/authorization helper)

- **Auth:** Bearer
- **Body:** `{ "child_id": UuidV4OrV7 }`
- **200:** `{ "owned": true, "child_id": "…" }`
- **404:** not owned / missing (same response shape omitted — empty 404 body)
- **401:** …

### `POST /v1/auth/dev/session` (development/test only)

- **Auth:** none
- **Gate:** server rejects unless `APP_ENV` ∈ {development, test} ∧ `AUTH_DEV_BOOTSTRAP_ENABLED=true`
- **Body:** `{ "parent_id": UuidV4OrV7, "client_surface"?: "ios"|"android"|"web"|"unknown", "device_id"?: Uuid }`
- **200:** `TokenPairResponse`
- **403 / 404:** `bootstrap_disabled` or unknown parent
- **Must never succeed** when `APP_ENV` is staging or production

---

## Out of scope paths (LMP-34+)

```text
POST /v1/auth/phone/start
POST /v1/auth/phone/verify
POST /v1/auth/identities/link
```

These establish or link identity and then call the shared SessionIssuer from LMP-33.

---

## Client notes (non-normative)

1. Persist refresh token in platform secure storage; never logs/analytics.
2. On `401` from API with access token, attempt **one** refresh; if refresh fails, return to sign-in.
3. On `409 refresh_conflict`, retry refresh once after short jitter **only if** the client still holds the pre-conflict refresh token and did not already store a newer pair.
4. Web cookie wrapping is LMP-38; same bearer/refresh semantics underneath.
