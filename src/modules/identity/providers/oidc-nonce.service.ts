import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
import { throwRateLimited, throwUnauthorized } from '../session/auth.errors';
import { OIDC_NONCE_TTL_SECONDS } from '../otp/multi-provider.constants';
import type { Request } from 'express';

const NONCE_ISSUE_PER_IP_PER_MIN = 30;

function floorWindow(nowMs: number, windowMs: number): Date {
  return new Date(Math.floor(nowMs / windowMs) * windowMs);
}

/**
 * Server-issued OIDC nonces (ADR-021 §4.3 / sketch POST /v1/auth/oidc/nonce).
 * Plaintext returned once; only SHA-256 hash stored for single-use consume.
 */
@Injectable()
export class OidcNonceService {
  constructor(private readonly prisma: PrismaService) {}

  static hashNonce(plaintext: string): string {
    return createHash('sha256').update(plaintext, 'utf8').digest('hex');
  }

  /** Apple stores SHA256(nonce) in the ID-token claim — hex digest lowercase. */
  static appleNonceClaim(plaintext: string): string {
    return createHash('sha256').update(plaintext, 'utf8').digest('hex');
  }

  async issue(
    req: Request,
    provider: 'apple' | 'google' | 'shared' = 'shared',
  ): Promise<{ nonce: string; expires_in: number }> {
    const ip = clientIp(req);
    await this.assertIssueRate(ip);

    const plaintext = randomBytes(32).toString('base64url');
    const nonceHash = OidcNonceService.hashNonce(plaintext);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OIDC_NONCE_TTL_SECONDS * 1000);

    await this.prisma.db.authOidcNonce.create({
      data: {
        id: randomUUID(),
        nonceHash,
        provider,
        expiresAt,
      },
    });

    return { nonce: plaintext, expires_in: OIDC_NONCE_TTL_SECONDS };
  }

  /**
   * Atomically consume a previously issued nonce. Returns false if missing,
   * expired, or already consumed (replay).
   */
  async consume(plaintext: string): Promise<boolean> {
    const nonceHash = OidcNonceService.hashNonce(plaintext);
    const clock = await this.prisma.db.$queryRaw<Array<{ now: Date }>>`
      SELECT clock_timestamp() AS now
    `;
    const now = clock[0]?.now ?? new Date();

    const updated = await this.prisma.db.$queryRaw<Array<{ id: string }>>`
      UPDATE auth_oidc_nonces
      SET consumed_at = ${now}
      WHERE nonce_hash = ${nonceHash}
        AND consumed_at IS NULL
        AND expires_at > ${now}
      RETURNING id
    `;
    return updated.length === 1;
  }

  async consumeOrThrow(plaintext: string): Promise<void> {
    const ok = await this.consume(plaintext);
    if (!ok) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }
  }

  private async assertIssueRate(ip: string): Promise<void> {
    const w1 = floorWindow(Date.now(), 60_000);
    await this.prisma.db.otpAbuseCounter.upsert({
      where: {
        bucketType_bucketKey_windowStart: {
          bucketType: 'oidc_nonce_ip_1m',
          bucketKey: ip,
          windowStart: w1,
        },
      },
      create: {
        bucketType: 'oidc_nonce_ip_1m',
        bucketKey: ip,
        windowStart: w1,
        sendCount: 0,
        verifyCount: 0,
      },
      update: {},
    });
    const updated = await this.prisma.db.$queryRaw<
      Array<{ send_count: number }>
    >`
      UPDATE otp_abuse_counters
      SET send_count = send_count + 1
      WHERE bucket_type = 'oidc_nonce_ip_1m'
        AND bucket_key = ${ip}
        AND window_start = ${w1}
        AND send_count < ${NONCE_ISSUE_PER_IP_PER_MIN}
      RETURNING send_count
    `;
    if (updated.length === 0) {
      throwRateLimited();
    }
  }
}
