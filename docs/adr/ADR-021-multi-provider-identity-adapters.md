# ADR-021 — Multi-provider parent identity (Apple, Google, Email OTP)

| Field | Value |
|---|---|
| **Status** | **Proposed** — architecture proposal for human review. **Not Accepted.** No runtime implementation authorized by this docs PR. |
| **Date** | 2026-10-28 (hardened review revision) |
| **Jira** | [LMP-35](https://little-minds-app.atlassian.net/browse/LMP-35) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-017`) |
| **Blueprint** | F-031 · §12 Auth · §13.1 / §29 · §31.1 / ADR-002 · §31.4 privacy · §36.2 Apple name draft · §38 ownership |
| **Depends on** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) (**Accepted**) — sole session mint port · [ADR-020](./ADR-020-gsm-otp-sign-in.md) (**Accepted**) — OTP / notice / delivery-gating patterns for Email OTP |
| **Repos** | `little-minds-backend` only. Client ADR index sync = separate client PR (deferred process) |
| **Companion sketch** | [`lmp-35-multi-provider-api-contract-sketch.md`](./lmp-35-multi-provider-api-contract-sketch.md) (non-live; live OpenAPI stays **`0.5.0`** until a future implementation PR proposes **`0.6.0`**) |

> **Decision pending:** This ADR proposes Apple ID token verification, Google ID token verification, and Email OTP adapters that resolve to the same canonical `parent_accounts.id` via `parent_identities`, minting sessions only through ADR-019 `SessionIssuerService` / `mintSessionTx`. **Recommended first-time create policy: U7 Option A** (auto-create, phone parity) — **still Proposed until human Accept**. **No silent email-based linking** in LMP-35; **LMP-36** owns explicit linking. Paid providers and production email delivery remain gated.

---

## 1. Context

LMP-34 delivered GSM OTP (`phone` provider) on `main`. Blueprint **F-031** and §29 require Day-1 mobile support for **Sign in with Apple**, **Google Sign-In**, and **email OTP**, each resolving to the same parent account model after verified identity — without using provider IDs or email as the database primary key.

**On `main` (post LMP-34):** `SessionIssuerService` + `mintSessionTx`; `parent_identities` unique on `(provider, provider_subject)`; phone OTP + privacy Option A; OpenAPI **`0.5.0`**.

This docs PR proposes architecture only. It does **not** implement adapters, migrations, SDKs, live OpenAPI paths, or Accept.

---

## 2. Mandatory architecture (proposed)

Little Minds **owns** identity verification outcomes, parent resolution, and session issuance.

| Provider | LM owns | External role |
|---|---|---|
| **Apple** | Full ID token cryptographic verification (§4); map verified `sub` → identity | Apple issues ID token; **not** session SoR |
| **Google** | Full ID token cryptographic verification (§5); map verified `sub` → identity | Google issues ID token; **not** session SoR |
| **Email OTP** | OTP generate/hash/verify; challenges; durable abuse; delivery gating | **MailSender** delivery-only (Mailpit local; production SMTP **unapproved**) |

**Rejected as identity / session SoR:** Firebase Authentication, Auth0-as-SoR, Cognito, “verify and mint our sessions” products. Vendor libraries may assist JWKS/SMTP only.

```text
NestJS IdentityModule
  +-- AppleIdentityService   (mandatory claim/JWKS/nonce checks → sub)
  +-- GoogleIdentityService  (mandatory claim/JWKS/nonce checks → sub)
  +-- EmailOtpService        (LM OTP + MailSender; deliveryState gating)
  +-- IdentityResolveService (provider+subject → parent; NO silent merge)
  v
SessionIssuerService.mintSessionTx  (ADR-019 only)
```

Canonical key: **`parent_accounts.id`**. Never use Apple/Google `sub`, email, or phone as PK.

**Reject unverified client identities:** any email, name, or `sub` supplied by the client **outside** a successfully verified ID token (or outside LM Email OTP verify) MUST be ignored for identity binding. Client claims are never authoritative.

