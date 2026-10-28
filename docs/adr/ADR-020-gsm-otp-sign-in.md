# ADR-020 — GSM OTP sign-in (local fake provider + production adapter)

| Field | Value |
|---|---|
| **Status** | **Proposed** — awaiting explicit human **Accept**; selected arch + U7 Option A preserved; privacy design is **recommended** (not Accepted) |
| **Date** | 2026-10-28 (privacy-alignment revision) |
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

### 5.1 Privacy pointer

Notice ≠ ToS ≠ optional consent. Full recommended KVKK engineering design: **§6**. Verify must **not** take a client field that differs for new vs existing parents (**U12**).

---

## 6. Recommended KVKK / privacy design (awaiting Accept + legal review)

**Classification:** **Recommended proposal** for human Accept — **not** settled law and **not** blanket ADR Accept. Final notice wording, lawful bases, and production enablement require **qualified legal review** before launch. Primary reference themes (do not copy legal text): KVKK aydınlatma obligations / notice procedures; Kurul principle that **aydınlatma** and **açık rıza** texts must be arranged separately (public announcements on kvkk.gov.tr).

### 6.1 Fundamental separation

| Concept | Role in phone auth | Must not be confused with |
|---|---|---|
| Privacy **notice** (aydınlatma) | Transparency about processing of the phone number / account | Explicit consent |
| **Terms of Service** | Contractual acceptance where legally required | Notice or optional consent |
| **Optional consent** (açık rıza) | Marketing / non-essential analytics / profiling **only if** required | Mandatory login checkbox |

- Do **not** bundle optional marketing/analytics/profiling consent into authentication.
- Do **not** represent notice presentation as “I consent to all processing.”
- Do **not** store `accepted_privacy=true` as a substitute for versioned notice evidence.
- Lawful basis per purpose is a **legal** determination — engineering records evidence; counsel sets bases.

### 6.2 Timing (recommended mobile sequence)

Notice must be accessible **before or at** phone collection — **not** only after OTP verify.

```text
1. Phone-entry screen
2. Concise contextual privacy info + prominent full-notice link
3. Parent may open/review full notice
4. Submit phone → POST /v1/auth/phone/start  (binds server notice evidence)
5. Enter OTP → POST /v1/auth/phone/verify   (uniform; no notice field)
6. U7: sign-in existing OR create parent + phone identity
7. Session via ADR-019 SessionIssuer
```

### 6.3 Server-owned notice catalog & presentation evidence

- Server owns the **active notice catalog** (version, locale, published status). Clients **must not** invent authoritative versions.
- **Uniform** for all callers (existing and new): start binds presentation evidence into the **challenge** using a server-validated mechanism (preferred below).
- Minimized evidence fields (illustrative): `notice_version`, `notice_locale`, `presented_at` (server clock), `presentation_surface`, optional `challenge_id`; `parent_id` only **after** parent exists (on create/sign-in association) — avoid pre-auth durable PII linkage beyond challenge retention (**U16**).
- Recording an HTTP 200 alone does **not** prove the UI rendered the notice. Responsibilities:
  - **Client:** show contextual notice + link; only call start after the notice UX for that surface was presented; send only server-issued presentation material (see §6.4).
  - **Server:** validate presentation material against catalog; refuse start with **uniform** `400 invalid_request` if missing/invalid/expired; persist binding on challenge; on U7 create, copy evidence into `privacy_notice_acknowledgments` (or equivalent) in the **same** verify transaction as identity+mint.

### 6.4 Preferred start/verify binding (fixes `privacy_notice_version` ambiguity)

**Rejected:** conditional `privacy_notice_version` on **verify** required only for unknown parents — forces client account-existence branching, risks **U12** oracle, conflates notice with consent, and is redundant if notice was already presented at start.

**Recommended (uniform contract):**

1. App obtains **active** notice metadata from server-owned catalog (existing Blueprint-oriented privacy routes when published, or build-time pinned version **plus** server validation — Accept may pick). Prefer not adding a new endpoint unless catalog access is otherwise missing.
2. `POST /v1/auth/phone/start` includes a **uniform** `notice_presentation` object for **every** caller, e.g. either:
   - `notice_version` + `notice_locale` that must equal the server’s **currently active** published pair, **or**
   - a short-lived opaque **`notice_presentation_token`** minted by the server when the notice was served (`HMAC`/`AEAD` over `notice_version|locale|nonce|exp`, dedicated pepper; single-use or challenge-bound; TTL short).
