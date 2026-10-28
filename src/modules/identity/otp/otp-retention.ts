import type { PrismaClient } from '@prisma/client';
import {
  ABUSE_COUNTER_RETENTION_MS,
  CHALLENGE_RETENTION_MS,
  DELIVERY_ATTEMPT_RETENTION_MS,
} from './otp.constants';

export type OtpRetentionResult = {
  challengesDeleted: number;
  deliveryDeleted: number;
  abuseCountersDeleted: number;
};

/**
 * FK-safe retention (ADR-020 U16 / §13.1):
 * 1) Scrub/delete challenges older than ~24h (SET NULL on delivery FK).
 * 2) Delete delivery attempts older than ~7d.
 * 3) Delete stale abuse counter windows (~48h).
 * Must NOT use CASCADE from challenges → delivery attempts.
 */
export async function scrubExpiredOtpArtifacts(
  db: PrismaClient,
  now: Date = new Date(),
): Promise<OtpRetentionResult> {
  const challengeCutoff = new Date(now.getTime() - CHALLENGE_RETENTION_MS);
  const deliveryCutoff = new Date(
    now.getTime() - DELIVERY_ATTEMPT_RETENTION_MS,
  );
  const abuseCutoff = new Date(now.getTime() - ABUSE_COUNTER_RETENTION_MS);

  await db.otpChallenge.updateMany({
    where: { createdAt: { lt: challengeCutoff } },
    data: {
      codeHash: '',
      sealedDestination: null,
      noticeVersion: '',
      noticeLocale: '',
    },
  });

  const challenges = await db.otpChallenge.deleteMany({
    where: { createdAt: { lt: challengeCutoff } },
  });

  const delivery = await db.otpDeliveryAttempt.deleteMany({
    where: { createdAt: { lt: deliveryCutoff } },
  });

  const abuse = await db.otpAbuseCounter.deleteMany({
    where: { windowStart: { lt: abuseCutoff } },
  });

  return {
    challengesDeleted: challenges.count,
    deliveryDeleted: delivery.count,
    abuseCountersDeleted: abuse.count,
  };
}
