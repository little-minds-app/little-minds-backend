# ADR-020 — GSM OTP sign-in (local fake provider + production adapter)

| Field | Value |
|---|---|
| **Status** | **Accepted** — explicit Little Minds Product Owner approval on **2026-10-28**; implementation may proceed only in a **separate** PR after this docs PR is human-authorized to merge |
| **Date** | 2026-10-28 (Accept recorded) |
| **Jira** | [LMP-34](https://little-minds-app.atlassian.net/browse/LMP-34) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-016`) |
| **Blueprint** | F-001, F-031 · §12 Auth · §13.1 / §29 · §31.1 / ADR-002 · §31.4 privacy · §27.4 local identity · §38 ownership |
| **Depends on** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) (**Accepted**) — sole session mint port |
| **Repos** | `little-minds-backend` only. Client ADR index sync remains a **separate** client PR (**U20**, deferred process) |
| **Companion sketch** | [`lmp-34-otp-api-contract-sketch.md`](./lmp-34-otp-api-contract-sketch.md) (non-live until implementation; OpenAPI stays **`0.4.0`** until implementation PR **`0.5.0`**) |

> **Decision:** Human Accepted ADR-020 on 2026-10-28 (architecture, **U7 Option A**, KVKK notice **Option A**, **U1–U17** parameters). **U18–U20** remain deferred/gated. Paid SMS vendors remain **unapproved**. Qualified **legal review** of notice copy / lawful bases is required before production personal-data processing. **Implementation is a separate PR** (Phase B) — not authorized by Accept alone to merge this docs PR or start coding without human merge authorization / Phase B kickoff. No Jira Done from this docs PR.

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
| Session mint | ✅ owns | must call (may need `mintSessionTx` — §9) | — |
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

**Status: Accepted** (U7 Option A) with ADR-020 on 2026-10-28.

On successful OTP verify:

1. Normalize phone to E.164 (TR-only Day-1 per Accepted **U10**).
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

## 6. Accepted KVKK / privacy design (engineering) + legal-review gate

**Classification:** **Accepted** for V1 engineering design (notice Option A). Final notice **wording**, lawful bases, and production enablement still require **qualified legal review** before launch — Accept does **not** replace counsel sign-off. Reference themes (do not copy legal text): KVKK aydınlatma obligations / notice procedures; Kurul principle that **aydınlatma** and **açık rıza** texts must be arranged separately (kvkk.gov.tr public announcements).

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

### 6.4 V1 start/verify binding — Option A (**Accepted**)

**Rejected:** conditional `privacy_notice_version` on **verify** for unknown parents only — account-existence branching / **U12** oracle / notice≠consent confusion.

**V1 Accepted shape (Option A):** uniform `notice_version` + `notice_locale` on **`POST /v1/auth/phone/start`** for every caller.

1. Client presents notice UX **before** phone submit (contextual text + full-notice link). Active version/locale come from the **server-owned catalog** (published versions known to the app via existing/future privacy catalog access already in product scope — **no new notice-token mint endpoint** in LMP-34 V1).
2. `POST /v1/auth/phone/start` requires uniform fields `notice_version` + `notice_locale` that must equal the server’s **currently active** published pair (plus optional coarse `presentation_surface`).
3. Server validates → stores `notice_version` / `notice_locale` / `presented_at` (server clock) / `presentation_surface` on `otp_challenges`.
4. `POST /v1/auth/phone/verify` is **only** `challenge_id` + `code` (+ optional device/surface). **No** privacy fields.
5. On verify success:
   - **Existing parent:** mint session; notice version-update policy must not become a consent gate.
   - **New parent (U7):** create parent + phone identity + notice-presentation evidence row + session mint in one txn (**U13** / `mintSessionTx`).

**Client-evidence limits (explicit):** submitting the active `notice_version`/`locale` proves the client **claimed** presentation and that the server **accepted** a catalog match at start. It does **not** cryptographically prove the UI rendered the full notice. Stronger attestation (e.g. opaque presentation tokens) is a **future enhancement only** — **not** normative V1 and **not** a reason to add a public notice-token endpoint now.

**Not consent:** challenge-bound notice evidence is transparency/presentation record — never `accepted_privacy=true` and never optional-processing consent.
### 6.5 Existing parents

Sign-in must **not** force a new registration flow or unnecessary repeated “consent.” If the published notice version changes, define a **version-update presentation** policy later — notice remains transparency, not an optional-consent gate.