---

## 3. Ownership vs adjacent work

| Concern | Owner |
|---|---|
| Sessions / refresh / logout / guards | ADR-019 / LMP-33 |
| GSM OTP | ADR-020 / LMP-34 |
| Apple / Google / Email OTP adapters | **LMP-35** (this ADR) |
| Explicit account **linking** / recovery | **LMP-36** — **out of LMP-35** |
| Phone change | ADR-020 U18 deferred |
| Web cookies / admin MFA | LMP-38 / LMP-65 |

---

## 4. Apple ID token verification (proposed — precise)

### 4.1 Flow

1. Client obtains Apple **ID token** (JWT) via Sign in with Apple.
2. Client requests a **server nonce** (or presents a client nonce that was pre-registered) — see §4.3.
3. `POST /v1/auth/apple` sends `id_token` + `nonce` + notice fields + optional device/surface.
4. Server performs **all** checks in §4.2; on success, `provider='apple'`, `provider_subject=sub`.
5. Resolve/create per **U7 Option A (recommended)** → `mintSessionTx` → TokenPair.

### 4.2 Mandatory verification checks

| Check | Rule | Fail mode |
|---|---|---|
| JWT parse | Compact JWS; reject non-JWT / truncated | `401 invalid_token` (uniform) |
| `typ` / header | Reject unexpected critical headers; alg must be asymmetric allowed by Apple (e.g. `RS256`); **reject `none` / HS\*** | `401 invalid_token` |
| JWKS | Fetch/cache Apple JWKS; resolve `kid`; signature verify | Config missing staging/prod → **boot/request fail-closed**; bad sig → `401` |
| `iss` | Exact allowlist (Apple issuer URL(s) current at implement time) | `401` |
| `aud` | Exact match configured Services ID / bundle audience allowlist | `401` |
| `exp` | `exp > now` with clock skew ≤ **±60 s** (proposed) | `401` |
| `iat` | Present; `iat ≤ now + skew`; reject absurdly old `iat` beyond max token age (propose **10 min** from `iat`) | `401` |
| `sub` | Non-empty string; used as sole provider subject | Missing → `401` |
| `nonce` | **Mandatory**; must equal server-recorded unused nonce (§4.3) | Missing/mismatch → `401` |
| Replay | Consume nonce atomically on success; reuse → `401` | |
| Email claim | Optional contact only; **never** identity key; never merge | Ignore for binding |

**Never:** accept Apple user identifier, email, or name from client body fields as substitutes for verified token claims.

### 4.3 Nonce (mandatory) + replay

- Server issues short-lived nonce (propose TTL **10 min**) bound to coarse client context OR accepts client nonce registered via a dedicated one-time bind before auth — **implementation may choose one pattern; nonce MUST be mandatory either way**.
- Store nonce hash server-side; mark **consumed** in same txn as successful auth (or immediately before mint) so concurrent replays single-winner fail.
- Apple token `nonce` claim MUST match (Apple’s documented hash form if applicable — implement against current Apple Sign in with Apple token docs).

### 4.4 Apple-specific notes

- Private relay email → optional minimized `verifiedContact` only; **not** a merge key.
- First-auth name → `profile_drafts` (§36.2); never log raw Apple payloads.
- Staging/prod: missing JWKS URL / audience / key config → **fail closed** at boot or first request (no soft-skip verify).

---

## 5. Google ID token verification (proposed — precise)

Symmetric mandatory matrix to Apple:

| Check | Rule | Fail mode |
|---|---|---|
| Alg / header | Asymmetric per Google; reject `none` / HS\* | `401 invalid_token` |
| JWKS | Google JWKS + `kid` + signature | Fail-closed if config missing |
| `iss` | Exact allowlist (`accounts.google.com` / `https://accounts.google.com` as documented) | `401` |
| `aud` | Exact OAuth client ID allowlist (iOS/Android/web as configured) | `401` |
| `exp` / `iat` | Same skew **±60 s**; max age from `iat` **10 min** (proposed) | `401` |
| `sub` | Sole provider subject | Missing → `401` |
| `nonce` | **Mandatory** + replay consume (same as §4.3) | `401` |
| `email_verified` | If storing email contact, require `true`; still **not** merge key | |

