# Privacy notice catalog (LMP-34 / ADR-020 Option A)

## Status

**Engineering placeholder.** The active `notice_version` / `notice_locale` pair used by
`POST /v1/auth/phone/start` is **server-owned** and required uniformly for all callers
(KVKK notice Option A). It is **not** a published legal aydınlatma text and **must not**
be treated as counsel-approved copy.

| Field | Current engineering value | Published? |
|---|---|---|
| `notice_version` | `v1-tr-2026-10` | **No** |
| `notice_locale` | `tr-TR` | **No** |

Source of truth in code: `src/modules/identity/otp/privacy-notice.catalog.ts`.

## Environment gate (fail-closed)

| `APP_ENV` | Unpublished engineering fixture allowed? |
|---|---|
| `development` / local CI (`NODE_ENV=test`) | **Yes** — synthetic fixtures only |
| `staging` | **No** — boot fails until **some** catalog entry is `published: true` |
| `production` | **No** — boot fails until **some** catalog entry is `published: true` |

`validateEnv` enforces the boot gate. Staging/production **cannot be activated** on a
catalog with zero published entries.

### Per-pair acceptance (Option A)

Start accepts only an **exact** `notice_version` + `notice_locale` present in the
server catalog (anti-enumeration). In staging/production, **that same entry** must
have `published: true`. Another published catalog row does **not** authorize an
unpublished pair. Local/CI may still use unpublished engineering fixtures.

Flipping `published: true` without qualified legal review is forbidden.

## Legal blocker (production / staging personal data)

Before enabling real-user personal-data processing for phone OTP sign-in:

1. Qualified legal review of notice **wording**, purposes, and lawful bases.
2. Explicit publication of an active catalog pair (`published: true` in code/config).
3. Client UI must present that published notice **before** phone submit.
4. Optional consent / ToS remain separate (ADR-020 §6) — out of LMP-34 Day-1.

Accept of ADR-020 and this engineering catalog **do not** replace counsel sign-off.

## Option A binding (unchanged)

- Start requires catalog-matching `notice_version` + `notice_locale`.
- Verify has **no** privacy fields.
- Invalid/missing notice → uniform `400 invalid_request` (anti-enumeration).
- Opaque presentation tokens / notice-token endpoints remain **future only**.

## Do not

- Invent or paste legal text into the API or this repo as if final.
- Bundle marketing/analytics consent into OTP auth.
- Treat client-submitted versions as authoritative outside the server catalog.
- Boot staging/production against an unpublished placeholder.
