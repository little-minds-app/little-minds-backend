# ADR-020 — GSM OTP sign-in (local fake provider + production adapter)

| Field | Value |
|---|---|
| **Status** | **Proposed** — awaiting explicit human Accept before any OTP implementation PR |
| **Date** | 2026-10-28 |
| **Jira** | [LMP-34](https://little-minds-app.atlassian.net/browse/LMP-34) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-016`) |
| **Blueprint** | F-001, F-031 · §12 Auth · §13.1 / §29 · §31.1 / ADR-002 · §31.4 privacy · §27.4 local identity · §38 ownership |
| **Depends on** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) (**Accepted**) — `SessionIssuerService.mintSession` is the only session mint port |
| **Repos** | `little-minds-backend` only in this PR. After Accept, sync the client ADR index in a **separate** client PR — not here |
| **Companion sketch** | [`lmp-34-otp-api-contract-sketch.md`](./lmp-34-otp-api-contract-sketch.md) (non-normative until Accepted; live OpenAPI stays **`0.4.0`** until the **implementation** PR) |

> **Decision gate:** This ADR is **Proposed**. Do **not** implement production OTP endpoints, do **not** choose a paid SMS vendor, do **not** merge-as-Done, and do **not** mark LMP-34 Done until human Accept + a separate implementation PR with tests/CI/review.

---

## 1. Context

LMP-34 requires GSM OTP sign-in with:

- Local **fake** SMS provider isolated from staging/production
- Production SMS **adapter interface** without committing to a paid vendor
- OTP rate limits, expiry, replay resistance, and test-provider isolation
- Integration with the existing LMP-33 session lifecycle

**Already on `main` (as of `39b379b`, LMP-33 merged):**

- Prisma `ParentAccount`, `ParentIdentity`, `ParentSession`, refresh-hash lookups
- Nest `IdentityModule` with `SessionIssuerService`, guards, refresh/logout/sessions, gated `POST /v1/auth/dev/session`
- OpenAPI **`0.4.0`** auth + parent probe — **no** `/v1/auth/phone/*`
- Structured redaction already covers keys named `otp` / `phone` (LMP-32)
- ADR-019 ownership table: LMP-34 owns phone start/verify, OTP/fake SMS/E.164/abuse; must **not** invent a second session store

**Blueprint §29 binding (non-negotiable product direction):**

- Phone + SMS OTP is a **first-class V1** mobile login path
- Canonical key is `parent_accounts.id` — never use GSM as PK
- E.164 normalization, resend cooldown, expiry, one-time use, rate limits, anti-enumeration, SMS abuse/spend ceilings
- Local fake SMS/OTP adapter; production SMS is an interchangeable adapter
- Never log real OTP values in production
- Do **not** silently merge accounts on matching phone

---

## 2. Decision summary (Proposed — subject to Accept + unresolved table)

| Topic | Proposed decision | Status |
|---|---|---|
| Routes | `POST /v1/auth/phone/start`, `POST /v1/auth/phone/verify` only in LMP-34 | Aligned with Blueprint §29.4 |
| Session mint | Verify success → **only** `SessionIssuerService.mintSession` | Locked by ADR-019 |
| Phone identity | `parent_identities` with `provider = phone` + privacy-safe `provider_subject` | Aligned with §13.1 / §29.1 |
| OTP storage | Never store plaintext OTP; store peppered hash + challenge metadata | Proposed security baseline |
| Concurrency | PostgreSQL row locks + unique constraints; single-winner verify | Proposed |
| Local SMS | Fake adapter only when `APP_ENV ∈ {development, test}` (and fail-closed elsewhere) | Proposed isolation |
| Production SMS | Port/interface only — **no vendor selection** in this ADR | Explicit non-decision |
| OpenAPI | Live bump only in implementation PR (**additive** minor — see U14) | Proposed process |
| Numeric limits | OTP length/TTL/attempts/cooldowns/spend ceilings | **Unresolved** (U1–U6, U11) |
| New vs existing parent UX | Auto-create on first verify vs explicit register | **Unresolved** (U7) |
| Phone subject encoding | Hashing / encryption of E.164 at rest | **Unresolved** (U8–U9) |
| Country allowlist | TR-only vs international Day-1 | **Unresolved** (U10) |

