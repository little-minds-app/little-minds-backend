# ADR-021 — Multi-provider parent identity (Apple, Google, Email OTP)

| Field | Value |
|---|---|
| **Status** | **Proposed** — architecture proposal for human review. **Not Accepted.** No runtime implementation authorized by this docs PR. |
| **Date** | 2026-10-28 |
| **Jira** | [LMP-35](https://little-minds-app.atlassian.net/browse/LMP-35) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-017`) |
| **Blueprint** | F-031 · §12 Auth · §13.1 / §29 · §31.1 / ADR-002 · §31.4 privacy · §36.2 Apple name draft · §38 ownership |
| **Depends on** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) (**Accepted**) — sole session mint port · [ADR-020](./ADR-020-gsm-otp-sign-in.md) (**Accepted**) — OTP / notice patterns for Email OTP |
| **Repos** | `little-minds-backend` only. Client ADR index sync = separate client PR (deferred process) |
| **Companion sketch** | [`lmp-35-multi-provider-api-contract-sketch.md`](./lmp-35-multi-provider-api-contract-sketch.md) (non-live; live OpenAPI stays **`0.5.0`** until a future implementation PR proposes **`0.6.0`**) |

> **Decision pending:** This ADR proposes Apple ID token verification, Google ID token verification, and Email OTP adapters that resolve to the same canonical `parent_accounts.id` via `parent_identities`, minting sessions only through ADR-019 `SessionIssuerService` / `mintSessionTx`. **First-time account creation policy for non-phone providers requires explicit human approval** (see **U7**). Paid Apple/Google developer program costs, production email delivery vendors, and account **linking** (**LMP-36**) are out of this ADR’s Accept scope.

---

## 1. Context

LMP-34 delivered GSM OTP (`phone` provider) on `main`. Blueprint **F-031** and §29 require Day-1 mobile support for **Sign in with Apple**, **Google Sign-In**, and **email OTP**, each resolving to the same parent account model after verified identity — without using provider IDs or email as the database primary key.

**On `main` (post LMP-34):**

- `SessionIssuerService` + `mintSessionTx` (ADR-019 / ADR-020)
- `parent_identities` unique on `(provider, provider_subject)`
- Phone OTP + privacy notice Option A + OpenAPI **`0.5.0`**
- Identity README marks Apple / Google / email as **LMP-35**

This docs PR proposes the architecture only. It does **not** implement adapters, migrations, SDKs, live OpenAPI paths, or Accept.

---

## 2. Mandatory architecture (proposed)

Little Minds **owns** identity verification outcomes, parent resolution, and session issuance.

| Provider | LM owns | External role |
|---|---|---|
| **Apple** | Verify Apple **ID token** (JWKS); map `sub` → `parent_identities` | Apple issues ID token to the app; LM does **not** use Apple as session SoR |
| **Google** | Verify Google **ID token** (JWKS); map `sub` → `parent_identities` | Google issues ID token; LM does **not** use Google/Firebase Auth as session SoR |
| **Email OTP** | Generate / hash / verify OTP; challenge persistence; abuse limits | **MailSender** delivery-only (Mailpit local; production SMTP/vendor **unapproved**) |

**Rejected as identity / session system of record:** Firebase Authentication, Auth0 (as SoR), Cognito, or any hosted “verify and mint our sessions” product. Vendor SDKs may be used only as **token/JWKS helpers** or **SMTP delivery**, never as the parent/session authority.

```text
Little Minds iOS / Android / (future web)
          |
          v
NestJS IdentityModule
          |
          +-- AppleIdentityService   (verify ID token → subject)
          +-- GoogleIdentityService  (verify ID token → subject)
          +-- EmailOtpService        (LM-owned OTP; MailSender delivery)
          |
          +-- IdentityResolveService (provider + subject → parent_id)
          |      |-- NO silent cross-provider merge by email
          |      +-- first-time create policy = U7 (human Approve required)
          |
          v
      SessionIssuerService.mintSessionTx  (ADR-019 only)
```

