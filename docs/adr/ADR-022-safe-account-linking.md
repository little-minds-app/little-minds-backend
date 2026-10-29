# ADR-022 — Safe explicit account linking & collision handling

| Field | Value |
|---|---|
| **Status** | **Implemented (linking core)** under Blueprint §29.1 + ADR-019/020/021 invariants. **Deferred** items require separate architecture Accept before implementation. |
| **Date** | 2026-10-29 |
| **Jira** | [LMP-36](https://little-minds-app.atlassian.net/browse/LMP-36) (Epic [LMP-7](https://little-minds-app.atlassian.net/browse/LMP-7), `seq-018`) |
| **Blueprint** | F-001, F-031 · §29.1 · §29.4 · §38.2 ownership |
| **Depends on** | ADR-019, ADR-020, ADR-021 (**Accepted**) |
| **Companion sketch** | [`lmp-36-account-linking-api-contract-sketch.md`](./lmp-36-account-linking-api-contract-sketch.md) |
| **Live OpenAPI** | **`0.7.0`** (`POST /v1/auth/identities/link`) |

> **Decision (derived, no silent merge):** Explicit linking attaches a freshly verified provider subject to the **authenticated** parent only. Email/name/phone are never merge keys. Collision cases A–E halt without disclosing another family. Unlink APIs and recovery-case ownership are **not** accepted here — document for architecture review.

---

## 1. Context

LMP-35 forbids silent cross-provider email link and defers explicit linking to LMP-36. Blueprint §29.1 requires:

- Existing signed-in parents can explicitly link another provider after fresh authentication and verification of the new credential.
- Do **not** silently merge on matching email, phone, or name.
- On collision, halt and offer safe support/recovery; protect subscriptions and child ownership.
- `POST /v1/auth/identities/link` — authenticated, step-up required.
- Restricted `account_link_audit` persistence.

ADR-019/020/021 do **not** Accept unlink semantics, recovery-case ownership, or re-link of historically unlinked subjects.

---

## 2. Accepted for this implementation (derived)

| Topic | Decision |
|---|---|
| Entry | `POST /v1/auth/identities/link` with Bearer access (active session) |
| Step-up | Fresh provider proof only (Apple/Google verify; email/phone OTP consume). No email/name/phone inference |
| Canonical id | `parent_accounts.id` unchanged |
| Unique key | `(provider, provider_subject)` — unchanged |
| Success | Attach identity to authenticated parent; preserve parent id |
| Audit | `account_link_audits` with hashed subject; no raw PII; no public read API |
| OpenAPI | Additive **`0.7.0`** |

### Collision cases A–E

| Case | Condition | Outcome |
|---|---|---|
| **A** | No row for `(provider, subject)` | Create identity on authenticated parent; audit `linked` |
| **B** | Active row already on **same** parent | Idempotent `200`; `already_linked=true`; audit `already_linked` |
| **C** | Active row on **different** parent | `409 identity_collision`; audit `collision_other_parent`; never return other `parent_id` |
| **D** | Row exists with `unlinked_at` set | `409 identity_collision`; audit `collision_unlinked`; **no silent relink** (recovery deferred) |
| **E** | Concurrent create / unique race after advisory lock | One winner (A/B); loser `409`; audit `collision_race` |

Concurrency: same `pg_advisory_xact_lock` key family as `IdentityResolveService` (`identity:provider:subject`).

---

## 3. Deferred — architecture review required

| Topic | Why deferred |
|---|---|
| **Unlink** (`unlinked_at` write path / public unlink API) | ADR-019/020/021 do not Accept unlink rules (last-provider, step-up, entitlement impact) |
| **Re-link of unlinked subjects** | Case D currently fails closed; reclaim policy needs Accept |
| **`account_recovery_cases`** | Blueprint lists the entity; ownership / support RBAC / disclosure rules not Accepted |
| **Phone change / SIM-swap recovery UX** | ADR-020 **U18** still deferred |
| **Account merge of any kind** | Forbidden by invariant; remains forbidden |
| **Client ADR index sync** | Separate client PR |

Until Accept: collisions halt with uniform `identity_collision`; product may route users to human support **without** automated recovery that could expose another family.

---

## 4. Non-goals

- Client repo changes; real Apple/Google/SMS/email providers
- Silent merge; Firebase/Auth0 as SoR
- Jira Done / merge without human code review
- Public audit or recovery admin APIs in this PR

---

## 5. Consequences

**Positive:** Stable parent id preserved; explicit link path with real PG race tests; privacy-safe audit; fail-closed collisions.

**Negative / follow-ups:** Case D blocks re-link until recovery policy Accept; unlink unavailable; support playbooks still need human design.
