import {
  accumulateFirstAttemptTotals,
  parseFirstAttemptCounters,
} from './session-kpi-accuracy-payload';

describe('parseFirstAttemptCounters', () => {
  it('accepts valid safe integer pairs including zero correct', () => {
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 6, correct_first_attempts: 5 })).toEqual({
      eligible: 6,
      correct: 5,
    });
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 4, correct_first_attempts: 0 })).toEqual({
      eligible: 4,
      correct: 0,
    });
  });

  it('rejects fractional, negative, over-eligible, and unsafe integers', () => {
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 1.5, correct_first_attempts: 1 })).toBeNull();
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 3, correct_first_attempts: -1 })).toBeNull();
    expect(parseFirstAttemptCounters({ eligible_first_attempts: 2, correct_first_attempts: 9 })).toBeNull();
    expect(
      parseFirstAttemptCounters({
        eligible_first_attempts: Number.MAX_SAFE_INTEGER + 1,
        correct_first_attempts: 0,
      }),
    ).toBeNull();
  });
});

describe('accumulateFirstAttemptTotals', () => {
  it('returns null on cumulative overflow from two valid events', () => {
    const chunk = Math.floor(Number.MAX_SAFE_INTEGER / 2) + 1;
    const first = parseFirstAttemptCounters({ eligible_first_attempts: chunk, correct_first_attempts: 1 });
    expect(first).not.toBeNull();
    const step = accumulateFirstAttemptTotals({ numerator: 0, denominator: 0 }, first!);
    expect(step).not.toBeNull();
    expect(accumulateFirstAttemptTotals(step!, first!)).toBeNull();
  });
});
