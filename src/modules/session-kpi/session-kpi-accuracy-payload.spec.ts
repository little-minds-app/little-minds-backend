import { parseFirstAttemptCounters } from './session-kpi-accuracy-payload';

describe('parseFirstAttemptCounters', () => {
  it('accepts valid integer pairs', () => {
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 6, correct_first_attempts: 5 })).toEqual({
      eligible: 6,
      correct: 5,
    });
  });

  it('rejects fractional, negative, and over-eligible values', () => {
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 1.5, correct_first_attempts: 1 })).toBeNull();
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 3, correct_first_attempts: -1 })).toBeNull();
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 2, correct_first_attempts: 9 })).toBeNull();
  });
});
