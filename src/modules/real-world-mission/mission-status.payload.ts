import { createHash } from 'node:crypto';
import type { MissionReportStatus } from './mission-status.constants';

export type MissionFeedbackPayload = {
  child_id: string;
  mission_id: string;
  occurrence_id: string;
  status: MissionReportStatus;
};

export function missionFeedbackPayloadFingerprint(payload: MissionFeedbackPayload): string {
  const canonical = JSON.stringify({
    child_id: payload.child_id.toLowerCase(),
    mission_id: payload.mission_id,
    occurrence_id: payload.occurrence_id.toLowerCase(),
    status: payload.status,
  });
  return createHash('sha256').update(canonical).digest('hex');
}