**Forbidden:** Firebase session cookies, Firebase Admin custom tokens, or client-supplied Google `sub`/email as identity without ID token verify.

---

## 6. Email normalization — deterministic versioned algorithm (proposed)

### 6.1 Algorithm ID: `email_norm_v1`

All Email OTP subject keys MUST use this exact pipeline. Changing rules requires **`email_norm_v2`** + migration/dual-read plan — never silent drift.

| Step | Rule |
|---|---|
| 1. Type | Reject non-string / empty after trim |
| 2. Trim | Strip leading/trailing Unicode whitespace |
| 3. Length | Reject if UTF-8 byte length ∉ **[3, 320]** (propose) |
| 4. Syntax | Single `@`; non-empty local + domain; reject spaces/control chars; basic RFC 5321-inspired structural check (not full RFC acceptance of every obsolete form) |
| 5. IDN | Domain → ASCII via IDNA / UTS #46 (**punycode**); reject domains that fail IDNA |
| 6. Case | Lowercase **local-part and domain** with Unicode case-fold suitable for identifiers (document ICU/JS `toLowerCase` choice in Phase B; must be stable across runtimes) |
| 7. Plus tags | **Preserve** `+` and following tag in local-part as **distinct** subjects |
| 8. Provider collapse | **Forbidden** in v1 — do **not** strip Gmail dots, map `googlemail.com`→`gmail.com`, or apply other provider-specific alias collapse |
| 9. Output | Canonical string `local@domain` used **only** as HMAC input |

### 6.2 Subject key

```text
provider_subject = HMAC-SHA256(EMAIL_SUBJECT_PEPPER, "email_norm_v1|" || canonical_email)
```

Pepper distinct from refresh / phone / OTP peppers. Include algorithm version prefix in HMAC message so v2 cannot collide silently.

### 6.3 Normative test cases (Phase B must implement)

