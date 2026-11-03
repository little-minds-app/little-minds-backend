import { NEAR_FAR_CANONICAL_IDS } from '../mentor/near-far.ids';
import { STABLE_MISSION_ID_PATTERN } from './mission-status.constants';

/**
 * Minimal supported mission identity registry until LMP-74 catalog ingestion.
 * Only editorial-stable IDs already referenced by Near/Far client handoff.
 */
export const SUPPORTED_MISSION_IDS = new Set<string>([
  NEAR_FAR_CANONICAL_IDS.missionId,
]);

export function isSupportedMissionId(missionId: string): boolean {
  return (
    STABLE_MISSION_ID_PATTERN.test(missionId) &&
    SUPPORTED_MISSION_IDS.has(missionId)
  );
}