---

## 3. LMP-33 vs LMP-34 ownership (normative)

| Concern | LMP-33 (done) | LMP-34 (this ADR) | Later |
|---|---|---|---|
| `parent_sessions`, refresh, logout, guards, `/v1/parent/me` | ✅ | consumes | — |
| Dev/test bootstrap `POST /v1/auth/dev/session` | ✅ | must not replace | — |
| `SessionIssuerService.mintSession` | ✅ owns | **must call** after verify | — |
| `POST /v1/auth/phone/start\|verify` | ❌ | ✅ | — |
| E.164 normalize, OTP challenge, fake/prod SMS ports | ❌ | ✅ | — |
| `parent_identities` phone row create/lookup | readable today | ✅ write path | — |
| Explicit multi-provider **link** (`/v1/auth/identities/link`) | ❌ | **out of LMP-34 Day-1** unless Accept expands | LMP-35 / recovery |
| Apple / Google / email OTP | ❌ | ❌ | LMP-35 |
| Phone **change** / recovery / SIM-swap step-up UX | ❌ | design notes only; implementation may be deferred | follow-up |
| Web cookies | ❌ | ❌ | LMP-38 |
| Admin MFA/RBAC | ❌ | ❌ | LMP-65 |
| Progressive profile / KVKK notice flows | ❌ | ❌ | separate identity/privacy tasks |

**Hard rule:** LMP-34 must **not** invent a parallel session table, JWT scheme, or mint path outside `SessionIssuerService`.

---

## 4. Phone normalization & privacy-safe identity linking

### 4.1 E.164 normalization (Proposed)

1. Client sends phone + dial-code fields (exact request shape in companion sketch).
2. Server **normalizes** to E.164 before any lookup, rate-limit keying, hashing, or SMS send.
3. Reject non-normalizable input with generic `400 invalid_request` (no “number exists” signal).
4. Do **not** trust client-supplied “already E.164” without server re-normalization.

**Unresolved U10:** Day-1 allowed country/region set (e.g. Türkiye-only vs unrestricted international). Until Accept, implementation must not invent a silent allowlist.

### 4.2 Identity linking model (Proposed)

| Field | Role |
|---|---|
| `parent_accounts.id` | Sole canonical parent key |
| `parent_identities.provider` | Literal `phone` for GSM OTP |
| `parent_identities.provider_subject` | **Stable, privacy-safe subject** derived from normalized E.164 (encoding **U8**) |
| `parent_identities.verified_contact` | Optional minimized contact for support/display (**U9** — may be null, masked, or ciphertext; **never** a merge key alone) |
| Unique | Active uniqueness on `(provider, provider_subject)` (existing Prisma constraint) |

**Rules:**

- Never use raw E.164 as the database primary key.
- Never auto-merge two parents because phones “look similar”.
- First successful verify for an unknown subject creates or attaches identity per **U7**.
- Concurrent first-verify races must fail closed via unique constraint + transaction (see §7).

### 4.3 What must not appear in logs / analytics

Never log: raw E.164, national numbers, OTP plaintext, OTP hashes, full `provider_subject` if it is reversible, Authorization headers, tokens. Prefer challenge id / delivery-attempt id / coarse error enums after existing `allowlistAndRedactContext`.

---

## 5. HTTP flows (Proposed)

### 5.1 `POST /v1/auth/phone/start`

**Purpose:** Create or rotate an OTP challenge and request SMS delivery.

**Proposed steps:**

1. Rate-limit by transport peer IP (+ additional buckets per **U5**).
2. Normalize phone (E.164). Apply country policy (**U10**).
3. Anti-enumeration: response shape must **not** reveal whether the number is already registered (see **U12** for exact status/body policy).
4. Invalidate or supersede prior open challenges for the same subject per **U3** (single active challenge vs allow N).
5. Generate OTP (CSPRNG; length **U1**); store **peppered hash only**; set `expires_at` (**U2**).
6. Persist minimized `otp_challenges` / `otp_delivery_attempts` rows (see §8).
7. Call `SmsSender.send({ e164, body, correlationId })` through the selected adapter.
8. Return a **challenge id** (opaque UUID) + cooldown hint fields as approved in **U4**/sketch — never return the OTP (except fake provider test harness rules in §9).