### 6.6 Optional consent (out of LMP-34)

Marketing / non-essential analytics / similar purposes needing açık rıza: separate, purpose-specific, not preselected, versioned evidence, withdrawable, **not** bundled with auth. **Do not** implement inside LMP-34 unless separately authorized.

### 6.7 Child data / guardianship

Phone OTP verifies control of a number and (under U7) may create a **parent account**. It does **not** by itself establish legal guardianship or authorize every category of child-data processing. Child-profile creation needs a **separately reviewed** privacy/authorization flow (outside LMP-34 implementation scope; prerequisite for child features).

---

## 7. Decision matrix U1–U20 (+ privacy) — Accept scope

| ID | Topic | Classification | Decision |
|---|---|---|---|
| **Arch** | OTP ownership / SMS role | **Accepted** | LM-owned OTP; SMS delivery-only; no Firebase Phone Auth / Twilio Verify SoR |
| **U7** | New parent | **Accepted** | Option A — create parent + phone identity on first successful verify |
| **Privacy** | KVKK notice design (§6) | **Accepted** (engineering) | Notice≠ToS≠optional consent; present before phone submit; **Option A** `notice_version`+`notice_locale` on start; challenge-bound; uniform verify; token = future only; **legal review before production** |
| **U1** | OTP format | **Accepted** | 6-digit numeric, CSPRNG |
| **U2** | OTP TTL | **Accepted** | **300 seconds** absolute |
| **U3** | Supersede | **Accepted** | One active pending challenge per subject; new issued challenge supersedes previous |
| **U4** | Resend cooldown | **Accepted** | **60 seconds** |
| **U5** | Attempts / rate limits | **Accepted** | Max **5** wrong attempts/challenge + IP/subject limits (see §8) |
| **U6** | SMS abuse / spend | **Accepted** + **production gate** | Durable subject/IP/global limits; financial ceiling still required before production SMS (vendor price TBD; SMS unapproved) |
| **U8** | Provider subject | **Accepted** | `HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164)` |
| **U9** | Verified contact | **Accepted** | Null by default; short-lived sealed destination only if needed; no plaintext E.164 at rest |
| **U10** | Launch countries | **Accepted** | Türkiye (**+90**) only for initial V1 |
| **U11** | Templates | **Accepted** | Turkish initial SMS template; vendor-neutral rendering; EN optional later |
| **U12** | Anti-enumeration | **Accepted** | Uniform start/verify contracts; no account-existence oracle (incl. privacy fields); see §10 |
| **U13** | Consume/mint txn | **Accepted** + **impl prerequisite** | Atomic consume + identity + notice evidence + session via `mintSessionTx`; see §9–§10 |
| **U14** | OpenAPI | **Accepted** | Live **`0.5.0`** only in **implementation** PR (this docs PR keeps **`0.4.0`**) |
| **U15** | Enums / errors | **Accepted** | Explicit challenge/delivery states + generic `otp_invalid` / `otp_cooldown` / `sms_unavailable` |
| **U16** | Retention | **Accepted** | Challenges scrub/purge **24h**; delivery attempts **7 days** — FK-safe design (§13.1; no CASCADE wipe) |
| **U17** | Fake OTP retrieval | **Accepted** | Test harness/inbox only; inaccessible staging/production |
| **U18** | Phone change / recovery | **Deferred** | Out of LMP-34 Day-1 |
| **U19** | Staging real SMS | **Deferred / staging gate** | Disabled until separately approved |
| **U20** | Client ADR sync | **Deferred process** | Separate client PR after this ADR is on `main` |
| **Vendor** | Netgsm / Twilio / Plivo | **Production gate** | Candidates only — **not** approved, purchased, or integrated |

---

## 8. Accepted numerical limits (V1 engineering)

**Accepted** abuse/OTP numbers for implementation. Still **not** authorization to enable production SMS or purchase a vendor:

| Limit | Accepted value |
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

**Retry note (pre-commit / still-pending challenge):** clients may retry verify with the same code if the HTTP outcome is ambiguous **only while** the challenge is still pending (not consumed).

### 9.4 Post-commit JWT / HTTP failure (ADR-019 reality — no runtime change)

ADR-019 `mintSession` (and the proposed outer verify txn) **commits DB state first**, then signs the access JWT and returns the HTTP body. Therefore:

