import { classifySessionLifecycle } from './session-kpi-lifecycle';

describe('classifySessionLifecycle', () => {
  it('counts ended_at + started as terminal interrupted, not in_progress', () => {
    const result = classifySessionLifecycle({
      completionStatus: 'started',
      endedAt: new Date('2026-01-01T10:05:00.000Z'),
    });
    expect(result).toEqual({ bucket: 'interrupted', terminal: true });
  });

  it('keeps open started sessions in_progress', () => {
    expect(
      classifySessionLifecycle({ completionStatus: 'started', endedAt: null }),
    ).toEqual({ bucket: 'in_progress', terminal: false });
  });
});