### 5.2 `POST /v1/auth/phone/verify`

**Purpose:** Consume a valid OTP once; resolve parent; mint session via LMP-33 issuer.

**Proposed steps:**

1. Rate-limit verify attempts (**U5**).
2. Load challenge by id; `SELECT … FOR UPDATE` (or equivalent) inside a transaction.
3. Reject if missing, expired, already consumed, locked out, or subject mismatch.
4. Verify presented code against stored hash (constant-time compare).
5. On failure: increment attempt counter; maybe lock challenge (**U5**); return generic failure (**U12**).
6. On success: mark challenge **consumed** atomically (single-winner); upsert phone identity; resolve/create parent (**U7**); call `SessionIssuerService.mintSession`.
7. Return the same `TokenPairResponse` shape as LMP-33 (reuse schema).

**Session-cap interaction:** If mint returns `403 session_limit_exceeded`, verification has already consumed the OTP — client must logout a session or logout-all, then re-auth. Whether verify should mint inside the same DB transaction as consume is **U13**.

---

## 6. OTP security controls (Proposed mechanics; numeric values unresolved)

| Control | Proposed mechanic | Numeric / policy |
|---|---|---|
| Generation | CSPRNG digits/alphabet | Length **U1** |
| Expiry | Absolute `expires_at` on challenge | TTL **U2** |
| One-time use | Atomic consume flag / status transition | Required |
| Replay | Consumed or superseded challenge cannot verify | Required |
| Resend cooldown | start rejects until cooldown elapsed | Cooldown **U4** |
| Max verifies | Per-challenge attempt counter | Max attempts **U5** |
| Rate limits | IP + subject/bucket limits; multi-instance best-effort like ADR-019 unless shared store approved | Exact limits **U5** |
| SMS abuse / spend | Ceiling / circuit-breaker on delivery adapter | Ceilings **U6** |
| Hashing | HMAC/SHA with dedicated OTP pepper (not the refresh pepper unless Accept says reuse) | Pepper strategy **U8** adjacent |

**Blueprint also requires:** delivery error handling and accessible manual code entry (client UX outside this backend ADR, but API must not assume autofill-only).

---

## 7. Concurrency-safe verification on PostgreSQL (Proposed)

1. **Challenge consume:**  
   `UPDATE otp_challenges SET status = 'consumed', consumed_at = now() WHERE id = :id AND status = 'pending' AND expires_at > clock_timestamp() AND attempt_count < :max`  
   → `count = 1` wins; `0` → reject (expired/consumed/raced).

2. **Parent create race (new phone):**  
   Within the same transaction after consume:  
   - Look up `parent_identities` for `(phone, subject)`.  
   - If missing and policy is auto-create (**U7**): `INSERT parent_accounts` + `INSERT parent_identities`.  
   - On unique violation: re-read winner identity and continue (do **not** create a second parent).

3. **Existing parent:**  
   Load identity → parent; reject if `lifecycle ≠ active` or soft-deleted (generic auth failure; no lifecycle leak beyond what Accept allows — **U12**).

4. **Mint:** Prefer calling `mintSession` after identity commit **or** inside an expanded transaction (**U13**). Mint already takes `FOR UPDATE` on `parent_accounts` for the 20-session cap.

5. Use PostgreSQL `clock_timestamp()` (not transaction-start `now()`) for expiry decisions after lock waits — same lesson as LMP-33 refresh.

---

## 8. Proposed persistence (additive; catalog extension on Accept)

Blueprint §29.4 names `otp_delivery_attempts` (short-lived, minimized). This ADR proposes the following **additive** tables (names may be adjusted on Accept):

### 8.1 `otp_challenges` (proposed)