| Phase | Failure | Rollback of consume / new parent / session row? |
|---|---|---|
| Inside DB transaction (validate, U7 create, consume, `mintSessionTx`) | Error / `session_limit_exceeded` | **Yes** — full txn rollback |
| **After** successful commit, during JWT sign or response write | Process crash, sign error, client timeout | **No** — DB commit is durable; there is **no** rollback promise |

**Client / product policy (document for Accept):**

1. If verify returns a clear **success** body → persist token pair; do not retry the same OTP.
2. If verify returns a clear **4xx/5xx** before success → follow that error; retry OTP only while challenge remains pending (server still has unconsumed challenge).
3. If the outcome is **ambiguous** (timeout / connection drop after send): treat like ADR-019 lost refresh — **do not** blindly resubmit the same OTP assuming it was not consumed. Preferred recovery: call verify at most with idempotent awareness **or** re-enter auth via a **new** `start` (new challenge) rather than risking double-submit races; if the first attempt actually committed, a second successful path must not create an unbounded duplicate-session storm.
4. **Duplicate-session prevention:** session mint remains subject to the ADR-019 **20 active session** cap (`FOR UPDATE` + count). A committed-but-unobserved success still counts as an active session. Clients that re-auth after ambiguity may hit `403 session_limit_exceeded` and must logout/logout-all. Implementation MAY optionally detect a very recent pending challenge already `consumed` for the same subject and return a controlled generic auth error rather than minting again — **Accept may require** this hardening; V1 minimum is cap enforcement + client re-auth guidance.
5. This docs PR does **not** change SessionIssuer runtime behavior.

---

## 10. U7 / U12 / U13 consistency

| Concern | Coherent behavior |
|---|---|
| **U7** | First successful verify for unknown phone subject creates parent + phone identity |
| **U12** | Start and verify request/response shapes are **identical** for existing vs new; no client “am I new?” branch; no privacy field required only for unknowns; generic auth errors; do not leak lifecycle beyond Accept-approved generics |
| **U13** | Single DB txn: challenge validate/consume + U7 resolve/create + notice evidence attach + `mintSessionTx`; rollback-all on mint failure; session cap still enforced; concurrent verify single-winner; SMS outside locks |
| **Notice** | Bound at **start** into challenge (§6.4); verify reads challenge metadata — no verify-time `privacy_notice_version` |

---

## 11. OTP crypto & challenge rules (Accepted)

| Control | Accepted rule |
|---|---|
| Code | 6-digit CSPRNG (**U1**) |
| Hash | `HMAC-SHA256(OTP_PEPPER, challenge_id \|\| ":" \|\| subject_key \|\| ":" \|\| code)` — binds challenge + subject (anti cross-challenge replay) |
| Subject | `hex(HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164))` (**U8**) |
| Peppers | Distinct from `REFRESH_TOKEN_PEPPER` (OTP + phone-subject peppers). Presentation-token pepper = **future only** |
| Delivery state | `pending_send` / `sent` / `failed` / `superseded` — start/resend must not invalidate a just-delivered code without cooldown/idempotency rules |
| Notice binding | Challenge stores server-validated `notice_version` + `notice_locale` + `presented_at` + surface (**V1 Option A**, §6.4) |
| Expiry checks | After row lock, use PostgreSQL `clock_timestamp()` |
| Attempts | Atomic increment on failed verify |

---

## 12. HTTP surface (Proposed; non-live)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/v1/auth/phone/start` | Rate-limited; **uniform** `notice_version` + `notice_locale` (V1 Option A); returns `challenge_id`, proposed `expires_in=300`, `resend_after=60` |
| `POST` | `/v1/auth/phone/verify` | `challenge_id` + `code` only (+ optional device/surface); **no** privacy fields; U7 Option A; `TokenPairResponse` |

Anti-enumeration (**U12**): uniform responses; no account-existence oracle via start/verify/privacy/cooldown/spend/`503`.

---

## 13. Persistence sketch (additive after Accept only)

Proposed tables (names illustrative): `otp_challenges` (incl. notice-binding columns), `otp_delivery_attempts`, optional `otp_send_outbox`, durable `otp_abuse_counters`; reuse/extend `privacy_notice_acknowledgments` for post-verify parent association. No plaintext OTP/E.164. No migrations in this docs PR.

### 13.1 Retention vs FK (U16) — fix CASCADE conflict

**Problem:** If `otp_delivery_attempts.challenge_id` uses `ON DELETE CASCADE` and challenges are purged at **24h**, delivery rows intended to live **7 days** are wiped early.