3. Server validates presentation → stores `notice_version` / `locale` / `presented_at` / `surface` on `otp_challenges`.
4. `POST /v1/auth/phone/verify` body is **only** `challenge_id` + `code` (+ optional device/surface). **No** privacy fields. No new vs existing branching in the client contract.
5. On verify success:
   - **Existing parent:** mint session; optionally record a minimized “notice still current” association if policy requires version-update awareness — **must not** become a consent gate or block login solely for notice refresh without a separate product/legal policy.
   - **New parent (U7):** create parent + phone identity + notice-presentation evidence row + session mint in one txn (**U13** / `mintSessionTx`).

**Security properties of presentation token (if used):** integrity + expiry; not forgeable without pepper; does not encode whether a phone is registered; validation failures are generic; not logged in raw form.

### 6.5 Existing parents

Sign-in must **not** force a new registration flow or unnecessary repeated “consent.” If the published notice version changes, define a **version-update presentation** policy later — notice remains transparency, not an optional-consent gate.

### 6.6 Optional consent (out of LMP-34)

Marketing / non-essential analytics / similar purposes needing açık rıza: separate, purpose-specific, not preselected, versioned evidence, withdrawable, **not** bundled with auth. **Do not** implement inside LMP-34 unless separately authorized.

### 6.7 Child data / guardianship

Phone OTP verifies control of a number and (under U7) may create a **parent account**. It does **not** by itself establish legal guardianship or authorize every category of child-data processing. Child-profile creation needs a **separately reviewed** privacy/authorization flow (outside LMP-34 implementation scope; prerequisite for child features).

---

## 7. Decision matrix U1–U20 (+ privacy)

| ID | Topic | Classification | Decision / proposal |
|---|---|---|---|
| **U7** | New parent | **SELECTED** | Option A — create parent + phone identity on first successful verify |
| **Arch** | OTP ownership / SMS role | **SELECTED** | LM-owned OTP; SMS delivery-only; no Firebase Phone Auth / Twilio Verify SoR |
| **Privacy** | KVKK notice design (§6) | **Recommended proposal** | Notice≠ToS≠optional consent; present before/at phone collect; server catalog; challenge-bound evidence; uniform verify |
| **U1** | OTP format | **Recommended proposal** | 6-digit numeric, CSPRNG |
| **U2** | OTP TTL | **Recommended proposal** | **300 seconds** absolute |
| **U3** | Supersede | **Recommended proposal** | One active pending challenge per subject; new issued challenge supersedes previous |
| **U4** | Resend cooldown | **Recommended proposal** | **60 seconds** |
| **U5** | Attempts / rate limits | **Recommended proposal** | Max **5** wrong attempts/challenge + IP/subject limits (see §8) |
| **U6** | SMS abuse / spend | **Recommended proposal** + **production gate** | Durable subject/IP/global limits; financial ceiling required before production SMS (price TBD) |
| **U8** | Provider subject | **Recommended proposal** | `HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164)` |
| **U9** | Verified contact | **Recommended proposal** | Null by default; short-lived sealed destination only if needed; no plaintext E.164 at rest |
| **U10** | Launch countries | **Recommended proposal** | Türkiye (**+90**) only for initial V1 |
| **U11** | Templates | **Recommended proposal** | Turkish initial SMS template; vendor-neutral rendering; EN optional later |
| **U12** | Anti-enumeration | **Recommended proposal** | Uniform start/verify contracts; no account-existence oracle (incl. privacy fields); see §10 |
| **U13** | Consume/mint txn | **Recommended proposal** + **impl prerequisite** | Atomic consume + identity + notice evidence + session via `mintSessionTx`; see §9–§10 |
| **U14** | OpenAPI | **Recommended proposal** | Live **`0.5.0`** only in implementation PR |
| **U15** | Enums / errors | **Recommended proposal** | Explicit challenge/delivery states + generic `otp_invalid` / `otp_cooldown` / `sms_unavailable` |
| **U16** | Retention | **Recommended proposal** | Challenges purge **24h**; minimized delivery attempts purge **7 days** |
| **U17** | Fake OTP retrieval | **Recommended proposal** | Test harness/inbox only; inaccessible staging/production |
| **U18** | Phone change / recovery | **Deferred** | Out of LMP-34 Day-1 |
| **U19** | Staging real SMS | **Production / staging gate** | Disabled until separately approved |
| **U20** | Client ADR sync | **Deferred process** | Separate client PR after ADR Accept |
| **Vendor** | Netgsm / Twilio / Plivo | **Production gate** | Candidates only — not approved, purchased, or integrated |

