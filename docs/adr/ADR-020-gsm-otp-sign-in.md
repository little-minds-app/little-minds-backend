# ADR-020 — GSM OTP sign-in (local fake provider + production adapter)

| Field | Value |
|---|---|
| **Status** | **Proposed** — awaiting explicit human **Accept** of remaining U-items; **not** Accepted |
| **Date** | 2026-10-28 (decision-alignment revision) |
| **Jira** | [LMP-34](https://little-minds-app.atlassian.net/browse/LMP-34) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-016`) |
| **Blueprint** | F-001, F-031 · §12 Auth · §13.1 / §29 · §31.1 / ADR-002 · §31.4 privacy · §27.4 local identity · §38 ownership |
| **Depends on** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) (**Accepted**) — sole session mint port |
| **Repos** | `little-minds-backend` only. After Accept, client ADR index sync in a **separate** client PR (**U20**) |
| **Companion sketch** | [`lmp-34-otp-api-contract-sketch.md`](./lmp-34-otp-api-contract-sketch.md) (non-live; OpenAPI stays **`0.4.0`** until implementation PR **`0.5.0`**) |

> **Decision gate:** Still **Proposed**. Human-selected architecture direction + **U7 Option A** are recorded below. **U1–U6 and U8–U20 remain proposals or deferrals until Accept.** Do **not** implement OTP runtime, choose/purchase a paid SMS vendor, merge-as-Done, or mark LMP-34 Done from this docs PR.

---

## 1. Context

LMP-34 requires GSM OTP sign-in with a local fake SMS sender, a vendor-neutral production delivery adapter interface, abuse controls, and integration with LMP-33 sessions.

**On `main` (LMP-33 @ `39b379b`):** `SessionIssuerService`, parent sessions, OpenAPI `0.4.0` (no phone routes), redaction of `otp`/`phone` keys.

**Blueprint §29:** E.164; cooldown; expiry; one-time use; rate limits; anti-enumeration; SMS spend ceilings; fake local SMS; interchangeable production adapter; never log OTP; never silent-merge by phone.

---

## 2. Mandatory architecture (human-selected direction)

Little Minds **owns** OTP generation, hashing, verification, challenge persistence, identity resolution, and session issuance.

**Not selected as V1 identity / OTP authority:** Firebase Phone Authentication, Twilio Verify, or any other hosted OTP verification system of record.

```text
Little Minds iOS / Android
          |
          v
NestJS IdentityModule
          |
          +-- PhoneOtpService
          |      |-- OTP generation / hashing / verification
          |      |-- Expiry / replay / rate limits / abuse
          |      |-- Parent identity resolution (U7 Option A)
          |      +-- SessionIssuerService (ADR-019)
          |
          v
      SmsSender  (delivery only)
          |-- FakeSmsSender                 (dev/test)
          |-- NetgsmSmsSender               (future candidate — not approved)
          |-- TwilioSmsSender               (future candidate — not approved)
          +-- PlivoSmsSender                (future candidate — not approved)
```

SMS adapters must **not** own: OTP generate/verify, parent accounts/identity mapping, access/refresh tokens, session lifecycle, or auth business rules.

Successful verify → **only** ADR-019 `SessionIssuerService` (no second session store).

---

## 3. LMP-33 vs LMP-34 ownership

| Concern | LMP-33 | LMP-34 | Later |
|---|---|---|---|
| Sessions, refresh, logout, guards, `/v1/parent/me` | ✅ | consumes | — |
| Dev bootstrap | ✅ | must not replace | — |
| Session mint | ✅ owns | must call (may need `mintSessionTx` — §8) | — |
| `POST /v1/auth/phone/start\|verify` | ❌ | ✅ | — |
| Fake / production `SmsSender` ports | ❌ | ✅ (fake now; production adapters gated) | vendor activate later |
| Apple / Google / email / provider link | ❌ | ❌ | LMP-35 |
| Phone change / recovery | ❌ | deferred (**U18**) | follow-up |
| Web cookies / admin MFA | ❌ | ❌ | LMP-38 / LMP-65 |

---

## 4. SMS provider strategy

### 4.1 Delivery-only adapters

