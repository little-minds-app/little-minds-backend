import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  mentorCardFixturesDir,
  resolveContentRoot,
} from './mentor-card.paths';
import {
  isMentorCardAgeApplicable,
  validateMentorCard,
} from './mentor-card.validator';
import type { MentorCardV1 } from './mentor-card.types';

const CONTENT_ROOT = resolveContentRoot();
const FIXTURES_DIR = mentorCardFixturesDir(CONTENT_ROOT);

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8'));
}

function baseCard(): MentorCardV1 {
  return loadFixture('near-far.en-US.v1.json') as MentorCardV1;
}

describe('Mentor card schema validation (LMP-47)', () => {
  it('accepts Near/Far en-US and tr-TR fixtures', () => {
    const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));
    expect(files.sort()).toEqual([
      'near-far.en-US.v1.json',
      'near-far.tr-TR.v1.json',
    ]);

    for (const file of files) {
      const result = validateMentorCard(loadFixture(file), {
        contentRoot: CONTENT_ROOT,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.card.schema_version).toBe('1.0.0');
        expect(result.card.why.summary.length).toBeGreaterThan(0);
        expect(result.card.how.steps.length).toBeGreaterThan(0);
        expect(result.card.what_to_say.before.length).toBeGreaterThan(0);
        expect(result.card.safety.requires_adult_supervision).toBe(true);
        expect(result.card.adaptations.length).toBeGreaterThan(0);
      }
    }
  });

  it('rejects missing required caregiver sections', () => {
    const card = baseCard() as unknown as Record<string, unknown>;
    delete card.why;
    delete card.how;
    delete card.what_to_say;
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const blob = result.issues
        .map((i) => `${i.path} ${i.message}`)
        .join(' ');
      expect(blob).toMatch(/why|how|what_to_say/);
    }
  });

  it('rejects invalid payload types', () => {
    const result = validateMentorCard(null, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
  });

  it('rejects incompatible schema_version', () => {
    const card = { ...baseCard(), schema_version: '2.0.0' };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === 'schema.version_incompatible')).toBe(
        true,
      );
    }
  });

  it('rejects age_min_months > age_max_months', () => {
    const card = { ...baseCard(), age_min_months: 48, age_max_months: 30 };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === 'age.range_order')).toBe(true);
    }
  });

  it('rejects age outside product band via schema', () => {
    const card = { ...baseCard(), age_min_months: 12, age_max_months: 18 };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
  });

  it('applies hard age eligibility filter', () => {
    const card = baseCard();
    expect(isMentorCardAgeApplicable(card, 32)).toBe(true);
    expect(isMentorCardAgeApplicable(card, 29)).toBe(false);
    expect(isMentorCardAgeApplicable(card, 48)).toBe(false);
    expect(isMentorCardAgeApplicable(card, 23)).toBe(false);
  });

  it('accepts both tr-TR and en-US without single-locale hardcoding', () => {
    const en = validateMentorCard(loadFixture('near-far.en-US.v1.json'), {
      contentRoot: CONTENT_ROOT,
    });
    const tr = validateMentorCard(loadFixture('near-far.tr-TR.v1.json'), {
      contentRoot: CONTENT_ROOT,
    });
    expect(en.ok && tr.ok).toBe(true);
    if (en.ok && tr.ok) {
      expect(en.card.locale).toBe('en-US');
      expect(tr.card.locale).toBe('tr-TR');
      expect(en.card.mentor_card_id).toBe(tr.card.mentor_card_id);
    }
  });

  it('rejects coercive / proof copy via safe-copy rules', () => {
    const card = {
      ...baseCard(),
      what_to_say: {
        ...baseCard().what_to_say,
        during: ['You must complete 5 missions daily and take a photo proof.'],
      },
      parent_prompts_during: [
        'You must complete 5 missions daily and take a photo proof.',
      ],
    };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const codes = result.issues.map((i) => i.code);
      expect(codes.some((c) => c.startsWith('safe_copy.'))).toBe(true);
    }
  });

  it('rejects missing adult-supervision safety copy', () => {
    const card = {
      ...baseCard(),
      safety: {
        ...baseCard().safety,
        constraints: ['No glass or choking hazards.'],
      },
    };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((i) => i.code === 'safe_copy.adult_supervision_copy'),
      ).toBe(true);
    }
  });

  it('rejects what_to_say / Blueprint alias mismatch', () => {
    const card = {
      ...baseCard(),
      parent_script_before: ['Different text than what_to_say.before'],
    };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((i) => i.code === 'copy.script_alias_mismatch'),
      ).toBe(true);
    }
  });

  it('allows forward-compatible extensions bag', () => {
    const card = {
      ...baseCard(),
      extensions: { future_hint: true, nested: { ok: 1 } },
    };
    const result = validateMentorCard(card, { contentRoot: CONTENT_ROOT });
    expect(result.ok).toBe(true);
  });
});
