import { parseInstant } from './session-kpi-time';

describe('parseInstant', () => {
  it('accepts Z and numeric UTC offsets', () => {
    expect(parseInstant('2026-01-01T00:00:00.000Z')?.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
    expect(parseInstant('2026-01-01T03:00:00.000+03:00')?.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
  });

  it('rejects date-only and malformed offsets', () => {
    expect(parseInstant('2026-01-01')).toBeNull();
    expect(parseInstant('2026-01-01T00:00:00')).toBeNull();
    expect(parseInstant('2026-01-01T00:00:00+0300')).toBeNull();
  });
});
