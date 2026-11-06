/**
 * Deterministic synthetic fixture constants (no Prisma / no I/O).
 * Ages: Blueprint §26.2 / LMP-22 AC — fictional 24, 32, 47, 59, 71 months.
 */
export const SYNTHETIC_AGE_MONTHS = [24, 32, 47, 59, 71] as const;

export type SyntheticAgeMonths = (typeof SYNTHETIC_AGE_MONTHS)[number];

/** Fixed UUIDs so re-seed after reset is deterministic. */
export const SEED_IDS = {
  parent: '11111111-1111-4111-8111-111111111111',
  parentIdentity: '22222222-2222-4222-8222-222222222222',
  children: {
    24: '33333333-3333-4333-8333-333333333324',
    32: '33333333-3333-4333-8333-333333333332',
    47: '33333333-3333-4333-8333-333333333347',
    59: '33333333-3333-4333-8333-333333333359',
    71: '33333333-3333-4333-8333-333333333371',
  },
  notice: '44444444-4444-4444-8444-444444444401',
  consentEssential: '55555555-5555-4555-8555-555555555501',
  processingAnalytics: '66666666-6666-4666-8666-666666666601',
  consentPlayEventsParent: '88888888-8888-4888-8888-888888888801',
  /** LMP-134 — published Shape Matching activity variant (`content_version_id`). */
  shapeMatching: {
    learningDomain: '77777777-7777-4777-8777-777777777701',
    learningGoal: '77777777-7777-4777-8777-777777777702',
    gameMechanic: '77777777-7777-4777-8777-777777777703',
    activityDefinition: '77777777-7777-4777-8777-777777777704',
    contentVersionId: '018f1340-0000-4000-8000-000000000001',
    contentReview: '77777777-7777-4777-8777-777777777705',
  },
} as const;

/** Stable editorial codes for the seeded Shape Matching publication (LMP-134). */
export const SHAPE_MATCHING_PUBLICATION = {
  hubActivityId: 'shape_matching',
  mechanicCode: 'shape_matching',
  objectiveKey: 'match_basic_shapes_v1',
  domainCode: 'shapes_and_patterns',
  variantVersion: 1,
  policyVersion: 'synthetic-policy-v1',
} as const;

/** Shared synthetic age reference date (UTC calendar date). */
export const SEED_AGE_REFERENCE_DATE = new Date('2026-01-15T00:00:00.000Z');

export function syntheticNickname(ageMonths: SyntheticAgeMonths): string {
  return `Seedling-${ageMonths}m`;
}
