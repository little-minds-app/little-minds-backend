# Observability (LMP-32 / ADR-013)

Cost-aware, pluggable observability for `little-minds-backend`. **Core logging is always on.** Paid vendors and heavy self-hosted stacks stay **off** until a separate activation decision (Blueprint §31).

## Always on

| Capability | Behavior |
|---|---|
| Structured JSON logs | One JSON object per line on stdout |
| Correlation | `x-request-id` request/response header; `request_id` on log events |
| Request logs | method, path (no query string), status, duration — **never** bodies or auth headers |
| Error logs | HTTP 5xx and readiness failures are alertable; ordinary 4xx are not incidents |
| Redaction | Credentials, tokens, auth headers, OTP, child/parent PII — allowlist + recursive redact |
| Health | `GET /health` liveness; `GET /health/ready` dependency readiness (503 when not ready) |

### Log envelope fields

`timestamp`, `service`, `environment` (`APP_ENV`), `release` (`RELEASE`, default `dev`), `severity`, `message`, `request_id`, optional `trace_id` / `error_fingerprint`, allowlisted `context`.

### Adapter gates (defaults)

| Adapter | Default |
|---|---|
| Console structured logger | **ON** |
| OpenTelemetry exporter | OFF |
| Grafana / Loki / Prometheus | OFF |
| Sentry | OFF |
| Firebase Crashlytics | OFF |

## Alert-ready signals (no paid monitoring)

1. Scrapable JSON logs with `severity: error|critical` and `error_fingerprint`
2. `GET /health/ready` → **503** + `status: not_ready` when PostgreSQL probe fails
3. Bounded in-memory recent-error summaries (`RecentErrorsStore`) for future Admin Error Center

Operator email/webhook delivery and Admin Error Center UI are **out of scope** for LMP-32 (separate Blueprint §31.6 tickets).

## Privacy

Never log OTP values, credentials, access/refresh tokens, raw phone numbers, child names, birth dates, free-form child observations, or purchase tokens. See `src/config/redact.ts` and Blueprint §31.4 / §36.2.
