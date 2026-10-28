# ADR-021 — Multi-provider parent identity (Apple, Google, Email OTP)

| Field | Value |
|---|---|
| **Status** | **Accepted** — explicit Little Minds Product Owner approval on **2026-10-28**; implementation may proceed only in a **separate** Phase B PR after this docs PR is human-authorized to **merge** |
| **Date** | 2026-10-28 (Accept recorded) |
| **Jira** | [LMP-35](https://little-minds-app.atlassian.net/browse/LMP-35) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-017`) |
| **Blueprint** | F-031 · §12 Auth · §13.1 / §29 · §31.1 / ADR-002 · §31.4 privacy · §36.2 Apple name draft · §38 ownership |
| **Depends on** | [ADR-019](./ADR-019-parent-identity-secure-session-lifecycle.md) (**Accepted**) — sole session mint port · [ADR-020](./ADR-020-gsm-otp-sign-in.md) (**Accepted**) — OTP / notice / delivery-gating patterns for Email OTP |
| **Repos** | `little-minds-backend` only. Client ADR index sync = separate client PR (deferred process) |
| **Companion sketch** | [`lmp-35-multi-provider-api-contract-sketch.md`](./lmp-35-multi-provider-api-contract-sketch.md) (live OpenAPI **`0.6.0`** via Phase B implementation) |

> **Decision:** Human Accepted ADR-021 on 2026-10-28: architecture; **U7 Option A**; Apple **mandatory nonce + JWKS** ID-token verify; Google **prefer nonce** (e.g. iOS 9+) else **authorization-code + PKCE only** (no weak ID-token-without-nonce fallback; fail-closed); **`email_norm_v1`** (preserve local-part case; reject Unicode local; no provider collapse); Email OTP limits **3/10 subject**, **10/40 IP**, **2000/day** unactivated ceiling; verify only **`deliveryState=sent`**; no silent email link (**LMP-36** owns linking). Paid providers / production email remain **unapproved**. **Phase B is not authorized** by Accept alone — requires human merge of this docs PR + separate Phase B kickoff. No Jira Done from this docs PR.

---

## 1. Context

LMP-34 delivered GSM OTP (`phone`) on `main`. Blueprint **F-031** / §29 require Apple, Google, and email OTP on the same canonical parent model.

**On `main`:** `mintSessionTx`; `parent_identities`; phone OTP + privacy Option A; OpenAPI **`0.5.0`**.

This docs PR records **Accept**. It does **not** implement runtime, migrations, SDKs, or live OpenAPI paths, and does **not** merge itself.

---

## 2. Mandatory architecture (**Accepted**)

Little Minds **owns** identity verification outcomes, parent resolution, and session issuance.

| Provider | LM owns | External role |
|---|---|---|
| **Apple** | Full ID token verify (§4): JWKS + **mandatory nonce** | Apple issues ID token; **not** session SoR |
| **Google** | Prefer ID token + nonce; else **auth-code + PKCE** only (§5) | Google issues tokens; **not** session SoR |
| **Email OTP** | OTP generate/hash/verify; durable abuse; **deliveryState=sent** gate | **MailSender** delivery-only (Mailpit local; production SMTP **unapproved**) |

**Rejected as SoR:** Firebase Authentication, Auth0-as-SoR, Cognito, hosted “verify and mint our sessions”.

```text
NestJS IdentityModule
  +-- AppleIdentityService   (JWKS + mandatory nonce → sub)
  +-- GoogleIdentityService  (nonce ID-token OR auth-code+PKCE → sub)
  +-- EmailOtpService        (LM OTP + MailSender; deliveryState=sent)
  +-- IdentityResolveService (NO silent merge; U7 Option A)
  v
SessionIssuerService.mintSessionTx  (ADR-019 only)
```

Canonical key: **`parent_accounts.id`**. Never use Apple/Google `sub`, email, or phone as PK.

**Reject unverified client identities:** email/name/`sub` from the client body outside a successful Apple/Google verify or Email OTP verify MUST NOT bind identity.

---

## 3. Ownership vs adjacent work

| Concern | Owner |
|---|---|
| Sessions / refresh / logout / guards | ADR-019 / LMP-33 |
| GSM OTP | ADR-020 / LMP-34 |
| Apple / Google / Email OTP adapters | **LMP-35** (this ADR) |
| Explicit account **linking** / recovery | **LMP-36** — out of LMP-35 |
| Phone change | ADR-020 U18 deferred |
| Web cookies / admin MFA | LMP-38 / LMP-65 |

---

## 4. Apple ID token verification (**Accepted**)

### 4.1 Flow

1. Client obtains Apple ID token via Sign in with Apple.
2. Client holds a **server-issued or pre-registered nonce** (mandatory).
3. `POST /v1/auth/apple` sends `id_token` + `nonce` + notice fields.
4. Server runs §4.2; `provider='apple'`, `provider_subject=sub`.
5. **U7 Option A:** resolve or create → `mintSessionTx` → TokenPair.

### 4.2 Mandatory checks

| Check | Rule | Fail |
|---|---|---|
| JWT / alg | Compact JWS; asymmetric (e.g. RS256); reject `none` / HS\* | `401 invalid_token` |
| JWKS | Apple JWKS + `kid` + signature; staging/prod config **fail-closed** | `401` / boot fail |
| `iss` | Exact Apple issuer allowlist | `401` |
| `aud` | Exact Services ID / audience allowlist | `401` |
| `exp` / `iat` | Skew ≤ **±60 s**; max age from `iat` **10 min** | `401` |
| `sub` | Non-empty; sole provider subject | `401` |
| `nonce` | **Mandatory**; match + **single-use consume** (replay → `401`) | `401` |

Never bind identity from client-supplied Apple user id / email / name fields.

### 4.3 Nonce + replay

Server nonce TTL propose **10 min**; consume atomically on success. Apple `nonce` claim must match (per Apple’s documented hash form at implement time).

### 4.4 Notes

Private relay email → optional `verifiedContact` only; **not** merge key. First-auth name → `profile_drafts` (§36.2). Never log raw Apple payloads.

---

## 5. Google verification (**Accepted**)

### 5.1 Path selection (fail-closed)

| Platform capability | Allowed path |
|---|---|
| Nonce available (e.g. **iOS 9+** Google Sign-In / platforms that can bind nonce) | **Preferred:** ID token + **mandatory nonce** + full JWKS/`iss`/`aud`/`exp`/`iat`/`sub` checks (same matrix as Apple §4.2 except Google issuers/audiences) |
| Nonce **not** available | **Only** authorization-code + **PKCE** server exchange → then verify resulting ID token via JWKS (iss/aud/exp/iat/sub). Auth-code must be exchanged **server-side** with PKCE verifier |
| Neither nonce nor auth-code+PKCE | **Reject** — **no** weak “ID token only without nonce” fallback |

**Forbidden:** accepting a Google ID token without nonce when the nonce path was required; accepting client-supplied `sub`/email; Firebase session cookies / Admin custom tokens as LM session SoR.

### 5.2 Auth-code + PKCE requirements

- PKCE `code_challenge` / `code_verifier` mandatory.
- Token endpoint response ID token still subject to JWKS + claim checks.
- Staging/prod: missing Google client IDs / JWKS / redirect config → **fail-closed**.

### 5.3 Subject

Verified Google `sub` → `provider='google'`. Email claim never merge key; if storing contact require `email_verified=true` when present.

---

## 6. Email normalization — `email_norm_v1` (**Accepted**)

Changing rules requires **`email_norm_v2`** + dual-read plan.

| Step | Rule |
|---|---|
| 1. Type | Reject non-string / empty after trim |
| 2. Trim | Leading/trailing Unicode whitespace |
| 3. Length | Reject UTF-8 byte length ∉ **[3, 320]** |
| 4. Syntax | Single `@`; non-empty local + domain; reject spaces/control chars |
| 5. Local-part charset | **ASCII only** — **reject Unicode** in local-part |
| 6. Local-part case | **Preserve** case (do **not** lowercase local-part) |
| 7. Domain | IDNA / UTS #46 → ASCII punycode; **lowercase** domain labels |
| 8. Plus tags | **Preserve** `+tag` as distinct subjects |
| 9. Provider collapse | **Forbidden** — no Gmail dot-strip, no `googlemail`→`gmail`, etc. |
| 10. Output | `local@domain` (local case-preserved; domain lower/punycode) |

### Subject key

```text
provider_subject = HMAC-SHA256(EMAIL_SUBJECT_PEPPER, "email_norm_v1|" || canonical_email)
```

### Normative tests (Phase B)

| Input | Result |
|---|---|
| `  User@Example.COM ` | `User@example.com` |
| `user+tag@example.com` | `user+tag@example.com` (≠ `user@example.com`) |
| `u.s.er@gmail.com` | `u.s.er@gmail.com` (no dot-strip) |
| `User@example.com` vs `user@example.com` | **Distinct** canonicals → distinct HMACs |
| Local with non-ASCII (e.g. `üser@example.com`) | **reject** |
| `user@bücher.de` | `user@xn--bcher-kva.de` (pin UTS #46 in tests) |
| Invalid / too long | **reject** → uniform `400 invalid_request` |

---

## 7. Email OTP parameters (**Accepted**)

### 7.1 Invariants vs operational thresholds

| Class | Meaning |
|---|---|
| **Invariant** | Must not weaken without new Accept (LM-owned OTP; hashed at rest; `deliveryState=sent` verify gate; no silent merge; `email_norm_v1`; HMAC subject) |
| **Operational threshold** | Numeric cap; tightening OK with review; loosening needs documented review |

### 7.2 Numbers

| Limit | Value | Class |
|---|---|---|
| OTP format | 6-digit CSPRNG | Invariant family |
| OTP TTL | **600 s** | Operational |
| Resend cooldown | **60 s** | Operational |
| Wrong attempts / challenge | **5** | Operational |
| Email sends / subject / 15 min | **3** | Operational |
| Email sends / subject / 24 h | **10** | Operational |
| Email sends / IP / 15 min | **10** | Operational |
| Email sends / IP / 24 h | **40** | Operational |
| Verify / IP / min | **10** | Operational |
| Global email / day (planning ceiling) | **2000** — **unactivated**; not production enablement | Gate |

### 7.3 Durable counters + delivery gating (**Accepted**)

- PostgreSQL atomic counters (multi-replica safe).
- SMS-style flow: commit challenge → MailSender outside locks → delivery attempt → mark **`deliveryState=sent`** only on adapter accept.
- **Verify only if** `status=pending` **and** `deliveryState=sent`. Else uniform `otp_invalid`.
- Post-send persist failure → **no auto-resend**; `503 mail_unavailable`; stale `pending_send` supersede ~**90 s**.
- Fake/Mailpit: test only; fail-closed staging/prod.

---

## 8. Identity resolution (**Accepted**)

1. Lookup `(provider, provider_subject)`.
2. Active parent → `mintSessionTx` sign-in.
3. Non-active / deleted → uniform auth failure.
4. Unknown → **U7 Option A (Accepted):** create parent + identity + notice evidence + mint in one txn.

**Forbidden (invariant):** silent merge / silent email link across providers. **LMP-36** owns explicit linking.

---

## 9. Privacy (**Accepted** engineering)

Option A notice fields on email start and Apple/Google auth; no verify privacy branching; server catalog; staging/prod require that exact entry `published: true`; legal review before production personal data; optional consent out of scope.

---

## 10. Session mint (**Accepted**)

All success paths use `mintSessionTx` in the same DB txn as identity create/consume. JWT post-commit (no rollback) — same client guidance as ADR-019/020.

---

## 11. Decision matrix (**Accepted** / Deferred / Gate)

| ID | Topic | Status | Decision |
|---|---|---|---|
| **Arch** | SoR / adapters | **Accepted** | LM verifies Apple/Google; LM Email OTP; MailSender delivery-only; no Firebase/Auth0 SoR |
| **U1** | Canonical ID | **Accepted** | `parent_accounts.id`; `(provider, provider_subject)` |
| **U2** | Apple subject | **Accepted** | Verified Apple `sub` |
| **U3** | Google subject | **Accepted** | Verified Google `sub` |
| **U4** | Email subject | **Accepted** | HMAC with `email_norm_v1\|` prefix |
| **U5** | Email normalization | **Accepted** | **`email_norm_v1`** §6 — preserve local case; reject Unicode local; no provider collapse |
| **U6** | Silent merge / email link | **Accepted** | **Forbidden** in LMP-35 |
| **U7** | First-time create | **Accepted** | **Option A** auto-create |
| **U8** | Account linking | **Deferred** | **LMP-36 only** |
| **U9** | mintSessionTx | **Accepted** | Mandatory |
| **U10** | Privacy Option A | **Accepted** (engineering) | Uniform notice fields; legal review before prod |
| **U11** | Email OTP format | **Accepted** | 6-digit CSPRNG |
| **U12** | Email OTP TTL | **Accepted** | **600 s** |
| **U13** | Cooldown / attempts | **Accepted** | **60 s** / **5** |
| **U14** | Email rate limits | **Accepted** | 3/10 subject; 10/40 IP; verify 10/min; 2000/day unactivated ceiling |
| **U15** | Delivery gating | **Accepted** | Verify only `deliveryState=sent`; no auto-resend |
| **U16** | Apple verify | **Accepted** | JWKS + **mandatory nonce** + claim matrix §4 |
| **U17** | Anti-enumeration | **Accepted** | Uniform errors |
| **U18** | OpenAPI | **Accepted** | Phase B publishes **`0.6.0`** |
| **U19** | Apple name draft | **Accepted** | `profile_drafts` / §36.2 |
| **U20** | Client ADR sync | **Deferred process** | Separate client PR |
| **U21** | Google path | **Accepted** | Prefer nonce ID-token; else **auth-code+PKCE only**; no weak ID-token-without-nonce; fail-closed |
| **U22** | Paid / prod email / ops | **Production gate** | Unapproved until separate authorization |
| **MailSender** | Local vs prod | **Accepted** | Mailpit/fake local; production SMTP unapproved |

---

## 12. Non-goals (this docs PR)

- Merge of this PR without separate human merge authorization
- Phase B runtime / migrations / live OpenAPI / SDKs
- Jira Done; client repo; LMP-36 linking; silent merge; Firebase SoR

---

## 13. Implementation prerequisites (Phase B — separate)

1. Human **merge** authorization for this Accepted docs PR.  
2. Separate Phase B kickoff.  
3. Implement Apple/Google/Email per §§4–8; OpenAPI **0.6.0**; tests (JWKS, nonce replay, Google PKCE path, `email_norm_v1`, delivery gating, U7 create, mint rollback).  
4. Legal published notice; ops Apple/Google config; production email gate.

---

## 14. Consequences

**Positive:** Clear Accept of create policy and verify paths; case-preserving email subjects reduce unexpected collisions; Google fail-closed avoids weak mobile paths.

**Negative / follow-ups:** Case-sensitive local-parts can surprise users; linking deferred to LMP-36; auth-code+PKCE path needs careful mobile UX.

---

## 15. References

- Blueprint F-031, §29, §36.2  
- ADR-019, ADR-020  
- `parent_identities`, `profile_drafts`  
- `docs/privacy-notice-catalog.md`
