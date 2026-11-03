import { TERMINAL_COMPLETION_STATUSES } from './session-kpi.constants';

export type SessionLifecycleBucket =
  | 'completed'
  | 'interrupted'
  | 'abandoned'
  | 'in_progress';

/**
 * Normalized lifecycle: in_progress only when status is non-terminal and no ended_at.
 * ended_at with status started/null closes as interrupted (terminal) without double counting.
 */
export function classifySessionLifecycle(session: {
  completionStatus: string | null;
  endedAt: Date | null;
}): { bucket: SessionLifecycleBucket; terminal: boolean } {
  const status = session.completionStatus ?? 'started';
  if (status === 'completed') {
    return { bucket: 'completed', terminal: true };
  }
  if (status === 'interrupted') {
    return { bucket: 'interrupted', terminal: true };
  }
  if (status === 'abandoned') {
    return { bucket: 'abandoned', terminal: true };
  }
  if (session.endedAt !== null) {
    return { bucket: 'interrupted', terminal: true };
  }
  if ((TERMINAL_COMPLETION_STATUSES as readonly string[]).includes(status)) {
    return { bucket: 'interrupted', terminal: true };
  }
  return { bucket: 'in_progress', terminal: false };
}
