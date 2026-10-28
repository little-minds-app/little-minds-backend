/**
 * Real PostgreSQL OTP concurrency / retention / mint rollback (LMP-34 / ADR-020).
 */
import { ConfigService } from '@nestjs/config';
import {
  OtpChallengeStatus,
  OtpDeliveryState,
  ParentAccountLifecycle,
  PrismaClient,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AppEnv } from '../src/config/env.validation';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAccessService } from '../src/modules/identity/session/jwt-access.service';
import { SessionIssuerService } from '../src/modules/identity/session/session-issuer.service';
import { OtpAbuseService } from '../src/modules/identity/otp/otp-abuse.service';
import { PhoneOtpService } from '../src/modules/identity/otp/phone-otp.service';
import { FakeSmsSender } from '../src/modules/identity/sms/fake-sms.sender';
import { scrubExpiredOtpArtifacts } from '../src/modules/identity/otp/otp-retention';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
  PHONE_PROVIDER,
} from '../src/modules/identity/otp/otp.constants';
import { phoneSubjectKey } from '../src/modules/identity/otp/otp-crypto';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_OTP_PEPPER,
  TEST_PHONE_SUBJECT_PEPPER,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

function mockReq(ip = '127.0.0.1') {
  return {
    socket: { remoteAddress: ip },
    headers: {},
  } as never;
}

