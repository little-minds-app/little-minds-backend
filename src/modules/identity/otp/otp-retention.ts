import type { PrismaClient } from '@prisma/client';
import {
  CHALLENGE_RETENTION_MS,
  DELIVERY_ATTEMPT_RETENTION_MS,
} from './otp.constants';

/**
 * FK-safe retention (ADR-020 U16 / §13.1):
 * 1) Scrub/delete challenges older than ~24h (SET NULL on delivery FK).
 * 2) Delete delivery attempts older than ~7d.
 * Must NOT use CASCADE from challenges → delivery attempts.
 */
export async function scrubExpiredOtpArtifacts(
  db: PrismaClient,
  now: Date = new Date(),
): Promise<{ challengesDeleted: number; deliveryDeleted: number }> {
  const challengeCutoff = new Date(now.getTime() - CHALLENGE_RETENTION_MS);
  const deliveryCutoff = new Date(
    now.getTime() - DELIVERY_ATTEMPT_RETENTION_MS,
  );

  // Scrub secrets before delete so any SET NULL race leaves minimized rows.
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

  return {
    challengesDeleted: challenges.count,
    deliveryDeleted: delivery.count,
  };
}
