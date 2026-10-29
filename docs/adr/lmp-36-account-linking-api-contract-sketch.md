# LMP-36 — Account linking API contract sketch

> Live OpenAPI **`0.7.1`**. Normative for linking core per ADR-022. Unlink / recovery routes are **not** published.

## `POST /v1/auth/identities/step-up`

**Auth:** Bearer. Prove control of an identity **already linked** to this parent (same proof shapes as sign-in for that provider). Returns `{ step_up_token, expires_in: 300, purpose: identity_link }`. Bound to parent + session + purpose; single-use; hashed at rest. Access-token refresh alone does **not** issue step-up.

## `POST /v1/auth/identities/link`

**Auth:** Bearer parent access JWT (ADR-019 guard — session row always loaded).

**Required:** `step_up_token` (consume atomically) **and** a **fresh** verified proof for the **target** provider to link:

| Provider | Proof |
|---|---|
| `apple` | `id_token` + server `nonce` (mandatory) |
| `google` | Nonce ID-token **or** auth-code + PKCE + `oauth_state` (same as sign-in) |
| `email` | `challenge_id` + 6-digit `code` (deliveryState=sent gate) |
| `phone` | `challenge_id` + 6-digit `code` (deliveryState=sent gate) |

**Forbidden:** client-supplied `sub` / email / phone / name as identity without successful verify; silent merge across parents.

### 200 response

```json
{
  "parent_id": "<uuid>",
  "provider": "apple",
  "identity_id": "<uuid>",
  "linked_at": "2026-10-29T00:00:00.000Z",
  "already_linked": false
}
```

### Errors

| HTTP | `error` | When |
|---|---|---|
| 400 | `invalid_request` | Malformed body / unknown provider |
| 401 | `invalid_token` / `otp_invalid` | Bad session or bad provider proof |
| 409 | `identity_collision` | Cases C / D / E — no other-parent disclosure |
| 429 | `rate_limited` | Link IP / parent limits |

## Not published (deferred)

- `DELETE /v1/auth/identities/{id}` unlink
- Recovery case create/resolve APIs
- Admin recovery console
