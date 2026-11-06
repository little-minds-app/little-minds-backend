import {
  SEED_AGE_REFERENCE_DATE,
  SEED_IDS,
  SYNTHETIC_AGE_MONTHS,
  syntheticNickname,
} from './seed-data';

describe('synthetic seed fixtures (LMP-22)', () => {
  it('defines the five Blueprint staging ages', () => {
    expect([...SYNTHETIC_AGE_MONTHS]).toEqual([24, 32, 47, 59, 71]);
  });

  it('keeps child UUID map aligned with ages', () => {
    for (const age of SYNTHETIC_AGE_MONTHS) {
      expect(SEED_IDS.children[age]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  });

  it('uses a fixed UTC age reference date', () => {
    expect(SEED_AGE_REFERENCE_DATE.toISOString()).toBe(
      '2026-01-15T00:00:00.000Z',
    );
  });

  it('builds fictional nicknames without email-like PII', () => {
    for (const age of SYNTHETIC_AGE_MONTHS) {
      const nick = syntheticNickname(age);
      expect(nick).toBe(`Seedling-${age}m`);
      expect(nick).not.toMatch(/@/);
    }
  });

  it('defines a published Shape Matching content_version_id (LMP-134)', () => {
    expect(SEED_IDS.shapeMatching.contentVersionId).toMatch(
      /^018f1340-0000-4000-8000-000000000001$/,
    );
  });
});
