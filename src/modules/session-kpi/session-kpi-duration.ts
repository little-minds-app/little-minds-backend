import { MAX_TRUSTED_SESSION_DURATION_SECONDS } from './session-kpi.constants';

export type SessionDurationInput = {
  monotonicDurationSeconds: number | null;
  startedAt: Date;
  endedAt: Date | null;
};

/**
 * Trusted play duration for KPI totals (Blueprint F-013 / LMP-52).
 * Prefer device monotonic duration; otherwise bounded wall interval for terminal sessions only.
 */
export function resolveSessionDurationSeconds(session: SessionDurationInput): number | null {
  if (
    typeof session.monotonicDurationSeconds === 'number' &&
    Number.isFinite(session.monotonicDurationSeconds) &&
    session.monotonicDurationSeconds > 0 &&
    session.monotonicDurationSeconds <= MAX_TRUSTED_SESSION_DURATION_SECONDS
  ) {
    return Math.floor(session.monotonicDurationSeconds);
  }
  if (!session.endedAt) {
    return null;
  }
  const wallSeconds = Math.floor(
    (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
  );
  if (wallSeconds <= 0 || wallSeconds > MAX_TRUSTED_SESSION_DURATION_SECONDS) {
    return null;
  }
  return wallSeconds;
}
