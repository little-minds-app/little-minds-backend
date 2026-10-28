import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SMS_GLOBAL_PER_DAY,
  SMS_PER_IP_15M,
  SMS_PER_IP_24H,
  SMS_PER_SUBJECT_15M,
  SMS_PER_SUBJECT_24H,
  VERIFY_PER_IP_PER_MIN,
  WINDOW_15M_MS,
  WINDOW_1M_MS,
  WINDOW_24H_MS,
} from './otp.constants';
import { throwOtpCooldown, throwRateLimited } from '../session/auth.errors';

type TxClient = Prisma.TransactionClient;

function floorWindow(nowMs: number, windowMs: number): Date {
  return new Date(Math.floor(nowMs / windowMs) * windowMs);
}

/**
 * Durable PostgreSQL atomic abuse counters (ADR-020 §8.1).
 * Multi-replica safe — not process memory.
 */
@Injectable()
export class OtpAbuseService {
  constructor(private readonly prisma: PrismaService) {}

  async assertAndIncrementSms(params: {
    subjectKey: string;
    ip: string;
    tx?: TxClient;
  }): Promise<void> {
    const db = params.tx ?? this.prisma.db;
    const now = Date.now();
    const w15 = floorWindow(now, WINDOW_15M_MS);
    const w24 = floorWindow(now, WINDOW_24H_MS);

    await this.bumpOrThrow(db, {
      bucketType: 'sms_subject_15m',
      bucketKey: params.subjectKey,
      windowStart: w15,
      field: 'send',
      limit: SMS_PER_SUBJECT_15M,
      cooldownStyle: true,
    });
    await this.bumpOrThrow(db, {
      bucketType: 'sms_subject_24h',
      bucketKey: params.subjectKey,
      windowStart: w24,
      field: 'send',
      limit: SMS_PER_SUBJECT_24H,
      cooldownStyle: true,
    });
    await this.bumpOrThrow(db, {
      bucketType: 'sms_ip_15m',
      bucketKey: params.ip,
      windowStart: w15,
      field: 'send',
      limit: SMS_PER_IP_15M,
      cooldownStyle: false,
    });
    await this.bumpOrThrow(db, {
      bucketType: 'sms_ip_24h',
      bucketKey: params.ip,
      windowStart: w24,
      field: 'send',
      limit: SMS_PER_IP_24H,
      cooldownStyle: false,
    });
    await this.bumpOrThrow(db, {
      bucketType: 'sms_global_24h',
      bucketKey: 'global',
      windowStart: w24,
      field: 'send',
      limit: SMS_GLOBAL_PER_DAY,
      cooldownStyle: false,
    });
  }

  async assertAndIncrementVerifyIp(ip: string, tx?: TxClient): Promise<void> {
    const db = tx ?? this.prisma.db;
    const w1 = floorWindow(Date.now(), WINDOW_1M_MS);
    await this.bumpOrThrow(db, {
      bucketType: 'verify_ip_1m',
      bucketKey: ip,
      windowStart: w1,
      field: 'verify',
      limit: VERIFY_PER_IP_PER_MIN,
      cooldownStyle: false,
    });
  }

  private async bumpOrThrow(
    db: TxClient | PrismaService['db'],
    opts: {
      bucketType: string;
      bucketKey: string;
      windowStart: Date;
      field: 'send' | 'verify';
      limit: number;
      cooldownStyle: boolean;
    },
  ): Promise<void> {
    // Upsert then conditional increment via raw SQL for atomicity under concurrency.
    await db.otpAbuseCounter.upsert({
      where: {
        bucketType_bucketKey_windowStart: {
          bucketType: opts.bucketType,
          bucketKey: opts.bucketKey,
          windowStart: opts.windowStart,
        },
      },
      create: {
        bucketType: opts.bucketType,
        bucketKey: opts.bucketKey,
        windowStart: opts.windowStart,
        sendCount: 0,
        verifyCount: 0,
      },
      update: {},
    });

    if (opts.field === 'send') {
      const updated = await db.$queryRaw<Array<{ send_count: number }>>`
        UPDATE otp_abuse_counters
        SET send_count = send_count + 1
        WHERE bucket_type = ${opts.bucketType}
          AND bucket_key = ${opts.bucketKey}
          AND window_start = ${opts.windowStart}
          AND send_count < ${opts.limit}
        RETURNING send_count
      `;
      if (updated.length === 0) {
        if (opts.cooldownStyle) {
          throwOtpCooldown();
        }
        throwRateLimited();
      }
      return;
    }

    const updated = await db.$queryRaw<Array<{ verify_count: number }>>`
      UPDATE otp_abuse_counters
      SET verify_count = verify_count + 1
      WHERE bucket_type = ${opts.bucketType}
        AND bucket_key = ${opts.bucketKey}
        AND window_start = ${opts.windowStart}
        AND verify_count < ${opts.limit}
      RETURNING verify_count
    `;
    if (updated.length === 0) {
      throwRateLimited();
    }
  }
}