| Environment | Sender | Status |
|---|---|---|
| development / test | `FakeSmsSender` | Required for local/CI — no paid SMS |
| staging | Real SMS | **Disabled** until separate approval (**U19**) |
| production | Approved delivery adapter | **Not selected / not integrated** in this ADR |

Fake requirements: deterministic; test-only OTP retrieval (**U17**); fail-closed if resolved in staging/production.

### 4.2 Future commercial candidates (not approved)

| Candidate | Role | Notes |
|---|---|---|
| **Netgsm** OTP SMS | Preferred *candidate* for Türkiye cost | **No** SDK, credentials, purchase, or contractual approval in this PR |
| **Twilio Programmable Messaging** | Global delivery candidate | Delivery-only |
| **Plivo Messaging** | Global delivery candidate | Delivery-only |
| Twilio **Verify** / Firebase Phone Auth | **Rejected** as SoR | Own verification flow — not interchangeable `SmsSender` |

### 4.3 Future country-aware routing (deferred)

Illustrative only — **not** active config and **not** implemented in this PR:

```text
+90 -> local Turkish delivery adapter (when approved)
+44 / +49 / +1 -> approved global delivery adapter (when approved)
```

Anticipate later: per-country config, capability differences, sender IDs, normalized delivery results, idempotency / duplicate-send prevention, cost visibility, circuit breakers, explicit fallback rules. Initial V1 may use a single environment-configured sender.

---

## 5. U7 — Human-selected: Option A (implicit parent registration)

**Status: SELECTED by Product Owner** (does **not** Accept the whole ADR).

On successful OTP verify:

1. Normalize phone to E.164 (TR-only Day-1 per proposed **U10**).
2. Resolve existing phone identity by privacy-safe `provider_subject`.
3. If an **active** parent owns the identity → authenticate that parent.
4. If no phone identity exists → **create** `parent_accounts` + phone `parent_identities`.
5. Issue session via ADR-019 session issuer.
6. **Never** silently merge across login methods (phone must not attach onto Apple/Google parents without explicit step-up link — LMP-35).
7. Prevent duplicate parents via unique `(provider, provider_subject)` + concurrency controls.
8. Respect lifecycle: no mint for soft-deleted / non-`active` parents.

### 5.1 Privacy notice (not optional-processing consent)

- Acknowledging a privacy **notice** (aydınlatma) is **not** the same as consenting to optional analytics/marketing.
- Record applicable notice version when legally/technically required for new account creation.
- Exact request field + persistence shape (**consistency with U12/U13**) remains an **open Accept item** — must be resolved before implementation, without inventing silent create with zero notice evidence if counsel requires notice-at-create.

---

## 6. Decision matrix U1–U20

| ID | Topic | Classification | Decision / proposal |
|---|---|---|---|
| **U7** | New parent | **SELECTED** | Option A — create parent + phone identity on first successful verify |
| **Arch** | OTP ownership / SMS role | **SELECTED** | LM-owned OTP; SMS delivery-only; no Firebase Phone Auth / Twilio Verify SoR |
| **U1** | OTP format | **Recommended proposal** | 6-digit numeric, CSPRNG |
| **U2** | OTP TTL | **Recommended proposal** | **300 seconds** absolute |
| **U3** | Supersede | **Recommended proposal** | One active pending challenge per subject; new issued challenge supersedes previous |
| **U4** | Resend cooldown | **Recommended proposal** | **60 seconds** |
| **U5** | Attempts / rate limits | **Recommended proposal** | Max **5** wrong attempts/challenge + IP/subject limits (see §7) |
| **U6** | SMS abuse / spend | **Recommended proposal** + **production gate** | Durable subject/IP/global limits; financial ceiling required before production SMS (price TBD) |
| **U8** | Provider subject | **Recommended proposal** | `HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164)` |
| **U9** | Verified contact | **Recommended proposal** | Null by default; short-lived sealed destination only if needed; no plaintext E.164 at rest |
| **U10** | Launch countries | **Recommended proposal** | Türkiye (**+90**) only for initial V1 |
| **U11** | Templates | **Recommended proposal** | Turkish initial SMS template; vendor-neutral rendering; EN optional later |
| **U12** | Anti-enumeration | **Recommended proposal** | Uniform existence-safe start/verify responses; cooldown/spend/`503` must not oracle |
| **U13** | Consume/mint txn | **Recommended proposal** + **impl prerequisite** | Prefer atomic consume + identity + session mint; see §8 (current code needs `mintSessionTx`) |
| **U14** | OpenAPI | **Recommended proposal** | Live **`0.5.0`** only in implementation PR |
| **U15** | Enums / errors | **Recommended proposal** | Explicit challenge/delivery states + generic `otp_invalid` / `otp_cooldown` / `sms_unavailable` |
| **U16** | Retention | **Recommended proposal** | Challenges purge **24h**; minimized delivery attempts purge **7 days** |
| **U17** | Fake OTP retrieval | **Recommended proposal** | Test harness/inbox only; inaccessible staging/production |
| **U18** | Phone change / recovery | **Deferred** | Out of LMP-34 Day-1 |
| **U19** | Staging real SMS | **Production / staging gate** | Disabled until separately approved |
| **U20** | Client ADR sync | **Deferred process** | Separate client PR after ADR Accept |
| **Vendor** | Netgsm / Twilio / Plivo | **Production gate** | Candidates only — not approved, purchased, or integrated |

