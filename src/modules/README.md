# Backend domain modules (Blueprint §12.3)

LMP-20 wires **Health** + thin **Identity** Nest modules. LMP-32 adds **Observability** + readiness. Remaining §12.3 names are directory placeholders so layout matches the Blueprint modular monolith without fake business logic.

| Folder | Nest module status | Deferred work |
|---|---|---|
| `observability/` | Implemented (LMP-32) | Admin Error Center UI; vendor adapters; operator webhook delivery |
| `prisma/` | Minimal Nest wrapper (LMP-32 readiness) | Domain repositories with owning Jira tasks |
| `health/` | Liveness + readiness (LMP-32) | Additional dependency checks as services land |
| `identity/` | Parent sessions + guards (LMP-33 / ADR-019) | GSM OTP adapters (LMP-34) |
| `child-profile/` | Placeholder | Child profiles |
| `content-catalog/` | Placeholder | Content catalog |
| `learning-recommendation/` | Placeholder | Recommendations |
| `mentor/` | Content validators (LMP-47); Nest routes deferred | Mentor serving APIs / recommendations |
| `real-world-mission/` | LMP-130 mission status read/write | Missions |
| `screen-time-policy/` | Placeholder | Screen-time policy |
| `activity-ingestion/` | LMP-50 validators + LMP-51 `POST /v1/events/batch` | — |
| `session-kpi/` | LMP-52 `GET /v1/insights/session-kpis` | Materialized aggregates (future) |
| `analytics/` | Placeholder | Analytics |
| `insight/` | Placeholder | Insight templates |
| `subscription/` | Placeholder | Subscriptions |
| `consent-privacy/` | Placeholder | Consent / privacy |
| `admin-review/` | Placeholder | Admin review |
| `audit/` | Placeholder | Audit |

Do not invent product APIs here until the owning Jira task lands.
