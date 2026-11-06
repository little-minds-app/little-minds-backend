import type { PrismaService } from '../../src/modules/prisma/prisma.service';

/**
 * Shared OTP PostgreSQL cleanup for HTTP e2e specs that share one DATABASE_URL.
 * Durable abuse counters (verify_ip_1m, sms_*, etc.) are global per bucket_key;
 * parallel Jest workers + `deleteMany({})` races cause flaky 429 on verify.
 * CI runs these specs with `--runInBand`; keep this helper in all OTP PG e2e files.
 */
export async function resetOtpPgE2eState(prisma: PrismaService): Promise<void> {
  await prisma.db.otpAbuseCounter.deleteMany({});
  await prisma.db.otpDeliveryAttempt.deleteMany({});
  await prisma.db.otpChallenge.deleteMany({});
}
