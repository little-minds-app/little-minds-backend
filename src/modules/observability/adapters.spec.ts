import {
  isObservabilityAdapterEnabled,
  OBSERVABILITY_ADAPTERS,
} from './adapters';

describe('observability adapters (ADR-013)', () => {
  it('keeps console logger on and optional vendors off by default', () => {
    expect(OBSERVABILITY_ADAPTERS.consoleStructuredLogger).toBe(true);
    expect(OBSERVABILITY_ADAPTERS.openTelemetryExporter).toBe(false);
    expect(OBSERVABILITY_ADAPTERS.grafanaStackAdapter).toBe(false);
    expect(OBSERVABILITY_ADAPTERS.sentryAdapter).toBe(false);
    expect(OBSERVABILITY_ADAPTERS.firebaseCrashlyticsAdapter).toBe(false);
    expect(isObservabilityAdapterEnabled('sentryAdapter')).toBe(false);
  });
});
