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

  it('rejects nonexistent calendar dates and 24:00:00', () => {
    expect(parseInstant('2026-02-30T10:00:00.000Z')).toBeNull();
    expect(parseInstant('2026-02-29T10:00:00.000Z')).toBeNull();
    expect(parseInstant('2024-02-29T10:00:00.000Z')?.toISOString()).toBe(
      '2024-02-29T10:00:00.000Z',
    );
    expect(parseInstant('2026-01-01T24:00:00.000Z')).toBeNull();
  });

  it('rejects date-only and malformed offsets', () => {
    expect(parseInstant('2026-01-01')).toBeNull();
    expect(parseInstant('2026-01-01T00:00:00')).toBeNull();
    expect(parseInstant('2026-01-01T00:00:00+0300')).toBeNull();
  });
});
