import { canTransitionMissionReport } from './mission-status.transitions';

describe('mission status transitions (LMP-130)', () => {
  it('allows first report from empty state', () => {
    expect(canTransitionMissionReport(null, 'completed')).toBe(true);
    expect(canTransitionMissionReport(null, 'skipped')).toBe(true);
  });

  it('allows parent correction between completed and skipped', () => {
    expect(canTransitionMissionReport('completed', 'skipped')).toBe(true);
    expect(canTransitionMissionReport('skipped', 'completed')).toBe(true);
  });

  it('rejects impossible downgrade from completed to not_now', () => {
    expect(canTransitionMissionReport('completed', 'not_now')).toBe(false);
  });

  it('allows advancement from not_now and partial', () => {
    expect(canTransitionMissionReport('not_now', 'completed')).toBe(true);
    expect(canTransitionMissionReport('partial', 'skipped')).toBe(true);
  });
});