---

## 7. Proposed numerical limits (not blanket-approved)

Documented for Accept review — **not** authorization to enable production SMS:

| Limit | Proposed value |
|---|---|
| Wrong OTP attempts / challenge | **5** then lock challenge |
| Resend cooldown | **60 s** |
| SMS / phone / 15 min | **3** |
| SMS / phone / 24 h | **10** |
| SMS / IP / 15 min | **5** |
| SMS / IP / 24 h | **30** |
| Verify requests / IP / min | **10** |
| Global production SMS / day (planning) | **500** candidate — **not** an enablement authorization |

### 7.1 Durable counters (preferred)

- Prefer **PostgreSQL atomic counters** (subject / IP / global buckets) so multi-replica Nest processes cannot bypass limits via in-memory state.
- No paid rate-limit SaaS required for V1.
- Use `clock_timestamp()` / date-window keys for bucket boundaries; document expiry of daily/15-minute windows.
- Financial spend ceilings remain **unresolved** until vendor unit prices and segmentation rules are confirmed (**U6** production gate).

---

## 8. U13 — Transaction feasibility vs ADR-019 code (inspected)

### 8.1 Desired verify flow

```text
Verify OTP
  → BEGIN
      lock / validate challenge (clock_timestamp after FOR UPDATE)
      resolve or create parent + phone identity (U7)
      consume challenge (single-winner UPDATE)
      mint session row (ADR-019 cap + FOR UPDATE parent)
  → COMMIT
  → sign access JWT (after commit)
```

If mint **fails**, desired policy: **roll back** OTP consume and any newly created parent/identity.

**Never hold DB locks while calling `SmsSender`.** Start = commit challenge then send (or outbox).

### 8.2 Actual `SessionIssuerService.mintSession` (main @ LMP-33)

Inspected `src/modules/identity/session/session-issuer.service.ts`:

- `mintSession` **always** opens its own `this.prisma.db.$transaction(...)`.
- It does **not** accept an external `Prisma.TransactionClient`.
- Inside the txn: `FOR UPDATE` on `parent_accounts`, active-session count, `parentSession.create`.
- Access JWT is signed **after** that transaction returns.
- Private helpers already exist that take `TxClient` for revoke/history paths — but **not** for mint.

**Feasibility today:** nesting phone-verify’s outer `$transaction` with `mintSession`’s inner `$transaction` is **not** a portable Prisma interactive-transaction pattern. Atomic consume+identity+session **cannot** be guaranteed by calling the public `mintSession` API as-is.

### 8.3 Implementation prerequisite (docs-only now — do not change session code in this PR)

1. Extract internal `mintSessionTx(tx, input)` performing the current mint **DB** work on a supplied `TransactionClient`.
2. Keep public `mintSession` as `$transaction(tx => mintSessionTx(tx, input))` then sign JWT (preserves bootstrap / other callers).
3. Phone verify uses one outer transaction calling `mintSessionTx`.
4. On `session_limit_exceeded` or other mint failure → whole txn rolls back (OTP remains usable until TTL/attempts).
5. Tests: Postgres concurrent verify; forced mint failure does not leave consumed OTP / orphan parent; unique identity race; lock ordering (challenge then parent); txn timeouts; SMS failures outside txn.

