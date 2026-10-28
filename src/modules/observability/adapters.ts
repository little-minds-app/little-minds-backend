/**
 * ADR-013 / Blueprint §31.3 — pluggable observability adapters.
 * Console structured logging is always on. Paid / heavy exporters stay OFF
 * until a separate activation decision. Feature gates are code-level defaults;
 * UI toggles cannot provision vendors (Blueprint §31.3).
 */
export const OBSERVABILITY_ADAPTERS = {
  consoleStructuredLogger: true,
  openTelemetryExporter: false,
  grafanaStackAdapter: false,
  sentryAdapter: false,
  firebaseCrashlyticsAdapter: false,
} as const;

export type ObservabilityAdapterName = keyof typeof OBSERVABILITY_ADAPTERS;

export function isObservabilityAdapterEnabled(
  name: ObservabilityAdapterName,
): boolean {
  return OBSERVABILITY_ADAPTERS[name];
}
