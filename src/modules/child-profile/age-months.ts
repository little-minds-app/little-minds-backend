/** Stored approximate age band (OpenAPI + `child_profiles_age_months_range_check`). Content navigation remains 24–71. */
export const CHILD_PROFILE_AGE_MONTHS_MIN = 0;
export const CHILD_PROFILE_AGE_MONTHS_MAX = 71;

export function isChildProfileAgeMonthsAtReference(age: number): boolean {
  return Number.isSafeInteger(age) &&
    age >= CHILD_PROFILE_AGE_MONTHS_MIN &&
    age <= CHILD_PROFILE_AGE_MONTHS_MAX;
}

/**
 * LMP-39: age is estimated, not derived from an exact date of birth.
 * Both dates are explicit YYYY-MM-DD calendar dates; the caller selects
 * the parent's reference timezone before forming the 'today' date.
 */
function parseCalendarDate(value: string): { year: number; month: number; day: number } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError('Invalid calendar date');
  }
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() + 1 !== month || d.getUTCDate() !== day) {
    throw new RangeError('Invalid calendar date');
  }
  return { year, month, day };
}

const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * Count completed calendar-month anniversaries, clamping to the final day
 * of a shorter target month (e.g. Jan 31 -> Feb 28/29).
 */
export function ageMonthsOnDate(
  ageMonthsAtReference: number,
  referenceDate: string,
  today: string,
): number {
  if (!Number.isSafeInteger(ageMonthsAtReference) || ageMonthsAtReference < 0) {
    throw new RangeError('Invalid age at reference');
  }
  const reference = parseCalendarDate(referenceDate);
  const current = parseCalendarDate(today);
  const months = (current.year - reference.year) * 12 + current.month - reference.month;
  if (months < 0 || (months === 0 && current.day < reference.day)) {
    throw new RangeError('Reference date cannot be in the future');
  }
  const rolloverDay = Math.min(reference.day, daysInMonth(current.year, current.month));
  return ageMonthsAtReference + months - (current.day < rolloverDay ? 1 : 0);
}