Canonical account key: **`parent_accounts.id`** (UUID). Never use Apple `sub`, Google `sub`, email, or phone as PK.

Successful auth → **only** ADR-019 session mint (no second session store).

---

## 3. Ownership vs adjacent work

| Concern | Owner | Notes |
|---|---|---|
| Sessions / refresh / logout / guards | ADR-019 / LMP-33 | Unchanged |
| GSM OTP | ADR-020 / LMP-34 | Unchanged; `provider=phone` |
| Apple / Google / Email OTP adapters | **LMP-35** (this ADR) | Proposed |
| Explicit account **linking** / recovery UX | **LMP-36** (out of scope) | Do not implement linking APIs here |
| Phone change | ADR-020 **U18** deferred | — |
| Web cookie session UX | LMP-38 | — |
| Admin MFA | LMP-65 | — |

---

## 4. Apple ID token verification (proposed)

### 4.1 Flow

1. Client completes Sign in with Apple; obtains Apple **ID token** (JWT).
2. `POST /v1/auth/apple` (name TBD in sketch) sends ID token (+ optional `notice_version`/`notice_locale` / nonce / device surface).
3. Server verifies JWT against Apple JWKS: signature, `iss`, `aud` (bundle / services ID), `exp`, optional `nonce` binding.
4. Stable subject = Apple `sub` → `parent_identities.provider='apple'`, `provider_subject=sub`.
5. Resolve or create parent per **U7** (pending human choice) → `mintSessionTx` → TokenPair.

### 4.2 Rules

- Never trust client-supplied email alone for identity binding.
- Apple **private relay** email may appear in token claims — store minimized `verifiedContact` only if needed; **do not** use email as merge key across providers.
- Optional Apple name on first authorization → short-lived `profile_draft` per Blueprint §36.2 / existing `ProfileDraft` model; never log Apple callback payloads.
- Fail closed if Apple JWKS / audience config missing in staging/production.

### 4.3 Production gates

- Apple Developer program / Services ID / key material = **ops/legal gate** (not authorized by Accept of this ADR alone).
- No Apple SDK purchase beyond standard Sign in with Apple client libraries already in product scope.

---

## 5. Google ID token verification (proposed)

### 5.1 Flow

Symmetric to Apple: client obtains Google **ID token**; server verifies via Google JWKS (`iss`, `aud` = OAuth client IDs, `exp`, `email_verified` if used for contact only).

Stable subject = Google `sub` → `provider='google'`.

### 5.2 Rules

- Same no-silent-merge / no email-as-PK rules as Apple.
- Do **not** use Firebase Auth session cookies or Firebase Admin “create custom token” as LM session SoR.
- Fail closed if Google client IDs / JWKS config missing in staging/production.

### 5.3 Production gates

- Google Cloud OAuth client IDs = ops gate; paid Google APIs beyond Sign-In ID token verify are **not** required for V1 proposal.

---

## 6. Email OTP (proposed — ADR-020 principles)

Email OTP reuses LM-owned OTP patterns from ADR-020 with **email-specific** security parameters (proposed numbers in §8 — need human Approve).

| Concern | Phone (Accepted ADR-020) | Email OTP (**Proposed**) |
|---|---|---|
| Delivery port | `SmsSender` | `MailSender` (Mailpit local; production SMTP **unapproved**) |
| Subject key | `HMAC(PHONE_SUBJECT_PEPPER, e164)` | `HMAC(EMAIL_SUBJECT_PEPPER, normalized_email)` |
| Normalization | TR E.164 mobile only | Lowercase; trim; reject invalid; **plus-tag / alias policy** TBD (propose: preserve `+` local-part as distinct subject unless human chooses collapse) |
| OTP format | 6-digit CSPRNG | Same **6-digit** (propose) |
| TTL | 300 s | Propose **600 s** (email latency) — **Approve** |
| Resend cooldown | 60 s | Propose **60 s** |
| Max wrong attempts | 5 | Propose **5** |
| Rate limits | SMS subject/IP/global | Separate **email** durable counters (cheaper channel ≠ free abuse) |
| Start notice | Option A version+locale | Same Option A on **email start** |
| Verify privacy fields | None | None |
| Fake retrieval | Test harness only | Test harness / Mailpit only; fail-closed staging/prod |

