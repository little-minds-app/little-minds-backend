import {
  assertDraftIsNotProduction,
  isMentorCardEligibleForProductionCatalog,
} from './mentor-card.review';

describe('Mentor card review / production eligibility (LMP-47)', () => {
  it('treats draft as not production-eligible', () => {
    expect(
      isMentorCardEligibleForProductionCatalog({ review_status: 'draft' }),
    ).toBe(false);
    expect(() =>
      assertDraftIsNotProduction({ review_status: 'draft' }),
    ).not.toThrow();
  });

  it('treats in-review statuses as not production-eligible', () => {
    for (const review_status of [
      'pedagogy_review',
      'safety_review',
      'localization_review',
      'approved',
      'staged',
      'archived',
      'rolled_back',
    ] as const) {
      expect(isMentorCardEligibleForProductionCatalog({ review_status })).toBe(
        false,
      );
    }
  });

  it('treats published as production-eligible', () => {
    expect(
      isMentorCardEligibleForProductionCatalog({ review_status: 'published' }),
    ).toBe(true);
  });

  it('documents that draft !== approved/published production', () => {
    const draft = 'draft' as const;
    const approved = 'approved' as const;
    const published = 'published' as const;
    expect(draft).not.toEqual(approved);
    expect(draft).not.toEqual(published);
    expect(
      isMentorCardEligibleForProductionCatalog({ review_status: draft }),
    ).toBe(false);
    expect(
      isMentorCardEligibleForProductionCatalog({ review_status: approved }),
    ).toBe(false);
    expect(
      isMentorCardEligibleForProductionCatalog({ review_status: published }),
    ).toBe(true);
  });
});
