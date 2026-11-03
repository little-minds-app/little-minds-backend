import { resolveSessionDurationSeconds } from './session-kpi-duration';

describe('resolveSessionDurationSeconds', () => {
  const started = new Date('2026-01-01T10:00:00.000Z');

  it('prefers bounded monotonic duration', () => {
    expect(
      resolveSessionDurationSeconds({
        monotonicDurationSeconds: 120,
        startedAt: started,
        endedAt: new Date('2026-01-01T10:05:00.000Z'),
      }),
    ).toBe(120);
  });

  it('uses terminal wall interval when monotonic is missing', () => {
    expect(
      resolveSessionDurationSeconds({
        monotonicDurationSeconds: null,
        startedAt: started,
        endedAt: new Date('2026-01-01T10:02:30.000Z'),
      }),
    ).toBe(150);
  });

  it('returns null for in-progress sessions without monotonic duration', () => {
    expect(
      resolveSessionDurationSeconds({
        monotonicDurationSeconds: null,
        startedAt: started,
        endedAt: null,
      }),
    ).toBeNull();
  });
});
