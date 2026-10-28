# ObservabilityModule (LMP-32 / ADR-013)

Always-on, cost-aware operational logging for NestJS. Paid vendors and heavy self-hosted stacks stay **off** (`adapters.ts`).

## Included

| Piece | Role |
|---|---|
| `StructuredLogger` | JSON stdout events (`timestamp`, `service`, `environment`, `release`, `severity`, `request_id`, optional `trace_id` / `error_fingerprint`) |
| `RequestIdMiddleware` | `x-request-id` correlation (accept safe client id or mint UUID) |
| `HttpLoggingInterceptor` | Request completion logs — method/path/status/duration only (no bodies) |
| `AllExceptionsFilter` | Redacted error logs; 5xx alertable, ordinary 4xx not incidents |
| `RecentErrorsStore` | Bounded in-memory summaries for alert-ready signals (no vendor DB) |

## Explicitly out of scope here

- Admin Error Center UI / RBAC (later)
- Operator email/webhook delivery (separate P0-before-launch alert ticket)
- OpenTelemetry / Grafana / Sentry / Crashlytics adapters (gates remain `false`)
- Browser `ErrorReporter` (client repo)

## Privacy

Uses `src/config/redact.ts` allowlist + recursive redaction. Never log OTP, credentials, tokens, auth headers, child/parent PII, or request payloads.