**Never hold DB locks while calling `MailSender`.** Start commits challenge then sends (same ambiguous-send / no-auto-resend lessons as ADR-020).

Reuse `otp_challenges` with `provider='email'` (or dedicated table if migration review prefers — **implementation choice**, not Accept-blocking). Delivery attempts FK-safe retention aligned with ADR-020 U16.

---

## 7. Identity resolution rules (proposed)

### 7.1 Lookups

1. Lookup active `parent_identities` by `(provider, provider_subject)`.
2. If found and parent `lifecycle=active` → sign in (`mintSessionTx`).
3. If found but parent deleted / non-active → uniform auth failure (anti-enum).
4. If **not** found → apply **U7 first-time create policy** (human must Approve option).

### 7.2 No silent merge

**Forbidden:**

- Auto-linking Apple ↔ Google ↔ email ↔ phone because emails match
- Creating a second parent then silently merging
- Using `verifiedContact` email/phone as a unique global identity key

**Allowed later (LMP-36):** explicit, authenticated linking flows with clear UX and collision tests — **out of LMP-35 Day-1**.

### 7.3 U7 — First-time create (needs human Approve)

| Option | Behavior | Notes |
|---|---|---|
| **A — Auto-create** (mirror phone ADR-020) | Unknown provider subject → create `parent_accounts` + identity (+ notice evidence) in same txn as mint | Consistent with phone U7 Option A; simplest mobile UX |
| **B — Explicit registration** | Unknown subject → `account_not_found` / require separate register step | More friction; may reduce accidental account sprawl |
| **C — Hybrid** | Auto-create for Apple/Google; email requires extra confirmation step | Asymmetric; harder client UX |

**Recommendation for review:** **Option A** for all three providers (parity with phone), with LMP-36 owning later explicit link. **This remains Proposed until human Approves.**

---

## 8. Privacy (proposed)

- Notice ≠ ToS ≠ optional consent (ADR-020 §6).
- Present applicable privacy notice **before** collecting email or completing Apple/Google credential submit.
- **Option A binding (proposed for Email OTP):** uniform `notice_version` + `notice_locale` on email **start**; verify has no privacy fields.
- **Apple / Google (proposed):** same uniform notice fields on the auth request that first creates a parent (or on a preceding start/bind call). Prefer one uniform request shape to avoid account-existence oracles.
- Server-owned catalog; staging/prod require **that exact** entry `published: true` (LMP-34 gate).
- Legal review before production personal-data processing — **unchanged blocker**.
- Optional consent / marketing — out of LMP-35.

---

## 9. Session mint / transactions (proposed)

All successful provider paths:

```text
BEGIN
  resolve or create parent + identity (+ notice evidence if new) per U7
  mintSessionTx(tx, …)   // ADR-019 cap + FOR UPDATE
COMMIT
sign access JWT (post-commit; no rollback — same ADR-019/020 client guidance)
```

- Email OTP verify: consume challenge + resolve/create + mint in **one** txn (reuse ADR-020 U13 pattern).
- Apple/Google: no OTP consume; still one txn for identity create + mint.
- Concurrent first-time create on same subject: unique `(provider, provider_subject)` + single-winner; loser retries as sign-in.
- Never call Apple/Google JWKS or MailSender inside a long-held row lock beyond necessary verify reads.

---

## 10. Decision matrix (U*) — for human approval

