import {
  appendHashHistory,
  generateRefreshToken,
  hashRefreshToken,
  historyContainsHash,
  parseHashHistory,
  safeEqualHex,
} from './refresh-token';
import { REFRESH_HASH_HISTORY_MAX } from './session.constants';

describe('refresh-token helpers (LMP-33)', () => {
  const pepper = 'unit-test-refresh-pepper!!';

  it('generates opaque prefixed tokens with high entropy', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).toMatch(/^lmr1\./);
    expect(a).not.toEqual(b);
    expect(a.length).toBeGreaterThan(40);
  });

  it('hashes deterministically and compares safely', () => {
    const token = generateRefreshToken();
    const h1 = hashRefreshToken(token, pepper);
    const h2 = hashRefreshToken(token, pepper);
    expect(h1).toBe(h2);
    expect(safeEqualHex(h1, h2)).toBe(true);
    expect(safeEqualHex(h1, hashRefreshToken('other', pepper))).toBe(false);
  });

  it('bounds hash history to max 8 entries', () => {
    let history = parseHashHistory([]);
    for (let i = 0; i < 12; i += 1) {
      history = appendHashHistory(history, {
        h: hashRefreshToken(`t-${i}`, pepper),
        g: i,
        at: new Date().toISOString(),
      });
    }
    expect(history).toHaveLength(REFRESH_HASH_HISTORY_MAX);
    expect(history[0]?.g).toBe(4);
  });

  it('detects prior hashes in history', () => {
    const h = hashRefreshToken('old', pepper);
    const history = appendHashHistory([], {
      h,
      g: 0,
      at: new Date().toISOString(),
    });
    expect(historyContainsHash(history, h)).toBe(true);
    expect(historyContainsHash(history, hashRefreshToken('nope', pepper))).toBe(
      false,
    );
  });
});