| Input | `email_norm_v1` result |
|---|---|
| `  User@Example.COM ` | `user@example.com` |
| `user+tag@example.com` | `user+tag@example.com` (distinct from `user@example.com`) |
| `u.s.er@gmail.com` | `u.s.er@gmail.com` (**no** dot-strip) |
| `user@bücher.de` (IDN) | `user@xn--bcher-kva.de` (or current UTS #46 equivalent — pin in tests) |
| `not-an-email` / `@x` / `a@` / empty | **reject** |
| length > 320 | **reject** |
| `user@EXAMPLE.com` vs `USER@example.com` | **same** canonical → same HMAC |

Anti-enum: normalization failures → uniform `400 invalid_request` (same as other invalid email shapes).

---

## 7. Email OTP security parameters (proposed — concrete)

### 7.1 Invariants vs operational thresholds

| Class | Meaning | Change policy |
|---|---|---|
| **Invariant** | Security property that must not be weakened without new ADR Accept | e.g. LM-owned OTP; no plaintext OTP at rest; verify only after durable send; no silent merge; HMAC subject; mandatory token checks |
| **Operational threshold** | Numeric limit tunable with security review | e.g. 15m/24h send caps; may tighten without ADR; **loosening** requires documented review |

### 7.2 Proposed numbers (Email)

| Limit | Value | Class |
|---|---|---|
| OTP format | **6-digit** CSPRNG | Invariant family (match phone) |
| OTP TTL | **600 s** absolute | Operational (email latency) |
| Resend cooldown | **60 s** | Operational |
| Wrong attempts / challenge | **5** then lock | Operational |
| Email sends / subject / 15 min | **3** | Operational |
| Email sends / subject / 24 h | **10** | Operational |
| Email sends / IP / 15 min | **10** | Operational |
| Email sends / IP / 24 h | **40** | Operational |
| Verify requests / IP / min | **10** | Operational |
| Global email sends / day (planning) | **2000** candidate — **not** production enablement | Gate |

Phone SMS limits remain as **Accepted** in ADR-020 (unchanged).

### 7.3 Durable counters + delivery gating

- Prefer **PostgreSQL atomic counters** (subject / IP / global), multi-replica safe — same preference as ADR-020 §8.1.
- **Never** hold advisory/row locks across `MailSender` I/O.
- Challenge commit → send outside txn → persist delivery attempt → mark `deliveryState=sent` only on adapter accept.
- **Verify authorized only if** `status=pending` **and** `deliveryState=sent` (parity with LMP-34 phone gate). `pending_send` / `failed` → uniform `otp_invalid`.
- Adapter accept + post-send persist failure → **no auto-resend** / no duplicate billable send; `503 mail_unavailable`; stale `pending_send` supersede window (propose **90 s**, parity phone).
- Fake/Mailpit retrieval: test harness only; fail-closed if resolved in staging/production.

Reuse `otp_challenges` with `provider='email'` (or dedicated table — implementation choice). Retention FK-safe per ADR-020 U16.

---

## 8. Identity resolution (proposed)

### 8.1 Lookup

1. Active `parent_identities` by `(provider, provider_subject)`.
2. Found + parent active → sign-in via `mintSessionTx`.
3. Found + parent deleted/non-active → uniform auth failure.
4. Not found → **U7 Option A (recommended)**: create parent + identity + notice evidence + mint in one txn.

### 8.2 No silent merge / no silent email link

**Forbidden in LMP-35 (invariant):**

- Auto-link Apple ↔ Google ↔ email ↔ phone because emails match
- Treat `verifiedContact` as global unique identity
- “Account exists with this email — signed you into the other provider”

**LMP-36** owns explicit, authenticated linking UX/API and collision tests.

### 8.3 U7 — First-time create

| Option | Behavior | Status |
|---|---|---|
| **A — Auto-create** | Unknown subject → create parent + identity (+ notice) + mint | **Recommended** — pending human **Accept** |
| B — Explicit registration | Unknown → uniform failure / register flow | Alternative |
| C — Hybrid | Asymmetric by provider | Alternative (discouraged) |

Until Accept, Phase B MUST NOT start. Recommendation is **A** for parity with ADR-020 phone U7.

---

## 9. Privacy (proposed)

- Notice ≠ ToS ≠ optional consent.
- Present notice before email collect / Apple|Google credential submit.
- Email **start**: Option A `notice_version` + `notice_locale`.
- Apple/Google: same uniform notice fields on auth request (anti-enum).
- Verify / token paths: **no** privacy field branching by new vs existing.
- Catalog: staging/prod require **that exact** entry `published: true`.
- Legal review before production personal-data processing.

---

## 10. Session mint / transactions (proposed)

```text
BEGIN
  resolve or create parent + identity (+ notice if new)  // U7 A recommended
  [email: consume challenge after deliveryState=sent checks]
  mintSessionTx(tx, …)
COMMIT
sign JWT post-commit  // no rollback — ADR-019/020 client guidance
```

Concurrent first create: unique `(provider, provider_subject)` single-winner. JWKS/MailSender outside long lock holds.

---

## 11. Decision matrix (U*) — unambiguous security-critical items

Legend: **Proposed (security-critical)** = must not weaken without explicit Accept; **Recommended pending Accept** = product choice locked as recommendation; **Deferred** / **Gate** as labeled.

| ID | Topic | Classification | Decision text |
|---|---|---|---|
| **Arch** | SoR / adapters | **Proposed (security-critical)** | LM verifies Apple/Google ID tokens; LM owns Email OTP; MailSender delivery-only; **no** Firebase/Auth0/Cognito SoR |
| **U1** | Canonical ID | **Proposed (security-critical)** | `parent_accounts.id` only; identities via `(provider, provider_subject)` |
| **U2** | Apple subject | **Proposed (security-critical)** | Verified Apple `sub` only |
| **U3** | Google subject | **Proposed (security-critical)** | Verified Google `sub` only |
| **U4** | Email subject | **Proposed (security-critical)** | `HMAC(EMAIL_SUBJECT_PEPPER, "email_norm_v1\|" \|\| canonical)` |
| **U5** | Email normalization | **Proposed (security-critical)** | **`email_norm_v1`** §6 — trim/syntax/len/IDN/case/plus-preserve; **no** provider collapse |
| **U6** | Silent merge / email link | **Proposed (security-critical)** | **Forbidden** in LMP-35 |
| **U7** | First-time create | **Recommended pending Accept** | **Option A** auto-create (phone parity); B/C alternatives documented — **Accept required before Phase B** |
| **U8** | Account linking | **Deferred** | **LMP-36 only** |
| **U9** | mintSessionTx | **Proposed (security-critical)** | Mandatory on all success paths |
| **U10** | Privacy Option A | **Proposed** | Uniform notice fields; no verify privacy oracle |
| **U11** | Email OTP format | **Proposed (security-critical)** | 6-digit CSPRNG; hashed at rest |
| **U12** | Email OTP TTL | **Proposed** | **600 s** |
| **U13** | Cooldown / attempts | **Proposed** | **60 s** / **5** wrong |
| **U14** | Email rate limits | **Proposed** | Durable PG counters; §7.2 numbers |
| **U15** | Delivery gating | **Proposed (security-critical)** | Verify only `deliveryState=sent`; no auto-resend on persist failure; MailSender outside locks |
| **U16** | Token verify matrix | **Proposed (security-critical)** | §4–§5 iss/aud/JWKS/exp/iat/skew/typ/nonce+replay; reject client-supplied identities |
| **U17** | Anti-enumeration | **Proposed (security-critical)** | Uniform errors; no existence oracle |
| **U18** | OpenAPI | **Proposed** | Impl bump **`0.6.0`**; this PR keeps **`0.5.0`** |
| **U19** | Apple name draft | **Proposed** | `profile_drafts` / §36.2 |
| **U20** | Client ADR sync | **Deferred process** | Separate client PR |
| **U21** | Nonce mandatory | **Proposed (security-critical)** | Apple + Google nonce required + single-use replay protection |
| **U22** | Paid / prod email / Apple&Google ops | **Production gate** | Not authorized by docs Accept alone |
| **MailSender** | Local vs prod | **Proposed** | Mailpit/fake local; production SMTP **unapproved** |

---

## 12. Non-goals

- Runtime / migrations / live OpenAPI paths / SDKs in this PR
- Accept without human decision; merge; Jira Done; client repo
- Silent merge or LMP-36 linking APIs
- Firebase SoR; weakening ADR-019/020
- Provider-specific email alias collapse in `email_norm_v1`

---

## 13. Implementation prerequisites (after Accept + Phase B auth)

1. Human **Accept** including **U7 Option A** (or documented alternative) and §7/§11 security-critical rows.
2. Docs merge authorization.
3. Phase B: verification services, EmailOtpService, MailSender, routes, OpenAPI **0.6.0**, tests (JWKS fixtures, nonce replay, `email_norm_v1` table, delivery gating, concurrent create, mint rollback).
4. Legal published notice; ops Apple/Google audiences; production email gate.

---

## 14. Consequences

**Positive:** Precise verify/normalization/OTP gates reduce account-takeover and alias-abuse ambiguity; clear LMP-35 vs LMP-36 boundary.

**Negative / follow-ups:** Plus-tag preserve increases account sprawl vs Gmail UX expectations — product copy must explain; linking deferred to LMP-36; nonce UX adds a round-trip or pre-bind step.

---

## 15. References

- Blueprint F-031, §29, §36.2
- ADR-019, ADR-020 (incl. delivery gating / ambiguous send)
- `parent_identities`, `profile_drafts`
- `docs/privacy-notice-catalog.md`