| ID | Topic | Classification | Proposal |
|---|---|---|---|
| **Arch** | Provider ownership | **Proposed** | LM verifies Apple/Google ID tokens; LM-owned Email OTP; MailSender delivery-only; no Firebase/Auth0 SoR |
| **U1** | Canonical ID | **Proposed** | `parent_accounts.id` only; `parent_identities (provider, provider_subject)` |
| **U2** | Apple subject | **Proposed** | Apple `sub` |
| **U3** | Google subject | **Proposed** | Google `sub` |
| **U4** | Email subject | **Proposed** | HMAC email subject pepper over normalized email |
| **U5** | Email normalization | **Proposed** | Lowercase + trim; plus-tag policy = preserve distinct (Approve alternative: collapse) |
| **U6** | No silent merge | **Proposed** | Never merge/link by email match across providers in LMP-35 |
| **U7** | First-time create | **Proposed — needs Approve** | Recommend **Option A** auto-create (phone parity); Alternatives B/C documented |
| **U8** | Account linking | **Deferred** | **LMP-36** — out of scope |
| **U9** | mintSessionTx | **Proposed** | Mandatory for all new provider success paths |
| **U10** | Privacy notice | **Proposed** | Option A fields on email start / first Apple|Google auth; verify/token paths without privacy branching oracles |
| **U11** | Email OTP format | **Proposed** | 6-digit CSPRNG |
| **U12** | Email OTP TTL | **Proposed** | **600 s** (vs phone 300 s) |
| **U13** | Email cooldown / attempts | **Proposed** | 60 s resend; 5 wrong attempts |
| **U14** | Email rate limits | **Proposed** | Durable PG counters (distinct from SMS); concrete numbers Approve in Phase B |
| **U15** | MailSender | **Proposed** | Mailpit/fake local; production SMTP **unapproved** |
| **U16** | Anti-enumeration | **Proposed** | Uniform errors; no “email registered?” oracle |
| **U17** | OpenAPI | **Proposed** | Live bump to **`0.6.0`** only in implementation PR; this docs PR keeps **`0.5.0`** |
| **U18** | Apple name draft | **Proposed** | Use existing `profile_drafts`; §36.2 rules |
| **U19** | Client ADR sync | **Deferred process** | Separate client PR after Accept + merge |
| **U20** | Paid providers / Apple&Google ops | **Production gate** | Not authorized by docs Accept alone |

---

## 11. Proposed numerical limits (Email OTP — Approve)

| Limit | Proposed |
|---|---|
| OTP digits | 6 |
| TTL | **600 s** |
| Resend cooldown | 60 s |
| Wrong attempts / challenge | 5 |
| Email start / address / 15 min | **5** (candidate) |
| Email start / address / 24 h | **20** (candidate) |
| Email start / IP / 15 min | **10** (candidate) |
| Verify / IP / min | **10** |

SMS limits remain as Accepted in ADR-020. Candidates above need human Approve before Phase B.

---

## 12. Non-goals (this ADR / LMP-35 Phase A)

- Runtime Nest services, controllers, migrations, env secrets beyond documentation
- Live OpenAPI path publication (stays **0.5.0**)
- Firebase Auth / social SoR
- Paid email vendor purchase or Apple/Google billing beyond Sign-In
- Cross-provider **linking** UI/API (**LMP-36**)
- Silent merge by email
- Client repo changes / Jira Done / Accept without human decision
- Weakening ADR-019 session rules or ADR-020 phone OTP

---

## 13. Implementation prerequisites (after Accept + Phase B auth)

1. Human Approves **U7** create policy and Email OTP numbers.
2. Docs ADR merge authorization (separate from Accept).
3. Phase B: Apple/Google verify services, EmailOtpService + MailSender, routes, OpenAPI **0.6.0**, tests (token fixtures, concurrent create, anti-enum, mint rollback).
4. Legal published notice catalog before staging/prod personal data.
5. Ops gates for Apple/Google client IDs and production email delivery.

---

## 14. Consequences

**Positive:** Completes F-031 multi-provider surface on the same parent/session spine; reuses ADR-019/020 patterns; keeps vendors out of SoR.

**Negative / follow-ups:** U7 must be chosen before coding; email abuse differs from SMS economics; Apple private relay and missing-name edge cases need client UX; linking deferred to LMP-36 may frustrate users who expect email-matched accounts to unify automatically — product must communicate explicitly.

---

## 15. References

- Blueprint F-031, §29, §36.2
- ADR-019, ADR-020
- `parent_identities`, `profile_drafts` schema on `main`
- Privacy catalog: `docs/privacy-notice-catalog.md`
