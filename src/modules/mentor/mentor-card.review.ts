import type { MentorCardReviewStatus, MentorCardV1 } from './mentor-card.types';

/**
 * Review statuses that may appear in a production-facing catalog/API.
 * Draft and in-review statuses are editorial only (Blueprint §7.5).
 */
export const MENTOR_CARD_PRODUCTION_REVIEW_STATUSES = [
  'published',
] as const satisfies readonly MentorCardReviewStatus[];

export type MentorCardProductionReviewStatus =
  (typeof MENTOR_CARD_PRODUCTION_REVIEW_STATUSES)[number];

/**
 * True only when a card is eligible for production catalog serving.
 * `draft` (and other pre-publish statuses) are never production.
 */
export function isMentorCardEligibleForProductionCatalog(
  card: Pick<MentorCardV1, 'review_status'>,
): boolean {
  return (
    MENTOR_CARD_PRODUCTION_REVIEW_STATUSES as readonly string[]
  ).includes(card.review_status);
}

export function assertDraftIsNotProduction(
  card: Pick<MentorCardV1, 'review_status'>,
): void {
  if (card.review_status === 'draft' && isMentorCardEligibleForProductionCatalog(card)) {
    throw new Error('Invariant broken: draft must not be production-eligible');
  }
}
