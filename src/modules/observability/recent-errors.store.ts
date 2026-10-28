import { Injectable } from '@nestjs/common';

export type RecentErrorSummary = {
  fingerprint: string;
  severity: string;
  firstSeen: string;
  lastSeen: string;
  count: number;
  message: string;
  requestId?: string;
};

/** Bounded in-process error summaries for alert-ready signals (no vendor DB). */
const MAX_ENTRIES = 50;

@Injectable()
export class RecentErrorsStore {
  private readonly byFingerprint = new Map<string, RecentErrorSummary>();

  record(input: {
    fingerprint: string;
    severity: string;
    message: string;
    requestId?: string;
  }): RecentErrorSummary {
    const now = new Date().toISOString();
    const existing = this.byFingerprint.get(input.fingerprint);
    if (existing) {
      existing.lastSeen = now;
      existing.count += 1;
      existing.message = input.message;
      existing.requestId = input.requestId ?? existing.requestId;
      this.byFingerprint.delete(input.fingerprint);
      this.byFingerprint.set(input.fingerprint, existing);
      return existing;
    }

    const created: RecentErrorSummary = {
      fingerprint: input.fingerprint,
      severity: input.severity,
      firstSeen: now,
      lastSeen: now,
      count: 1,
      message: input.message,
      requestId: input.requestId,
    };
    this.byFingerprint.set(input.fingerprint, created);
    while (this.byFingerprint.size > MAX_ENTRIES) {
      const oldest = this.byFingerprint.keys().next().value as string;
      this.byFingerprint.delete(oldest);
    }
    return created;
  }

  list(): RecentErrorSummary[] {
    return [...this.byFingerprint.values()].sort((a, b) =>
      a.lastSeen < b.lastSeen ? 1 : -1,
    );
  }

  /** Alert-ready signal: true when any critical/error was recorded recently. */
  hasRecentFailures(): boolean {
    return this.byFingerprint.size > 0;
  }

  clear(): void {
    this.byFingerprint.clear();
  }
}
