import { validateMentorCardSafeCopy } from './mentor-card.safe-copy';
import type { MentorCardV1 } from './mentor-card.types';

function minimalCard(overrides: Partial<MentorCardV1> = {}): MentorCardV1 {
  const base: MentorCardV1 = {
    schema_version: '1.0.0',
    mentor_card_id: 'sample_card',
    version: 1,
    locale: 'en-US',
    title: 'Sample',
    age_min_months: 24,
    age_max_months: 35,
    domains: ['cognitive_reasoning'],
    goals: ['explore'],
    interaction_style: 'warm_invitational',
    estimated_prep_minutes: 1,
    estimated_screen_minutes: 1,
    estimated_offscreen_minutes: 5,
    materials: [{ id: 'toy', label: 'one soft toy' }],
    why: {
      summary: 'A gentle invitation.',
      learning_intention: 'Explore together.',
    },
    how: {
      prep_summary: 'Find one soft toy.',
      steps: ['Invite your child to notice near and far.'],
    },
    what_to_say: {
      before: ['You might try sitting together.'],
      during: ['What do you notice?'],
      after: ['There is no single right answer.'],
    },
    safety: {
      constraints: ['Adult supervision is required.'],
      requires_adult_supervision: true,
      prohibits_proof_or_photo: true,
    },
    adaptations: [
      {
        id: 'seated',
        kind: 'seated',
        summary: 'Stay seated.',
      },
    ],
    parent_script_before: ['You might try sitting together.'],
    parent_prompts_during: ['What do you notice?'],
    parent_prompts_after: ['There is no single right answer.'],
    scaffold_down: ['Point instead of moving.'],
    extend_up: ['Invite your child to place the toy farther.'],
    evidence_refs: [],
    review_status: 'draft',
    observed_vs_suggested: 'Suggestion only.',
    not_a_developmental_assessment: 'Not a developmental assessment.',
  };
  return { ...base, ...overrides };
}

describe('Mentor card safe-copy rules (LMP-47)', () => {
  it('passes invitational copy', () => {
    expect(validateMentorCardSafeCopy(minimalCard())).toEqual([]);
  });

  it('flags Turkish adult-supervision absence', () => {
    const issues = validateMentorCardSafeCopy(
      minimalCard({
        locale: 'tr-TR',
        safety: {
          constraints: ['Cam kullanmayın.'],
          requires_adult_supervision: true,
          prohibits_proof_or_photo: true,
        },
      }),
    );
    expect(issues.some((i) => i.code === 'safe_copy.adult_supervision_copy')).toBe(
      true,
    );
  });

  it('accepts Turkish yetişkin gözetimi phrasing', () => {
    const issues = validateMentorCardSafeCopy(
      minimalCard({
        locale: 'tr-TR',
        safety: {
          constraints: ['Yetişkin gözetimi gerekir.'],
          requires_adult_supervision: true,
          prohibits_proof_or_photo: true,
        },
      }),
    );
    expect(issues).toEqual([]);
  });

  it('flags diagnostic language', () => {
    const issues = validateMentorCardSafeCopy(
      minimalCard({
        why: {
          summary: 'This diagnoses spatial delay.',
          learning_intention: 'Explore.',
        },
      }),
    );
    expect(issues.some((i) => i.code === 'safe_copy.diagnostic_claim')).toBe(true);
  });
});
