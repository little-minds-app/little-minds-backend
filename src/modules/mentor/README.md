# Mentor module

Blueprint §12.3 `MentorModule` placeholder for recommendation/serving APIs.

**LMP-47 (this directory):** Parent Play Mentor **content schema validation** only — no HTTP routes, no UI, no audio.

| File | Role |
|---|---|
| `mentor-card.types.ts` | TypeScript types for schema `1.0.0` |
| `mentor-card.validator.ts` | Ajv JSON Schema + age + alias checks |
| `mentor-card.safe-copy.ts` | Adult supervision / non-coercive / no proof-photo policy |
| `mentor-card.review.ts` | Draft ≠ production catalog eligibility |
| `near-far.ids.ts` | Canonical Near/Far IDs aligned with client `NearFarConstants` |
| `*.spec.ts` | Automated contract tests + Near/Far fixtures |

Canonical schema and fixtures live under `/content`.
