# Device Support Matrix — Backend Pointer (LMP-19)

**Jira:** [LMP-19](https://little-minds-app.atlassian.net/browse/LMP-19)  
**Epic:** [LMP-6](https://little-minds-app.atlassian.net/browse/LMP-6)  
**Role of this file:** Backend **reference/pointer** only (ADR-014 discoverability).  
**Canonical document:** client repo  
[`little-minds-app/little-minds-client` → `docs/device-support-matrix.md`](https://github.com/little-minds-app/little-minds-client/blob/main/docs/device-support-matrix.md)

Do **not** treat this backend file as the source of truth. Normative edits land in the **client** matrix first; keep this pointer in sync for links and LOCKED summaries.

**Local Blueprint:** `docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md`  
**Related pointers:** [ADR index](./adr/README.md) · [Staging isolation](./environments-staging-isolation.md)

---

## Legend

| Label | Meaning |
|---|---|
| **LOCKED** | Product / Blueprint decision. Do not reopen or weaken. |
| **TECHNICAL ASSUMPTION** | Proposed Day-1 engineering value. Needs Product Owner approval before treating as contract. Full proposals live in the **canonical client matrix**. |

---

## LOCKED (quick reference)

| ID | Decision | Source |
|---|---|---|
| L1 | **F-034** — Phone + tablet Day 1 mandatory (iPhone, iPad, Android phone, Android tablet). Stretch/center of phone UI on tablet does **not** satisfy the requirement. | Blueprint F-034, §39 |
| L2 | **ADR-018** orientation policy — see table below. | Blueprint §40 |
| L3 | Preserve app state across orientation transitions. | ADR-018 |
| L4 | QA-UI-001 covers relevant orientations; F-034 phone+tablet cases remain mandatory for UI work. | ADR-018, §28.9 |
| L5 | Staging isolation (**F-028** / §26.1) — see [environments-staging-isolation.md](./environments-staging-isolation.md). | F-028 |

### ADR-018 orientation (**LOCKED**)

| Surface | Orientation policy |
|---|---|
| Child Hub; educational mini-games; game results/rewards; child profile selection | Landscape-only |
| Native Parent Gate & Parent Settings | Portrait + landscape |
| Next.js Parent Dashboard | Responsive; no orientation lock |

### F-034 mobile cells (**LOCKED** form factors)

| Platform | Form factor |
|---|---|
| iOS | Phone |
| iOS | Tablet |
| Android | Phone |
| Android | Tablet |

---

## TECHNICAL ASSUMPTIONS — see canonical client doc

Min OS versions, adaptive breakpoints, CI viewport sizes, and physical QA device models are **TECHNICAL ASSUMPTION** values documented in the [canonical client matrix](https://github.com/little-minds-app/little-minds-client/blob/main/docs/device-support-matrix.md). They are **not** locked contracts until Product Owner approves. Do not copy those numbers into NestJS/API contracts as requirements from this pointer alone.

---

## LMP-19 testing note (backend)

This backend task ships documentation pointers + structure checks only. No NestJS application code. UI/widget orientation suites belong to client UI tasks.
