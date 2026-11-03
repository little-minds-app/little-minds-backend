/** Local calendar date (YYYY-MM-DD) for a UTC instant in an IANA timezone. */
export function localDateKey(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const field = (name: string) => parts.find((part) => part.type === name)?.value ?? '';
  return `${field('year')}-${field('month')}-${field('day')}`;
}

export function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Parse RFC3339 instant (must include offset or Z). */
export function parseInstant(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return new Date(parsed);
}