| Column | Purpose |
|---|---|
| `id` (UUID PK) | Public challenge id returned to client |
| `provider` | `phone` |
| `subject_hash` / `provider_subject` | Privacy-safe subject key (**U8**) |
| `code_hash` | Peppered OTP hash — never plaintext |
| `status` | `pending` / `consumed` / `expired` / `locked` (exact enum **U15**) |
| `attempt_count` | Failed verifies |
| `expires_at` | Absolute expiry |
| `consumed_at` | Set on success |
| `last_sent_at` | Resend cooldown anchor |
| `send_count` | Delivery attempts for this challenge |
| `created_at` / `updated_at` | Audit |

Indexes: PK; `(subject, status, expires_at)` for supersede/lookup; expiry cleanup.

### 8.2 `otp_delivery_attempts` (proposed)

| Column | Purpose |
|---|---|
| `id` | Attempt id |
| `challenge_id` | FK |
| `adapter` | `fake` / `production` (interface name — not a vendor brand) |
| `result` | `accepted` / `rejected` / `failed` / `skipped` (exact set **U15**) |
| `provider_message_id` | Optional opaque vendor id when production adapter used |
| `created_at` | Retention-bounded |

**Unresolved U16:** retention TTL / purge job for challenges and delivery attempts.

**Non-goals in LMP-34 schema:** do not add phone as PK on `parent_accounts`; do not store plaintext OTP; do not broaden admin read access to these tables.

---

## 9. SMS adapter ports (Proposed)

### 9.1 Interface (vendor-neutral)

```ts
/** Production and fake adapters implement this port. No vendor types leak. */
export interface SmsSender {
  readonly name: 'fake' | 'production';
  send(input: {
    e164: string;           // normalized; adapter must not log it
    body: string;           // OTP message template result
    correlationId: string;  // challenge or delivery attempt id
  }): Promise<{
    result: 'accepted' | 'rejected' | 'failed' | 'skipped';
    providerMessageId?: string;
  }>;
}
```

### 9.2 Fake adapter (local / test)

| Rule | Value |
|---|---|
| Enable | Only when `APP_ENV ∈ {development, test}` **and** explicit fake-sender config |
| Hard deny | Staging/production must **not** resolve to fake sender even if misconfigured (fail closed at boot) |
| Delivery | Deterministic, offline — e.g. in-memory store and/or Mailpit/log-safe test channel **without** paid SMS |
| OTP visibility | Tests may read OTP via **test-only** harness/API or fake inbox; **never** expose OTP in staging/production responses or logs |
| CI | Synthetic numbers + fixtures; no live SMS |

Exact fake retrieval mechanism (dedicated test endpoint vs Mailpit vs shared test module) is **U17**.

### 9.3 Production adapter

- Selected only for `APP_ENV ∈ {staging, production}` after secrets present.
- Implements `SmsSender`; maps vendor errors to generic delivery failures.
- **This ADR does not choose a paid SMS vendor** and must not embed vendor SDKs in the docs PR.
- Secrets live only in protected runtime/CI settings (LMP-28 patterns).
- SMS spend ceilings / circuit breaker required (**U6**) before enabling real send in an environment.

### 9.4 Adapter selection (Proposed)

`SMS_SENDER=fake|production` (name TBD) validated by env schema:

- development/test → fake allowed (default fake)
- staging/production → production adapter required; fake → **boot failure**

---

## 10. Existing-parent sign-in vs new-parent registration

### 10.1 Product fork (**Unresolved U7**)

| Option | Behavior | Notes |
|---|---|---|
| **A. Implicit register** | First successful verify creates `parent_accounts` + phone identity + session | Lowest friction; matches many consumer apps; must handle races (§7) |
| **B. Explicit register** | `start/verify` only sign in existing parents; separate register endpoint creates account | Clearer consent timing; more UX steps; Blueprint §12 also lists `POST /v1/parents/register` as example |

**Do not invent a default in implementation.** Accept must pick A, B, or a sequenced hybrid (e.g. verify creates a `pending` parent until notice acknowledgment — that hybrid would expand scope into privacy tasks and should be called out explicitly).

### 10.2 Race handling (Proposed regardless of U7)

