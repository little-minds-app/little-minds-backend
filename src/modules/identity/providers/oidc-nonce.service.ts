import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
import { throwInvalidRequest, throwRateLimited, throwUnauthorized } from '../session/auth.errors';
import { OIDC_NONCE_TTL_SECONDS } from '../otp/multi-provider.constants';

const NONCE_ISSUE_PER_IP_PER_MIN = 30;

export type OidcNonceProvider = 'apple' | 'google';

function floorWindow(nowMs: number, windowMs: number): Date {
  return new Date(Math.floor(nowMs / windowMs) * windowMs);
}

/**
 * Server-issued OIDC nonces (ADR-021 §4.3).
 *
 * Security (P1):
 * - Provider-bound at issue; cross-provider consume rejected.
 * - Callers MUST verify ID token + nonce claim **before** {@link consumeAfterVerify}.
 * - Invalid tokens therefore do not burn a legitimate unused nonce.
 * - Concurrent consume is single-winner (atomic UPDATE).
 */
@Injectable()
export class OidcNonceService {
  constructor(private readonly prisma: PrismaService) {}

  static hashNonce(plaintext: string): string {
    return createHash('sha256').update(plaintext, 'utf8').digest('hex');
  }

  async issue(
    req: Request,
    provider: OidcNonceProvider,
  ): Promise<{ nonce: string; expires_in: number }> {
    if (provider !== 'apple' && provider !== 'google') {
      throwInvalidRequest('Invalid request');
    }
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
   * After successful ID-token verify, atomically consume the nonce for
   * `expectedProvider`. Fails closed on missing / expired / reused / wrong provider.
   */
  async consumeAfterVerify(
    plaintext: string,
    expectedProvider: OidcNonceProvider,
  ): Promise<void> {
    if (!plaintext || plaintext.length < 8) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }
    const nonceHash = OidcNonceService.hashNonce(plaintext);
    const clock = await this.prisma.db.$queryRaw<Array<{ now: Date }>>`
      SELECT clock_timestamp() AS now
    `;
    const now = clock[0]?.now ?? new Date();

    const updated = await this.prisma.db.$queryRaw<Array<{ id: string }>>`
      UPDATE auth_oidc_nonces
      SET consumed_at = ${now}
      WHERE nonce_hash = ${nonceHash}
        AND provider = ${expectedProvider}
        AND consumed_at IS NULL
        AND expires_at > ${now}
      RETURNING id
    `;
    if (updated.length !== 1) {
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