**Retry note:** clients may retry verify with the same code if the HTTP outcome is ambiguous **only while** the challenge is still pending (not consumed). After successful consume+commit, standard ADR-019 token handling applies.

---

## 9. OTP crypto & challenge rules (proposed)

| Control | Proposal |
|---|---|
| Code | 6-digit CSPRNG (**U1**) |
| Hash | `HMAC-SHA256(OTP_PEPPER, challenge_id \|\| ":" \|\| subject_key \|\| ":" \|\| code)` — binds challenge + subject (anti cross-challenge replay) |
| Subject | `hex(HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164))` (**U8**) |
| Peppers | Distinct from `REFRESH_TOKEN_PEPPER` |
| Delivery state | `pending_send` / `sent` / `failed` / `superseded` — start/resend must not invalidate a just-delivered code without cooldown/idempotency rules |
| Expiry checks | After row lock, use PostgreSQL `clock_timestamp()` |
| Attempts | Atomic increment on failed verify |

---

## 10. HTTP surface (Proposed; non-live)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/v1/auth/phone/start` | Rate-limited; returns `challenge_id`, proposed `expires_in=300`, `resend_after=60` |
| `POST` | `/v1/auth/phone/verify` | Consumes OTP; U7 Option A; returns LMP-33 `TokenPairResponse` |

Anti-enumeration (**U12**): uniform responses; no account-existence oracle via start/verify/cooldown/spend/`503`.

---

## 11. Persistence sketch (additive after Accept only)

Proposed tables (names illustrative): `otp_challenges`, `otp_delivery_attempts`, optional `otp_send_outbox`, durable `otp_abuse_counters`. No plaintext OTP/E.164 columns required. No migrations in this docs PR.

Retention (**U16** proposal): challenges **24h**; delivery attempts **7 days**; scheduled purge.

---

## 12. Env / secrets (proposed names)

| Key | Class | Notes |
|---|---|---|
| `SMS_SENDER` | Public | `fake` \| `production` |
| `OTP_PEPPER` | Secret | Code hashing |
| `PHONE_SUBJECT_PEPPER` | Secret | E.164 → subject |
| `OTP_DESTINATION_KEY` | Secret | Optional sealed destination |
| Budget thresholds | Config | Deny-on-unavailable in staging/prod when real send enabled |
| Vendor credentials | Secret | **None in this PR** |

---

## 13. Test plan (implementation PR after Accept)

Unit: E.164 TR allow/deny; hash binding; cooldown; attempts; adapter env matrix; budget deny.  
API: start→verify; wrong/expired/reused; anti-enum; U7 create vs sign-in.  
Postgres: concurrent verify; mint failure rollback; identity unique race; attempt races; lock-wait expiry.  
Security: fake sender fail-closed outside dev/test; no OTP/E.164 in logs; no public fake inbox.  
Regression: LMP-33 refresh/logout/bootstrap unchanged.

---

## 14. Alternatives considered

| Alternative | Why not |
|---|---|
| Firebase Phone Auth / Twilio Verify as SoR | Human-rejected; couples verification to vendor |
| Choosing/purchasing Netgsm/Twilio/Plivo now | Explicitly gated — delivery candidates only |
| Process-only SMS rate limits | Bypassable under multi-replica |
| Calling public `mintSession` inside outer txn without refactor | Not transactional with Prisma interactive txns |
| Silent merge by phone onto other providers | Forbidden |

---

## 15. Implementation plan (after Accept only)

1. Explicit human Accept of remaining proposals / gates (or documented deferrals).
2. Separate LMP-34 **implementation** PR: migrations, PhoneOtpService, FakeSmsSender, `mintSessionTx` prerequisite, routes, OpenAPI `0.5.0`, durable counters, tests — still no paid vendor unless separately approved.
3. Client ADR index sync (**U20**).
4. No Jira Done from this docs PR.

---

## 16. Consequences

**Positive:** Clear LM-owned OTP boundary; human-selected U7 Option A; vendor-neutral delivery port; U13 prerequisite documented from real code inspection; numeric proposals explicit for Accept.

**Negative / follow-ups:** Most numeric/security params still need Accept; `mintSessionTx` refactor required before atomic verify; SIM-swap/phone-change deferred; production SMS financially gated; privacy-notice request semantics for new parents still need final consistency wording on Accept.
