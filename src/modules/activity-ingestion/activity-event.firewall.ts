/**
 * ADR-017 / §38.5 firewall: first-attempt accuracy fields are content-QA aggregates only.
 * They must never be routed into recommendation / difficulty / ranking APIs.
 */

const CONTENT_QA_ONLY_PAYLOAD_KEYS = [
  'eligible_first_attempts',
  'correct_first_attempts',
  'hints_used',
] as const;

/** Modules that must not consume child-level QA accuracy fields. */
const FORBIDDEN_CONSUMER_MARKERS = [
  'learning-recommendation',
  'insight',
  'recommendation',
] as const;

export function isContentQaOnlyPayloadKey(key: string): boolean {
  return (CONTENT_QA_ONLY_PAYLOAD_KEYS as readonly string[]).includes(key);
}

/**
 * Architectural guard used by tests: ensure a consumer module path is not
 * importing QA accuracy keys for personalization.
 */
export function assertNoQaAccuracyPersonalization(
  consumerModulePath: string,
  referencedPayloadKeys: readonly string[],
): { ok: true } | { ok: false; reason: string } {
  const hitsQa = referencedPayloadKeys.filter(isContentQaOnlyPayloadKey);
  if (hitsQa.length === 0) {
    return { ok: true };
  }
  const forbidden = FORBIDDEN_CONSUMER_MARKERS.some((marker) =>
    consumerModulePath.includes(marker),
  );
  if (forbidden) {
    return {
      ok: false,
      reason: `Module ${consumerModulePath} must not consume content-QA keys ${hitsQa.join(', ')} for personalization`,
    };
  }
  return { ok: true };
}

export { CONTENT_QA_ONLY_PAYLOAD_KEYS, FORBIDDEN_CONSUMER_MARKERS };