- Unique `(provider, provider_subject)` is the concurrency source of truth.
- Loser of insert race reloads winner and continues (Option A) or returns controlled conflict (Option B).
- Never create two parents for one phone subject.

### 10.3 Lifecycle

- Soft-deleted / `pending_deletion` / `deleted` parents must not mint sessions (ADR-019). Exact client-visible error remains **U12**.

---

## 11. Anti-enumeration, phone protection, logging

| Threat | Proposed control |
|---|---|
| Account existence oracle via start/verify | Uniform success/failure messaging and timing budget (**U12**) |
| OTP brute force | Attempt caps + rate limits (**U5**) + expiry (**U2**) |
| SMS pumping / spend abuse | Per-subject/IP/global ceilings (**U6**); captcha/step-up **out of scope** unless Accept adds |
| SIM swap / number recycle | Blueprint: step-up for link/recovery/deletion/phone change — **not** fully implemented in LMP-34 Day-1; document as follow-up residual risk |
| Log leakage | Extend allowlists; never log OTP/E.164; reuse LMP-32 redaction (`otp`, `phone` already listed) |
| Analytics leakage | Phone/OTP must not enter activity events or third-party analytics |

Transport peer IP for rate limits follows ADR-019: **no** trusting `X-Forwarded-For` unless a future trusted-proxy ADR lands.

---

## 12. OpenAPI contract sketch (process)

- Companion: [`lmp-34-otp-api-contract-sketch.md`](./lmp-34-otp-api-contract-sketch.md)
- Live `contracts/openapi.yaml` remains **`0.4.0`** in this docs PR
- After Accept, implementation PR publishes additive phone routes and reuses `TokenPairResponse` / `AuthError`
- Proposed live version: **U14** (`0.5.0` additive minor vs patch — needs Accept)

Error codes to **extend** (Proposed names; exact set **U15**):

| Code | Typical HTTP | Meaning |
|---|---|---|
| `invalid_request` | 400 | Bad phone / body |
| `otp_invalid` | 401 | Wrong/expired/consumed/locked challenge (generic) |
| `otp_cooldown` | 429 | Resend too soon |
| `rate_limited` | 429 | Shared with LMP-33 |
| `sms_unavailable` | 503 | Adapter failure / circuit open |
| `session_limit_exceeded` | 403 | From mint (ADR-019) |

Whether start always returns `200` with a challenge id even when SMS send is skipped for anti-enum is **U12**.

---

## 13. Env / secrets catalog (Proposed additions; names TBD on Accept)

| Key | Class | Notes |
|---|---|---|
| `SMS_SENDER` | Public | `fake` \| `production` |
| `OTP_PEPPER` (name TBD) | **Secret** | Distinct from refresh pepper unless Accept reuses |
| Production SMS credentials | **Secret** | Vendor-agnostic placeholders only — no vendor commitment |
| Fake inbox / test retrieval flags | Public / test-only | Must fail closed outside development/test |

Staging/production fail-closed rules analogous to ADR-019 bootstrap: fake sender and OTP echo must be impossible.

---

## 14. Automated test plan (implementation PR — QA-UI-001)

| Layer | Required cases |
|---|---|
| Unit | E.164 normalize accept/reject; OTP hash verify; cooldown; attempt lock; adapter selection env matrix |
| Unit | Fake sender deterministic behavior; production port contract (mock) |
| API | start → verify success → token pair; wrong OTP; expired; reused; resend cooldown; rate limit |
| API | Anti-enumeration: registered vs new number indistinguishable per **U12** |
| DB / Postgres | Concurrent verify single-winner consume; concurrent new-parent unique race |
| Security | Staging/production reject fake sender at boot; OTP absent from logs/redaction fixtures |
| Integration | Verify → `mintSession` → `/v1/parent/me`; session cap `403` path |
| Regression | Existing LMP-33 refresh/logout/bootstrap unchanged |

Manual / staging evidence after Accept may include offline SMS failure simulation via adapter fault injection — **no live SMS** before security/legal sign-off (Blueprint §29.5 DoD).

---

## 15. Unresolved product / security decisions (must Accept or defer explicitly)

