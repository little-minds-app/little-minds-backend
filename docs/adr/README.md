# Architecture Decision Records — Backend Pointer (LMP-19)

**Role of this file:** Backend **reference/pointer** only (ADR-014 discoverability).  
**Canonical ADR index:** client repo  
[`little-minds-app/little-minds-client` → `docs/adr/README.md`](https://github.com/little-minds-app/little-minds-client/blob/main/docs/adr/README.md)

**Normative text:** Product Blueprint `docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md` (identical intent across client + backend; do not diverge).  
**Companion pointers:** [Device support matrix](../device-support-matrix.md) · [Staging isolation](../environments-staging-isolation.md)

Normative ADR/index edits land in the **client** first; this backend file stays a short discoverability mirror.

---

## Status labels

| Status | Meaning |
|---|---|
| **Approved / Accepted** | Normative for implementation |
| **Resolved direction** | Architecture direction fixed; detail work remains |
| **Open** | Must be decided before or during related implementation |

---

## Approved / Accepted ADRs

| ADR | Title | Blueprint | Boundary summary |
|---|---|---|---|
| **ADR-013** | Cost-aware pluggable observability | §31 | Core error capture always on; optional vendors/adapters OFF by default; no child PII in telemetry |
| **ADR-014** | Separate client & backend repos | §32 | Two private repos; one Jira LMP; pinned OpenAPI; **no diverging Blueprint copies** |
| **ADR-015** | AI content only; developer-owned mechanics | §33 | AI may generate content data; must not generate executable game code in V1 |
| **ADR-016** | Multi-device offline screen time & entitlements | §35 | Trusted time / single-active-device / offline entitlement boundaries |
| **ADR-017** | Pedagogical metrics, PII lifecycle, cache & events | §36 | Pedagogy firewall; no performance-derived punitive difficulty; PII lifecycle |
| **ADR-018** | Screen orientation policy | §40 | **LOCKED** surface orientation table; F-034 phone+tablet Day-1 unchanged; state preservation; QA-UI-001 orientation coverage |

### ADR-018 quick reference (**LOCKED**)

| Surface | Policy |
|---|---|
| Child Hub; educational mini-games; game results/rewards; child profile selection | Landscape-only |
| Native Parent Gate & Parent Settings | Portrait + landscape |
| Next.js Parent Dashboard | Responsive; no orientation lock |

---

## Resolved direction / open queue

See the [canonical client ADR index](https://github.com/little-minds-app/little-minds-client/blob/main/docs/adr/README.md) for ADR-002 resolved direction and the open ADR queue (`ADR-001`, `ADR-003`–`ADR-012`). Agents must **not** silently close open ADRs or contradict Approved ADRs.

---

## ADR-019 — Accepted security design

| ADR | Title | Jira | Notes |
|---|---|---|---|
| **ADR-019 (Accepted 2026-10-28)** | Parent identity & secure session lifecycle | [LMP-33](https://little-minds-app.atlassian.net/browse/LMP-33) | Completes ADR-002 session implementation/security gap. U1–U15 resolved; bounded hash history (max 8) is an accepted detection limit. [Decision](./ADR-019-parent-identity-secure-session-lifecycle.md) · [Non-live API sketch](./lmp-33-session-api-contract-sketch.md). Implementation merged; client ADR index sync remains a separate client PR. |

## ADR-020 — Proposed (awaiting Accept)

| ADR | Title | Jira | Notes |
|---|---|---|---|
| **ADR-020 (Proposed)** | GSM OTP sign-in — LM-owned OTP + delivery-only SMS adapters | [LMP-34](https://little-minds-app.atlassian.net/browse/LMP-34) | **Selected:** LM-owned OTP; delivery-only SMS; **U7 Option A**. **Recommended:** KVKK notice≠consent; challenge-bound notice at start; uniform verify (no existence oracle). **Proposed/deferred:** U1–U6, U8–U20. [Decision](./ADR-020-gsm-otp-sign-in.md) · [Sketch](./lmp-34-otp-api-contract-sketch.md). Docs-only; OpenAPI `0.4.0`. |

---

## LMP-19 doc tests

Structure checks: `scripts/check-lmp19-docs.sh` (backend pointer checks). Client runs the fuller matrix suite against the canonical docs.