---

## 8. Proposed numerical limits (not blanket-approved)

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

### 8.1 Durable counters (preferred)

- Prefer **PostgreSQL atomic counters** (subject / IP / global buckets) so multi-replica Nest processes cannot bypass limits via in-memory state.
- No paid rate-limit SaaS required for V1.
- Use `clock_timestamp()` / date-window keys for bucket boundaries; document expiry of daily/15-minute windows.
- Financial spend ceilings remain **unresolved** until vendor unit prices and segmentation rules are confirmed (**U6** production gate).

---

## 9. U13 — Transaction feasibility vs ADR-019 code (inspected)

### 9.1 Desired verify flow

```text
Verify OTP
  → BEGIN
      lock / validate challenge (clock_timestamp after FOR UPDATE)
      resolve or create parent + phone identity (U7)
      attach notice-presentation evidence from challenge (new parents; §6)
      consume challenge (single-winner UPDATE)
      mint session row via mintSessionTx (ADR-019 cap + FOR UPDATE parent)
  → COMMIT
  → sign access JWT (after commit)
```

If mint **fails**, desired policy: **roll back** OTP consume, newly created parent/identity, **and** notice-evidence rows written in that txn.

**Never hold DB locks while calling `SmsSender`.** Start = commit challenge (with notice binding) then send (or outbox).

### 9.2 Actual `SessionIssuerService.mintSession` (main @ LMP-33)

Inspected `src/modules/identity/session/session-issuer.service.ts`:

- `mintSession` **always** opens its own `this.prisma.db.$transaction(...)`.
- It does **not** accept an external `Prisma.TransactionClient`.
- Inside the txn: `FOR UPDATE` on `parent_accounts`, active-session count, `parentSession.create`.
- Access JWT is signed **after** that transaction returns.
- Private helpers already exist that take `TxClient` for revoke/history paths — but **not** for mint.

**Feasibility today:** nesting phone-verify’s outer `$transaction` with `mintSession`’s inner `$transaction` is **not** a portable Prisma interactive-transaction pattern. Atomic consume+identity+notice+session **cannot** be guaranteed by calling the public `mintSession` API as-is.

### 9.3 Implementation prerequisite (docs-only now — do not change session code in this PR)

1. Extract internal `mintSessionTx(tx, input)` performing the current mint **DB** work on a supplied `TransactionClient`.
2. Keep public `mintSession` as `$transaction(tx => mintSessionTx(tx, input))` then sign JWT (preserves bootstrap / other callers).
3. Phone verify uses one outer transaction calling `mintSessionTx`.
4. On `session_limit_exceeded` or other mint failure → whole txn rolls back (OTP remains usable until TTL/attempts).
5. Tests: Postgres concurrent verify; forced mint failure does not leave consumed OTP / orphan parent / orphan notice row; unique identity race; lock ordering (challenge then parent); txn timeouts; SMS failures outside txn.

**Retry note:** clients may retry verify with the same code if the HTTP outcome is ambiguous **only while** the challenge is still pending (not consumed). After successful consume+commit, standard ADR-019 token handling applies.

---

## 10. U7 / U12 / U13 consistency

| Concern | Coherent behavior |
|---|---|
| **U7** | First successful verify for unknown phone subject creates parent + phone identity |
| **U12** | Start and verify request/response shapes are **identical** for existing vs new; no client “am I new?” branch; no privacy field required only for unknowns; generic auth errors; do not leak lifecycle beyond Accept-approved generics |
| **U13** | Single DB txn: challenge validate/consume + U7 resolve/create + notice evidence attach + `mintSessionTx`; rollback-all on mint failure; session cap still enforced; concurrent verify single-winner; SMS outside locks |
| **Notice** | Bound at **start** into challenge (§6.4); verify reads challenge metadata — no verify-time `privacy_notice_version` |

---

## 11. OTP crypto & challenge rules (proposed)

| Control | Proposal |
|---|---|
| Code | 6-digit CSPRNG (**U1**) |
| Hash | `HMAC-SHA256(OTP_PEPPER, challenge_id \|\| ":" \|\| subject_key \|\| ":" \|\| code)` — binds challenge + subject (anti cross-challenge replay) |
| Subject | `hex(HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164))` (**U8**) |
| Peppers | Distinct from `REFRESH_TOKEN_PEPPER`; optional `NOTICE_PRESENTATION_PEPPER` for presentation tokens |
| Delivery state | `pending_send` / `sent` / `failed` / `superseded` — start/resend must not invalidate a just-delivered code without cooldown/idempotency rules |
| Notice binding | Challenge stores server-validated `notice_version` / locale / `presented_at` / surface (§6.4) |
| Expiry checks | After row lock, use PostgreSQL `clock_timestamp()` |
| Attempts | Atomic increment on failed verify |

