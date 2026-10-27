# content/

Versioned learning and mentor content manifests (Blueprint §12.2).

**Ownership:** `little-minds-backend` is the canonical home for content JSON Schema and validation. Clients pin a backend commit and consume fixtures/schemas; they do not invent a parallel mentor-card contract.

## Parent Play Mentor cards (LMP-47 / F-009)

| Path | Role |
|---|---|
| `schemas/mentor-card/v1.schema.json` | Authoritative JSON Schema (`schema_version` `1.0.0`) |
| `schemas/mentor-card/VERSION` | Schema semver (must match `schema_version` const) |
| `fixtures/mentor-cards/near-far.*.v1.json` | Near/Far example cards (`en-US`, `tr-TR`) |
| `policies/mentor-card-safe-copy.md` | Adult supervision, non-coercive, no proof/photo rules |

Runtime / CI validation lives in `src/modules/mentor/` (Ajv + safe-copy).

```bash
npm run content:validate-mentor-cards
# or
npm test -- src/modules/mentor/
```

### Contract highlights

- Required caregiver sections: **why**, **how**, **what_to_say**, **safety**, **adaptations**
- Age applicability: `age_min_months` / `age_max_months` in **24–71** (inclusive); hard eligibility filter in code
- Locales: BCP-47 `xx-YY` field (V1 fixtures: `tr-TR`, `en-US`) — not a single hardcoded locale
- Extensibility: `extensions` object for additive forward-compatible keys within 1.x
- Schema VERSION **`1.0.0`** — clients pin a backend **commit SHA** + this version (never floating `main`)
- Near/Far fixtures stay `review_status: draft` (draft ≠ production catalog)
- Near/Far IDs match client `NearFarConstants` (`near_far_sock_soft_toy_v1`, `near_far_32m_v1`, `mentor_near_far_32m_adjacency_v1`)
- Out of scope here: LMP-48 UI, LMP-120 audio, OpenAPI `/v1/mentor/*` routes

See also: [`docs/mentor-card-content-contract.md`](../docs/mentor-card-content-contract.md).
