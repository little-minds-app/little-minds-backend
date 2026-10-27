/**
 * Canonical Near/Far demo IDs aligned with little-minds-client
 * `NearFarConstants` on main (LMP-45/46) and Blueprint §7.3 brief_id.
 *
 * Event payloads already use these strings; mentor fixtures must match.
 * See internal decision: lmp-47-mission-id-decision.md
 */
export const NEAR_FAR_CANONICAL_IDS = {
  activityId: 'near_far_32m_v1',
  missionId: 'near_far_sock_soft_toy_v1',
  mentorCardId: 'mentor_near_far_32m_adjacency_v1',
  ageMinMonths: 30,
  ageMaxMonths: 35,
} as const;

/** Deprecated draft strings — must not appear on Near/Far mentor fixtures. */
export const NEAR_FAR_DEPRECATED_IDS = {
  activityId: 'near_far',
  missionId: 'near_far_sock_soft_toy',
  mentorCardId: 'near_far_play_mentor',
} as const;
