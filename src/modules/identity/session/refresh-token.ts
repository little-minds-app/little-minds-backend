import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  REFRESH_HASH_HISTORY_MAX,
  REFRESH_TOKEN_PREFIX,
} from './session.constants';

export type RefreshHashHistoryEntry = {
  h: string;
  g: number;
  at: string;
};

export function generateRefreshToken(): string {
  const raw = randomBytes(32).toString('base64url');
  return `${REFRESH_TOKEN_PREFIX}${raw}`;
}

export function hashRefreshToken(token: string, pepper: string): string {
  return createHmac('sha256', pepper).update(token, 'utf8').digest('hex');
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length || ba.length === 0) {
      return false;
    }
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function parseHashHistory(raw: unknown): RefreshHashHistoryEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: RefreshHashHistoryEntry[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as RefreshHashHistoryEntry).h === 'string' &&
      typeof (item as RefreshHashHistoryEntry).g === 'number' &&
      typeof (item as RefreshHashHistoryEntry).at === 'string'
    ) {
      out.push({
        h: (item as RefreshHashHistoryEntry).h,
        g: (item as RefreshHashHistoryEntry).g,
        at: (item as RefreshHashHistoryEntry).at,
      });
    }
  }
  return out;
}

export function appendHashHistory(
  history: RefreshHashHistoryEntry[],
  entry: RefreshHashHistoryEntry,
): RefreshHashHistoryEntry[] {
  const next = [...history, entry];
  if (next.length <= REFRESH_HASH_HISTORY_MAX) {
    return next;
  }
  return next.slice(next.length - REFRESH_HASH_HISTORY_MAX);
}

export function historyContainsHash(
  history: RefreshHashHistoryEntry[],
  hash: string,
): boolean {
  return history.some((entry) => safeEqualHex(entry.h, hash));
}
