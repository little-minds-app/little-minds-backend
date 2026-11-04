import { ageMonthsOnDate, isChildProfileAgeMonthsAtReference } from './age-months';

describe('LMP-39 approximate calendar age', () => {
  it('holds age until the reference day and increments at rollover', () => {
    expect(ageMonthsOnDate(31, '2026-01-15', '2026-02-14')).toBe(31);
    expect(ageMonthsOnDate(31, '2026-01-15', '2026-02-15')).toBe(32);
  });

  it('clamps month-end rollover without treating reference as exact DOB', () => {
    expect(ageMonthsOnDate(24, '2025-01-31', '2025-02-27')).toBe(24);
    expect(ageMonthsOnDate(24, '2025-01-31', '2025-02-28')).toBe(25);
    expect(ageMonthsOnDate(24, '2024-01-31', '2024-02-28')).toBe(24);
    expect(ageMonthsOnDate(24, '2024-01-31', '2024-02-29')).toBe(25);
  });

  it('handles year boundaries and leap-year dates', () => {
    expect(ageMonthsOnDate(47, '2024-02-29', '2025-02-27')).toBe(58);
    expect(ageMonthsOnDate(47, '2024-02-29', '2025-02-28')).toBe(59);
    expect(ageMonthsOnDate(59, '2025-12-01', '2026-01-01')).toBe(60);
  });

  it('accepts stored ages 0–71 inclusive (LMP-131 / OpenAPI)', () => {
    expect(isChildProfileAgeMonthsAtReference(0)).toBe(true);
    expect(isChildProfileAgeMonthsAtReference(17)).toBe(true);
    expect(isChildProfileAgeMonthsAtReference(71)).toBe(true);
    expect(isChildProfileAgeMonthsAtReference(72)).toBe(false);
    expect(isChildProfileAgeMonthsAtReference(-1)).toBe(false);
  });

  it('rejects future or invalid dates and negative/partial ages', () => {
    expect(() => ageMonthsOnDate(24, '2026-12-01', '2026-11-01')).toThrow(RangeError);
    expect(() => ageMonthsOnDate(24, '2026-02-30', '2026-03-01')).toThrow(RangeError);
    expect(() => ageMonthsOnDate(-1, '2026-01-01', '2026-02-01')).toThrow(RangeError);
    expect(() => ageMonthsOnDate(24.5, '2026-01-01', '2026-02-01')).toThrow(RangeError);
  });
});
