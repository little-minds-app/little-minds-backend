# Parent Play Mentor card content contract (LMP-47)

**Blueprint:** F-009 / E06 / §4.3–4.5 / §5.2 / §12.2  
**Schema:** [`content/schemas/mentor-card/v1.schema.json`](../content/schemas/mentor-card/v1.schema.json) (`1.0.0`)  
**Owner:** `little-minds-backend` (clients consume; do not fork the schema)

## Purpose

Define a versioned, extensible JSON document for Parent Play Mentor cards so catalog, review, localization, and (later) API serving share one validated shape.

## Required caregiver sections (LM-006)

| Section | Fields | Intent |
|---|---|---|
| Why | `why.summary`, `why.learning_intention` | Why this invitation fits |
| How | `how.prep_summary`, `how.steps` | Prep + steps |
| What to say | `what_to_say.before/during/after` | Scripts / prompts |
| Safety | `safety.constraints` + flags | Adult supervision; hazards |
| Adaptations | `adaptations[]` | Accessibility / constraint variants |

Blueprint §4.4 aliases `parent_script_before`, `parent_prompts_during`, `parent_prompts_after` must **match** the corresponding `what_to_say` arrays (validator enforces).

Also required: age band, domains/goals, timing estimates, materials, scaffold_down / extend_up, review_status, `observed_vs_suggested`, `not_a_developmental_assessment`.

## Safe copy (enforced in code)

Documented in [`content/policies/mentor-card-safe-copy.md`](../content/policies/mentor-card-safe-copy.md):

- Adult supervision required (flag + localized constraint text)
- No photographic/video proof requirements
- Non-coercive, non-diagnostic coaching language

## Locales

- Schema: `locale` pattern `^[a-z]{2}-[A-Z]{2}$` (extensible)
- V1 example fixtures: `en-US` and `tr-TR` for the same `mentor_card_id`

## Version compatibility + client pin strategy

- Schema file: `content/schemas/mentor-card/v1.schema.json`
- Schema semver file: `content/schemas/mentor-card/VERSION` → **`1.0.0`**
- Payload field `schema_version` must equal that VERSION (`const: "1.0.0"`)
- Unknown major versions fail with `schema.version_incompatible`
- Additive optional keys go under `extensions` within 1.x; new required fields need a schema bump

**How clients pin (do not import floating `main`):**

1. Choose a backend **git commit SHA** where this schema/VERSION/fixtures are the revision you need (prefer a reviewed merge commit; during parallel work, pin the LMP-47 PR head SHA).
2. Fetch that revision of `content/schemas/mentor-card/` + desired fixtures.
3. Record `BACKEND_MENTOR_CARD_SCHEMA_COMMIT=<sha>` and `BACKEND_MENTOR_CARD_SCHEMA_VERSION=1.0.0` (or equivalent pin file).
4. Bump the pin deliberately when adopting a new backend content-schema revision; regenerate/re-copy mirrors in the client repo.

## Near/Far example

| Locale | Fixture |
|---|---|
| en-US | `content/fixtures/mentor-cards/near-far.en-US.v1.json` |
| tr-TR | `content/fixtures/mentor-cards/near-far.tr-TR.v1.json` |

Canonical product example: Blueprint §5.2 near/far sock + soft toy mission; no proof/photo.

### Near/Far ID alignment (LMP-45/46 events)

Fixtures use the same strings as client `NearFarConstants` on `main`:

| Field | Canonical value |
|---|---|
| `mentor_card_id` | `mentor_near_far_32m_adjacency_v1` |
| `linked_activity_ids[]` | `near_far_32m_v1` |
| `linked_mission_ids[]` | `near_far_sock_soft_toy_v1` |
| age band | 30–35 months |

`review_status` on these example fixtures is **`draft`** — draft is **not** production-catalog eligible (`published` only).

## Non-goals

- Parent mobile/web mentor UI → **LMP-48**
- Spoken audio / TTS → **LMP-120**
- Serving routes `GET /v1/mentor/...` → later API task (do not invent in OpenAPI until then)
- Prisma migration (JSON columns already exist on `mentor_cards`)

## Validation commands

```bash
npm run content:validate-mentor-cards
npm test -- src/modules/mentor/mentor-card.validator.spec.ts
npm test -- src/modules/mentor/mentor-card.safe-copy.spec.ts
```
