/**
 * Parent Play Mentor card types aligned with content/schemas/mentor-card/v1.schema.json.
 * Backend-owned content contract (LMP-47 / Blueprint F-009).
 */

export const MENTOR_CARD_SCHEMA_VERSION = '1.0.0' as const;

/** Locales shipped with V1 fixtures; schema accepts any xx-YY tag. */
export const MENTOR_CARD_V1_LOCALES = ['tr-TR', 'en-US'] as const;
export type MentorCardV1Locale = (typeof MENTOR_CARD_V1_LOCALES)[number];

export type MentorCardReviewStatus =
  | 'draft'
  | 'pedagogy_review'
  | 'safety_review'
  | 'localization_review'
  | 'approved'
  | 'staged'
  | 'published'
  | 'archived'
  | 'rolled_back';

export type MentorCardInteractionStyle =
  | 'warm_invitational'
  | 'observe_wait_respond_extend'
  | 'guided_play'
  | 'open_ended';

export type MentorCardAdaptationKind =
  | 'seated'
  | 'low_motor'
  | 'low_noise'
  | 'sensory_friendly'
  | 'small_space'
  | 'no_purchase'
  | 'tactile'
  | 'point_instead_of_move'
  | 'other';

export type MentorCardMaterial = {
  id: string;
  label: string;
  optional?: boolean;
  household_common?: boolean;
};

export type MentorCardAdaptation = {
  id: string;
  kind: MentorCardAdaptationKind;
  summary: string;
};

/**
 * Caregiver-facing mentor card document (content JSON, not Prisma row shape).
 * Prisma `MentorCard` stores overlapping fields; JSON columns map from this document.
 */
export type MentorCardV1 = {
  schema_version: typeof MENTOR_CARD_SCHEMA_VERSION;
  mentor_card_id: string;
  version: number;
  locale: string;
  title: string;
  age_min_months: number;
  age_max_months: number;
  domains: string[];
  goals: string[];
  interaction_style: MentorCardInteractionStyle;
  estimated_prep_minutes: number;
  estimated_screen_minutes: number;
  estimated_offscreen_minutes: number;
  materials: MentorCardMaterial[];
  why: { summary: string; learning_intention: string };
  how: { prep_summary: string; steps: string[] };
  what_to_say: {
    before: string[];
    during: string[];
    after: string[];
  };
  safety: {
    constraints: string[];
    requires_adult_supervision: true;
    prohibits_proof_or_photo: true;
  };
  adaptations: MentorCardAdaptation[];
  parent_script_before: string[];
  parent_prompts_during: string[];
  parent_prompts_after: string[];
  scaffold_down: string[];
  extend_up: string[];
  evidence_refs: string[];
  review_status: MentorCardReviewStatus;
  reviewer_id?: string | null;
  reviewed_at?: string | null;
  observed_vs_suggested: string;
  not_a_developmental_assessment: string;
  linked_activity_ids?: string[];
  linked_mission_ids?: string[];
  extensions?: Record<string, unknown>;
};

export type MentorCardValidationIssue = {
  code: string;
  path: string;
  message: string;
};

export type MentorCardValidationResult =
  | { ok: true; card: MentorCardV1 }
  | { ok: false; issues: MentorCardValidationIssue[] };