| ID | Topic | Why blocked | Options / notes |
|---|---|---|---|
| **U1** | OTP length / alphabet | Security vs UX | e.g. 6-digit numeric vs longer alphanumeric — **do not invent** |
| **U2** | OTP absolute TTL | Security vs UX | Blueprint requires expiry; value unset |
| **U3** | Challenge supersede policy | Abuse vs UX | Invalidate prior pending vs allow multiple concurrent challenges |
| **U4** | Resend cooldown | Blueprint requires cooldown; duration unset | — |
| **U5** | Rate limits & max verify attempts | Blueprint requires limits; numbers unset | Include IP + per-subject; multi-instance caveat like ADR-019 |
| **U6** | SMS spend / abuse ceilings | Blueprint requires ceilings; numbers/env unset | Per-number, per-IP, global daily |
| **U7** | New parent on first verify | Product fork | Implicit register (A) vs explicit register endpoint (B) vs privacy-gated hybrid |
| **U8** | `provider_subject` encoding | Privacy vs operability | Peppered hash of E.164 vs encrypted subject vs reversible vault id |
| **U9** | `verified_contact` storage | Support needs vs minimization | null / masked / encrypted; never merge key |
| **U10** | Country / region allowlist | Market + SMS cost + fraud | TR-only Day-1 vs international |
| **U11** | Message template / localization | Product copy | TR/EN templates; sender ID branding |
| **U12** | Anti-enumeration response policy | Security UX | Always-200 start; uniform verify errors; timing |
| **U13** | Consume+mint transaction boundary | Consistency vs session-cap UX | Single txn vs consume-then-mint |
| **U14** | OpenAPI version for implementation | Contract process | Propose additive `0.5.0` |
| **U15** | Exact enums / error codes | Contract stability | Challenge status, delivery result, AuthError extensions |
| **U16** | OTP row retention / purge | Privacy | Hours vs days; job ownership |
| **U17** | Fake OTP retrieval in local/CI | DX | Test harness vs Mailpit vs header in test env only |
| **U18** | Scope of phone change / recovery in LMP-34 | Boundary | Defer to follow-up vs include minimal change flow |
| **U19** | Staging real SMS | Ops risk | Fake-only staging until legal/security sign-off vs production adapter with test numbers |
| **U20** | Client ADR index sync timing | Process | After Accept, separate client PR (same pattern as ADR-019 U15) |

**Agents must not silently resolve U1–U20.** Prefer asking / waiting for Accept notes over inventing defaults.

---

## 16. Alternatives considered

| Alternative | Why not (for V1 / this ADR) |
|---|---|
| Paid IdP / hosted OTP SaaS as system of record | Conflicts with ADR-002 self-hosted IdentityModule direction |
| Choosing Twilio/Netgsm/etc. in this ADR | Explicitly forbidden — adapter only |
| Storing plaintext OTP | Forbidden by Blueprint privacy rules |
| Second session store for OTP login | Forbidden by ADR-019 |
| Trusting XFF for OTP rate limits | Rejected by LMP-33 security QA |
| Implementing Apple/Google/email here | LMP-35 |
| Implementing full SIM-swap recovery UX here | Residual risk; needs product Accept (**U18**) |

---

## 17. Implementation plan (after Accept only)

1. Human Accept of ADR-020 with resolutions (or explicit deferrals) for U1–U20.
2. Separate LMP-34 **implementation** PR: migrations, services, fake/production ports, routes, OpenAPI bump, env catalog, tests — still **no** paid vendor commitment unless a later ADR/Accept names one.
3. Separate client ADR index sync (**U20**).
4. No Jira Done from this docs PR.

---

## 18. Consequences

**Positive:** Clear GSM OTP design boundary on top of Accepted ADR-019; local-first fake SMS; vendor-neutral production port; concurrency-safe verify sketch; explicit unresolved list prevents invented security defaults.

**Negative / follow-ups:** Many numeric and product forks still open (U1–U20); SIM-swap/phone-change hardening likely needs a follow-up; staging real SMS remains gated; multi-instance rate limits remain best-effort until a shared store is approved.
