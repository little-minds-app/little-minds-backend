/** Safe nonnegative integer first-attempt counters from activity_completed payload. */
export function parseFirstAttemptCounters(
  payload: Record<string, unknown>,
): { eligible: number; correct: number } | null {
  const eligibleRaw = payload.eligible_first_attempts;
  const correctRaw = payload.correct_first_attempts;
  if (typeof eligibleRaw !== 'number' || typeof correctRaw !== 'number') {
    return null;
  }
  if (!Number.isSafeInteger(eligibleRaw) || !Number.isSafeInteger(correctRaw)) {
    return null;
  }
  if (eligibleRaw <= 0 || correctRaw < 0 || correctRaw > eligibleRaw) {
    return null;
  }
  return { eligible: eligibleRaw, correct: correctRaw };
}

export type FirstAttemptTotals = { numerator: number; denominator: number };

/** Accumulate counters; returns null when totals would exceed safe integer range. */
export function accumulateFirstAttemptTotals(
  totals: FirstAttemptTotals,
  counters: { eligible: number; correct: number },
): FirstAttemptTotals | null {
  const denominator = totals.denominator + counters.eligible;
  const numerator = totals.numerator + counters.correct;
  if (!Number.isSafeInteger(denominator) || !Number.isSafeInteger(numerator)) {
    return null;
  }
  return { numerator, denominator };
}
