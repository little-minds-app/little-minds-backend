/** Safe nonnegative integer first-attempt counters from activity_completed payload. */
export function parseFirstAttemptCounters(
  payload: Record<string, unknown>,
): { eligible: number; correct: number } | null {
  const eligibleRaw = payload.eligible_first_attempts;
  const correctRaw = payload.correct_first_attempts;
  if (typeof eligibleRaw !== 'number' || typeof correctRaw !== 'number') {
    return null;
  }
  if (!Number.isInteger(eligibleRaw) || !Number.isInteger(correctRaw)) {
    return null;
  }
  if (eligibleRaw <= 0 || correctRaw < 0 || correctRaw > eligibleRaw) {
    return null;
  }
  return { eligible: eligibleRaw, correct: correctRaw };
}
