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

## Version compatibility

- `schema_version` must equal `1.0.0` for this schema file
- Unknown major versions fail with `schema.version_incompatible`
- Additive optional keys go under `extensions` within 1.x; new required fields need a schema bump

## Near/Far example

| Locale | Fixture |
|---|---|
| en-US | `content/fixtures/mentor-cards/near-far.en-US.v1.json` |
| tr-TR | `content/fixtures/mentor-cards/near-far.tr-TR.v1.json` |

Canonical product example: Blueprint §5.2 near/far sock + soft toy mission; no proof/photo.

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
