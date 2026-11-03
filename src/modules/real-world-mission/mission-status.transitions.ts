import type { MissionReportStatus } from './mission-status.constants';

const ALLOWED: Record<MissionReportStatus, readonly MissionReportStatus[]> = {
  completed: ['completed', 'skipped'],
  skipped: ['skipped', 'completed'],
  not_now: ['not_now', 'completed', 'skipped', 'partial'],
  partial: ['partial', 'completed', 'skipped'],
};

export function canTransitionMissionReport(
  from: MissionReportStatus | null,
  to: MissionReportStatus,
): boolean {
  if (from === null) {
    return true;
  }
  if (from === to) {
    return true;
  }
  return (ALLOWED[from] as readonly string[]).includes(to);
}