**Recommended relational design:**

1. **Do not** use `ON DELETE CASCADE` from challenges → delivery attempts for V1.
2. Prefer one of:
   - **A (preferred):** `challenge_id UUID NULL` with `ON DELETE SET NULL`, plus a non-PII `challenge_id_snapshot UUID NOT NULL` copied at insert time for correlation after parent row scrub/delete; **or**
   - **B:** no FK; store `challenge_id` as an indexed UUID soft-reference only (document referential integrity in app/jobs).
3. Delivery rows store **minimized** fields only: adapter name class (`fake`/`production`), result enum, optional opaque `provider_message_id`, timestamps — **no** E.164, OTP, or notice body.
4. **Cleanup order (scheduled job):**
   1. At **~24h:** scrub and/or delete `otp_challenges` (clear `code_hash`, `sealed_destination`, notice columns; delete row if SET NULL/soft-ref allows).
   2. At **~7d:** delete `otp_delivery_attempts` (and any challenge stubs if using delayed hard-delete).
5. **Future tests (implementation PR):** assert 24h challenge purge does **not** delete delivery attempts still inside 7d window; assert scrub removes secrets/PII from challenges; assert no CASCADE surprise.

Retention (**U16 Accepted**): challenges scrub/purge **24h**; minimized delivery attempts purge **7 days** — FK-safe as above.

---

## 14. Env / secrets (proposed names)

| Key | Class | Notes |
|---|---|---|
| `SMS_SENDER` | Public | `fake` \| `production` |
| `OTP_PEPPER` | Secret | Code hashing |
| `PHONE_SUBJECT_PEPPER` | Secret | E.164 → subject |
| `OTP_DESTINATION_KEY` | Secret | Optional sealed destination |
| Budget thresholds | Config | Deny-on-unavailable in staging/prod when real send enabled |
| Vendor credentials | Secret | **None in this PR** |

---

## 15. Test plan (implementation PR after Accept)

Unit: E.164 TR allow/deny; hash binding; cooldown; attempts; adapter env matrix; budget deny; notice presentation validation (uniform).  
API: start→verify; wrong/expired/reused; anti-enum (incl. uniform notice failures); U7 create vs sign-in without client branching; ambiguous-verify client guidance.  
Postgres: concurrent verify; mint failure rollback (OTP + parent + notice evidence); identity unique race; attempt races; lock-wait expiry; **24h challenge purge preserves 7d delivery rows**.  
Security: fake sender fail-closed outside dev/test; no OTP/E.164 in logs; no public fake inbox / no notice-token endpoint.  
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
| Normative V1 opaque notice-presentation tokens / mint endpoint | Deferred future enhancement; V1 = Option A version+locale |
| `ON DELETE CASCADE` challenges → delivery attempts | Conflicts with 24h vs 7d retention |
| Bundled “I accept privacy + marketing” auth checkbox | Conflicts with notice/consent separation |
| Promising DB rollback after JWT/HTTP post-commit failure | Impossible once commit succeeded (ADR-019 mint order) |

---

## 17. Implementation plan (Phase B — separate PR only)

1. **Completed (Phase A):** Human Accepted ADR-020 on 2026-10-28; this docs PR records that decision.
2. **Human must authorize merge** of this docs PR before / independently of coding kickoff.
3. Separate LMP-34 **implementation** PR (Phase B): migrations, PhoneOtpService, FakeSmsSender, `mintSessionTx`, notice Option A binding, routes, OpenAPI `0.5.0`, durable counters, FK-safe retention jobs, tests — still **no** paid vendor unless separately approved; optional-consent subsystem **out of scope**.
4. Client ADR index sync (**U20**) in a separate client PR after Accept is on `main`.
5. Legal review of notice copy / lawful bases before production personal-data processing.
6. No Jira Done from this docs PR; no automatic Phase B start from Accept text alone without human Phase B authorization.

---

## 18. Consequences

**Positive:** Accepted LM-owned OTP design; U7 Option A; delivery-only SMS; U1–U17 parameters locked for implementation; KVKK notice Option A; U13 `mintSessionTx` prerequisite clear.

**Negative / follow-ups:** `mintSessionTx` refactor required in Phase B; U18–U20 deferred; legal validation of notice/lawful bases before production; optional consent + child guardianship deferred; production SMS vendor/financial gates remain closed.
