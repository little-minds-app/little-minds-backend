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

const RFC3339_INSTANT =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  const maxDay =
    month === 2
      ? isLeapYear(year)
        ? 29
        : 28
      : [4, 6, 9, 11].includes(month)
        ? 30
        : 31;
  return day <= maxDay;
}

function fractionToMs(fraction: string | undefined): number {
  if (!fraction) {
    return 0;
  }
  const padded = `${fraction}${'0'.repeat(9 - fraction.length)}`;
  return Number.parseInt(padded.slice(0, 3), 10);
}

/** Parse RFC3339 instant with strict calendar/time validation (Z or ±HH:MM). */
export function parseInstant(value: string): Date | null {
  const match = RFC3339_INSTANT.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const hour = Number.parseInt(match[4], 10);
  const minute = Number.parseInt(match[5], 10);
  const second = Number.parseInt(match[6], 10);
  const fractionMs = fractionToMs(match[7]);

  if (!isValidCalendarDate(year, month, day)) {
    return null;
  }
  if (hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  const zone = match[8];
  let utcMs: number;
  if (zone === 'Z') {
    utcMs = Date.UTC(year, month - 1, day, hour, minute, second, fractionMs);
  } else {
    const sign = match[9] === '-' ? -1 : 1;
    const offsetHours = Number.parseInt(match[10], 10);
    const offsetMinutes = Number.parseInt(match[11], 10);
    if (offsetHours > 23 || offsetMinutes > 59) {
      return null;
    }
    const offsetTotalMinutes = sign * (offsetHours * 60 + offsetMinutes);
    utcMs =
      Date.UTC(year, month - 1, day, hour, minute, second, fractionMs) -
      offsetTotalMinutes * 60_000;
  }

  const parsed = new Date(utcMs);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }

  if (zone === 'Z') {
    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day ||
      parsed.getUTCHours() !== hour ||
      parsed.getUTCMinutes() !== minute ||
      parsed.getUTCSeconds() !== second
    ) {
      return null;
    }
  }

  return parsed;
}
