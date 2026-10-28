import { Injectable } from '@nestjs/common';
import {
  RATE_LIMIT_BOOTSTRAP_PER_IP,
  RATE_LIMIT_REFRESH_PER_IP,
  RATE_LIMIT_REFRESH_PER_SESSION,
  RATE_LIMIT_WINDOW_MS,
} from './session.constants';
import { throwRateLimited } from './auth.errors';

type Bucket = { timestamps: number[] };

/**
 * Best-effort single-node sliding-window limiter (ADR-019 §9.2).
 * Multi-instance deployments do not share memory — document limitation.
 */
@Injectable()
export class AuthRateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  consumeRefreshIp(ip: string): void {
    this.consume(`refresh:ip:${ip}`, RATE_LIMIT_REFRESH_PER_IP);
  }

  consumeRefreshSession(sessionKey: string): void {
    this.consume(`refresh:sid:${sessionKey}`, RATE_LIMIT_REFRESH_PER_SESSION);
  }

  consumeBootstrapIp(ip: string): void {
    this.consume(`bootstrap:ip:${ip}`, RATE_LIMIT_BOOTSTRAP_PER_IP);
  }

  /** Test helper — clear all buckets. */
  resetForTests(): void {
    this.buckets.clear();
  }

  private consume(key: string, limit: number): void {
    const now = Date.now();
    const bucket = this.buckets.get(key) ?? { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );
    if (bucket.timestamps.length >= limit) {
      this.buckets.set(key, bucket);
      throwRateLimited();
    }
    bucket.timestamps.push(now);
    this.buckets.set(key, bucket);
  }
}
