import type { MentorCardValidationIssue, MentorCardV1 } from './mentor-card.types';

/**
 * Safe-copy policy for Parent Play Mentor cards (Blueprint §4.3, §5.2).
 * Runs after JSON Schema validation.
 */

type ForbiddenRule = {
  code: string;
  pattern: RegExp;
  message: string;
};

const FORBIDDEN_RULES: ForbiddenRule[] = [
  {
    code: 'safe_copy.coercive_must',
    pattern: /\byou must\b|\bmust complete\b|\bzorunlu\b|\bher gün tamamla\b/i,
    message: 'Coercive duty language is not allowed',
  },
  {
    code: 'safe_copy.comparative_judgment',
    pattern:
      /\bbehind\b|\bshould be able\b|\bgeride\b|\byapabilmeli\b|\byapması gerekir\b/i,
    message: 'Comparative / deficit judgment language is not allowed',
  },
  {
    code: 'safe_copy.unlock_manipulation',
    pattern: /\bunlock development\b|\bkeep playing to unlock\b/i,
    message: 'Manipulative unlock language is not allowed',
  },
  {
    code: 'safe_copy.proof_or_photo',
    pattern:
      /\bphoto proof\b|\btake a photo\b|\bvideo proof\b|\bupload (a |the )?(picture|photo|video)\b|\bfotoğraf çek\b|\bfotograf cek\b|\bkanıt yükle\b|\bkanit yukle\b|\bsend (a |the )?photo\b/i,
    message: 'Proof / photo / video capture requirements are not allowed',
  },
  {
    code: 'safe_copy.diagnostic_claim',
    pattern:
      /\bdiagnos|\bIQ\b|\bdevelopmental disorder\b|\btanı koy\b|\btani koy\b|\bgelişim bozukluğu\b|\bgelisim bozuklugu\b/i,
    message: 'Diagnostic or clinical claim language is not allowed',
  },
];

/** Disclaimer field is allowed to say this is *not* a diagnosis. */
const DIAGNOSTIC_SCAN_SKIP_PATHS = new Set([
  'not_a_developmental_assessment',
]);

const ADULT_SUPERVISION_PATTERN =
  /adult supervision|yetişkin gözetimi|yetiskin gozetimi/i;

function collectCopyStrings(card: MentorCardV1): Array<{ path: string; value: string }> {
  const out: Array<{ path: string; value: string }> = [];
  const push = (path: string, value: string) => out.push({ path, value });

  push('title', card.title);
  push('why.summary', card.why.summary);
  push('why.learning_intention', card.why.learning_intention);
  push('how.prep_summary', card.how.prep_summary);
  card.how.steps.forEach((s, i) => push(`how.steps[${i}]`, s));
  card.what_to_say.before.forEach((s, i) =>
    push(`what_to_say.before[${i}]`, s),
  );
  card.what_to_say.during.forEach((s, i) =>
    push(`what_to_say.during[${i}]`, s),
  );
  card.what_to_say.after.forEach((s, i) => push(`what_to_say.after[${i}]`, s));
  card.safety.constraints.forEach((s, i) =>
    push(`safety.constraints[${i}]`, s),
  );
  card.adaptations.forEach((a, i) =>
    push(`adaptations[${i}].summary`, a.summary),
  );
  card.parent_script_before.forEach((s, i) =>
    push(`parent_script_before[${i}]`, s),
  );
  card.parent_prompts_during.forEach((s, i) =>
    push(`parent_prompts_during[${i}]`, s),
  );
  card.parent_prompts_after.forEach((s, i) =>
    push(`parent_prompts_after[${i}]`, s),
  );
  card.scaffold_down.forEach((s, i) => push(`scaffold_down[${i}]`, s));
  card.extend_up.forEach((s, i) => push(`extend_up[${i}]`, s));
  push('observed_vs_suggested', card.observed_vs_suggested);
  push('not_a_developmental_assessment', card.not_a_developmental_assessment);
  card.materials.forEach((m, i) => push(`materials[${i}].label`, m.label));

  return out;
}

/**
 * Returns policy issues for an already schema-shaped card.
 */
export function validateMentorCardSafeCopy(
  card: MentorCardV1,
): MentorCardValidationIssue[] {
  const issues: MentorCardValidationIssue[] = [];

  if (card.safety.requires_adult_supervision !== true) {
    issues.push({
      code: 'safe_copy.adult_supervision_flag',
      path: 'safety.requires_adult_supervision',
      message: 'requires_adult_supervision must be true',
    });
  }

  if (card.safety.prohibits_proof_or_photo !== true) {
    issues.push({
      code: 'safe_copy.no_proof_flag',
      path: 'safety.prohibits_proof_or_photo',
      message: 'prohibits_proof_or_photo must be true',
    });
  }

  const hasSupervisionMention = card.safety.constraints.some((c) =>
    ADULT_SUPERVISION_PATTERN.test(c),
  );
  if (!hasSupervisionMention) {
    issues.push({
      code: 'safe_copy.adult_supervision_copy',
      path: 'safety.constraints',
      message:
        'At least one safety constraint must mention adult supervision (locale-aware)',
    });
  }

  for (const { path, value } of collectCopyStrings(card)) {
    for (const rule of FORBIDDEN_RULES) {
      if (
        rule.code === 'safe_copy.diagnostic_claim' &&
        DIAGNOSTIC_SCAN_SKIP_PATHS.has(path)
      ) {
        continue;
      }
      if (rule.pattern.test(value)) {
        issues.push({
          code: rule.code,
          path,
          message: rule.message,
        });
      }
    }
  }

  return issues;
}