---

## 12. HTTP surface (Proposed; non-live)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/v1/auth/phone/start` | Rate-limited; **uniform** `notice_presentation` for all callers; returns `challenge_id`, proposed `expires_in=300`, `resend_after=60` |
| `POST` | `/v1/auth/phone/verify` | `challenge_id` + `code` only (+ optional device/surface); **no** privacy fields; U7 Option A; `TokenPairResponse` |

Anti-enumeration (**U12**): uniform responses; no account-existence oracle via start/verify/privacy/cooldown/spend/`503`.

---

## 13. Persistence sketch (additive after Accept only)

Proposed tables (names illustrative): `otp_challenges` (incl. notice-binding columns), `otp_delivery_attempts`, optional `otp_send_outbox`, durable `otp_abuse_counters`; reuse/extend `privacy_notice_acknowledgments` for post-verify parent association. No plaintext OTP/E.164. No migrations in this docs PR.

Retention (**U16** proposal): challenges **24h**; delivery attempts **7 days**; scheduled purge.

---

## 14. Env / secrets (proposed names)

| Key | Class | Notes |
|---|---|---|
| `SMS_SENDER` | Public | `fake` \| `production` |
| `OTP_PEPPER` | Secret | Code hashing |
| `PHONE_SUBJECT_PEPPER` | Secret | E.164 → subject |
| `OTP_DESTINATION_KEY` | Secret | Optional sealed destination |
| `NOTICE_PRESENTATION_PEPPER` | Secret | Optional presentation-token integrity |
| Budget thresholds | Config | Deny-on-unavailable in staging/prod when real send enabled |
| Vendor credentials | Secret | **None in this PR** |

---

## 15. Test plan (implementation PR after Accept)

Unit: E.164 TR allow/deny; hash binding; cooldown; attempts; adapter env matrix; budget deny; notice presentation validation (uniform).  
API: start→verify; wrong/expired/reused; anti-enum (incl. notice failures); U7 create vs sign-in without client branching.  
Postgres: concurrent verify; mint failure rollback (OTP + parent + notice evidence); identity unique race; attempt races; lock-wait expiry.  
Security: fake sender fail-closed outside dev/test; no OTP/E.164/raw presentation tokens in logs; no public fake inbox.  
Regression: LMP-33 refresh/logout/bootstrap unchanged.

---

## 16. Alternatives considered

| Alternative | Why not |
|---|---|
| Firebase Phone Auth / Twilio Verify as SoR | Human-rejected; couples verification to vendor |
| Choosing/purchasing Netgsm/Twilio/Plivo now | Explicitly gated — delivery candidates only |
| Process-only SMS rate limits | Bypassable under multi-replica |
| Calling public `mintSession` inside outer txn without refactor | Not transactional with Prisma interactive txns |
| Silent merge by phone onto other providers | Forbidden |
| Conditional `privacy_notice_version` on verify for new parents only | Account-existence oracle / U12 break; notice≠consent confusion |
| Bundled “I accept privacy + marketing” auth checkbox | Conflicts with notice/consent separation |

---

## 17. Implementation plan (after Accept only)

1. Explicit human Accept of remaining proposals / privacy design / gates (or documented deferrals).
2. Separate LMP-34 **implementation** PR: migrations, PhoneOtpService, FakeSmsSender, `mintSessionTx`, notice binding, routes, OpenAPI `0.5.0`, durable counters, tests — still no paid vendor unless separately approved; optional-consent subsystem **out of scope**.
3. Client ADR index sync (**U20**).
4. Legal review of notice copy / lawful bases before production personal-data processing.
5. No Jira Done from this docs PR.

---

## 18. Consequences

**Positive:** LM-owned OTP; selected U7 Option A; delivery-only SMS; U13 prerequisite clear; recommended KVKK notice design with uniform anti-enum contract.

**Negative / follow-ups:** Numeric/security params + privacy design still need Accept; `mintSessionTx` required; legal validation of notice/lawful bases; optional consent + child guardianship flows deferred; production SMS financially gated.
