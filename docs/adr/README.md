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

## Proposed (human review required — not normative yet)

| ADR | Title | Jira | Notes |
|---|---|---|---|
| **ADR-019** | Parent identity & secure session lifecycle | [LMP-33](https://little-minds-app.atlassian.net/browse/LMP-33) | Completes ADR-002 *implementation/security design* gap. **Do not implement** auth/session code until Accepted. Full text: [`ADR-019-parent-identity-secure-session-lifecycle.md`](./ADR-019-parent-identity-secure-session-lifecycle.md). API sketch (non-live): [`lmp-33-session-api-contract-sketch.md`](./lmp-33-session-api-contract-sketch.md). After Accept, sync the client ADR index (ADR-014). |

---

## LMP-19 doc tests

Structure checks: `scripts/check-lmp19-docs.sh` (backend pointer checks). Client runs the fuller matrix suite against the canonical docs.