describeDb('Phone OTP against PostgreSQL (LMP-34)', () => {
  const prisma = new PrismaClient();
  let phoneOtp: PhoneOtpService;
  let fakeSms: FakeSmsSender;
  let sessions: SessionIssuerService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM ??= TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM ??= TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER ??= TEST_REFRESH_PEPPER;
    process.env.OTP_PEPPER ??= TEST_OTP_PEPPER;
    process.env.PHONE_SUBJECT_PEPPER ??= TEST_PHONE_SUBJECT_PEPPER;
    process.env.SMS_SENDER = 'fake';
    process.env.APP_ENV = 'development';

    await prisma.$connect();

    const prismaService = {
      get db() {
        return prisma;
      },
    } as unknown as PrismaService;

    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
          JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
          JWT_KEY_ID: 'db-test',
          REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
          OTP_PEPPER: TEST_OTP_PEPPER,
          PHONE_SUBJECT_PEPPER: TEST_PHONE_SUBJECT_PEPPER,
          SMS_SENDER: 'fake',
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;

    const jwt = new JwtAccessService(config);
    await jwt.onModuleInit();
    sessions = new SessionIssuerService(prismaService, jwt, config);
    const abuse = new OtpAbuseService(prismaService);
    fakeSms = new FakeSmsSender(config);
    phoneOtp = new PhoneOtpService(
      prismaService,
      sessions,
      abuse,
      config,
      fakeSms,
    );
  });

  afterAll(async () => {
    await prisma.otpDeliveryAttempt.deleteMany({});
    await prisma.otpChallenge.deleteMany({});
    await prisma.otpAbuseCounter.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    fakeSms.clearInboxForTests();
    await prisma.otpDeliveryAttempt.deleteMany({});
    await prisma.otpChallenge.deleteMany({});
    await prisma.otpAbuseCounter.deleteMany({});
  });

  it('migrated OTP tables exist', async () => {
    const tables = await prisma.$queryRaw<Array<{ relname: string }>>`
      SELECT relname FROM pg_class
      WHERE relname IN ('otp_challenges', 'otp_delivery_attempts', 'otp_abuse_counters')
        AND relkind = 'r'
    `;
    expect(tables.map((t) => t.relname).sort()).toEqual([
      'otp_abuse_counters',
      'otp_challenges',
      'otp_delivery_attempts',
    ]);
  });

  it('concurrent verify is single-winner', async () => {
    const start = await phoneOtp.start(mockReq(), {
      phone: '+905551234567',
      noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
      noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
    });
    const code = fakeSms.peekCodeForTests(start.challenge_id)!;

    const results = await Promise.allSettled([
      phoneOtp.verify(mockReq(), { challengeId: start.challenge_id, code }),
      phoneOtp.verify(mockReq(), { challengeId: start.challenge_id, code }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const challenge = await prisma.otpChallenge.findUnique({
      where: { id: start.challenge_id },
    });
    expect(challenge?.status).toBe(OtpChallengeStatus.consumed);
  });

  it('mint failure rolls back consume + new parent + notice evidence', async () => {
    const start = await phoneOtp.start(mockReq('10.0.0.9'), {
      phone: '+905559876543',
      noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
      noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
    });
    const code = fakeSms.peekCodeForTests(start.challenge_id)!;

    // Pre-create 20 active sessions for a parent we will force onto via
    // monkey-patching mintSessionTx to throw session_limit after identity create
    // is complex; instead force mintSessionTx to throw mid-txn.
    const original = sessions.mintSessionTx.bind(sessions);
    sessions.mintSessionTx = async () => {
      throw Object.assign(new Error('forced mint failure'), {
        response: { error: 'session_limit_exceeded' },
        status: 403,
      });
    };

    await expect(
      phoneOtp.verify(mockReq('10.0.0.9'), {
        challengeId: start.challenge_id,
        code,
      }),
    ).rejects.toBeTruthy();

    sessions.mintSessionTx = original;

    const challenge = await prisma.otpChallenge.findUnique({
      where: { id: start.challenge_id },
    });
    expect(challenge?.status).toBe(OtpChallengeStatus.pending);

    const subject = phoneSubjectKey(
      '+905559876543',
      TEST_PHONE_SUBJECT_PEPPER,
    );
    const identity = await prisma.parentIdentity.findFirst({
      where: { provider: PHONE_PROVIDER, providerSubject: subject },
    });
    expect(identity).toBeNull();
  });

  it('24h challenge purge preserves in-window delivery attempts (no CASCADE)', async () => {
    const challengeId = randomUUID();
    const oldCreated = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await prisma.otpChallenge.create({
      data: {
        id: challengeId,
        provider: PHONE_PROVIDER,
        subjectKey: 'subj-retention',
        codeHash: 'hash',
        status: OtpChallengeStatus.consumed,
        deliveryState: OtpDeliveryState.sent,
        expiresAt: oldCreated,
        noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
        noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
        noticePresentedAt: oldCreated,
        createdAt: oldCreated,
        updatedAt: oldCreated,
      },
    });
    const deliveryId = randomUUID();
    await prisma.otpDeliveryAttempt.create({
      data: {
        id: deliveryId,
        challengeId,
        challengeIdSnapshot: challengeId,
        adapter: 'fake',
        result: 'sent',
        createdAt: new Date(), // within 7d
      },
    });

    const result = await scrubExpiredOtpArtifacts(prisma);
    expect(result.challengesDeleted).toBeGreaterThanOrEqual(1);

    const delivery = await prisma.otpDeliveryAttempt.findUnique({
      where: { id: deliveryId },
    });
    expect(delivery).not.toBeNull();
    expect(delivery?.challengeId).toBeNull(); // SET NULL
    expect(delivery?.challengeIdSnapshot).toBe(challengeId);
  });

  it('retention also purges stale abuse counters and 7d+ delivery rows', async () => {
    const oldWindow = new Date(Date.now() - 49 * 60 * 60 * 1000);
    await prisma.otpAbuseCounter.create({
      data: {
        bucketType: 'sms_ip_15m',
        bucketKey: '10.0.0.50',
        windowStart: oldWindow,
        sendCount: 1,
        verifyCount: 0,
      },
    });
    const oldDeliveryId = randomUUID();
    await prisma.otpDeliveryAttempt.create({
      data: {
        id: oldDeliveryId,
        challengeId: null,
        challengeIdSnapshot: randomUUID(),
        adapter: 'fake',
        result: 'sent',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    });

    const result = await scrubExpiredOtpArtifacts(prisma);
    expect(result.abuseCountersDeleted).toBeGreaterThanOrEqual(1);
    expect(result.deliveryDeleted).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.otpDeliveryAttempt.findUnique({ where: { id: oldDeliveryId } }),
    ).toBeNull();
    expect(
      await prisma.otpAbuseCounter.findUnique({
        where: {
          bucketType_bucketKey_windowStart: {
            bucketType: 'sms_ip_15m',
            bucketKey: '10.0.0.50',
            windowStart: oldWindow,
          },
        },
      }),
    ).toBeNull();
  });

  it('concurrent start is race-safe: one pending winner + cooldown loser', async () => {
    const phone = '+905551000111';
    const input = {
      phone,
      noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
      noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
    };
    const results = await Promise.allSettled([
      phoneOtp.start(mockReq('10.0.1.1'), input),
      phoneOtp.start(mockReq('10.0.1.1'), input),
    ]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    const rejectedErr = (rejected[0] as PromiseRejectedResult).reason as {
      status?: number;
      response?: { error?: string };
      getStatus?: () => number;
      getResponse?: () => { error?: string } | string;
    };
    const status = rejectedErr.getStatus?.() ?? rejectedErr.status;
    const raw =
      rejectedErr.getResponse?.() ?? rejectedErr.response ?? {};
    const body = typeof raw === 'string' ? { error: raw } : raw;
    expect(status).toBe(429);
    expect(body.error).toBe('otp_cooldown');

    const subject = phoneSubjectKey(phone, TEST_PHONE_SUBJECT_PEPPER);
    const pending = await prisma.otpChallenge.findMany({
      where: {
        provider: PHONE_PROVIDER,
        subjectKey: subject,
        status: OtpChallengeStatus.pending,
      },
    });
    expect(pending).toHaveLength(1);
  });

  it('SMS adapter throw → sms_unavailable, failed delivery row, no pending leak', async () => {
    fakeSms.throwNextSendForTests();
    let thrown: unknown;
    try {
      await phoneOtp.start(mockReq('10.0.2.2'), {
        phone: '+905551000222',
        noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
        noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeTruthy();
    const smsErr = thrown as {
      getStatus?: () => number;
      getResponse?: () => { error?: string };
      status?: number;
      response?: { error?: string };
    };
    expect(smsErr.getStatus?.() ?? smsErr.status).toBe(503);
    const smsBody = smsErr.getResponse?.() ?? smsErr.response;
    expect(smsBody).toEqual(
      expect.objectContaining({ error: 'sms_unavailable' }),
    );

    const subject = phoneSubjectKey('+905551000222', TEST_PHONE_SUBJECT_PEPPER);
    const pending = await prisma.otpChallenge.count({
      where: {
        provider: PHONE_PROVIDER,
        subjectKey: subject,
        status: OtpChallengeStatus.pending,
      },
    });
    expect(pending).toBe(0);

    const failed = await prisma.otpDeliveryAttempt.findFirst({
      where: { result: 'failed', adapter: 'fake' },
      orderBy: { createdAt: 'desc' },
    });
    expect(failed).not.toBeNull();
    expect(failed?.challengeIdSnapshot).toBeTruthy();
  });

  it('ADR-019 mintSession still works via mintSessionTx wrapper', async () => {
    const parentId = randomUUID();
    await prisma.parentAccount.create({
      data: {
        id: parentId,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
    });
    const pair = await sessions.mintSession({ parentId, clientSurface: 'test' });
    expect(pair.session_id).toBeTruthy();
    await prisma.parentSession.deleteMany({ where: { parentId } });
    await prisma.parentAccount.delete({ where: { id: parentId } });
  });
});
