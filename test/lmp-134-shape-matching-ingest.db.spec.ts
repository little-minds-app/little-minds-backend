/** LMP-134: Shape Matching published content_version_id + ingest + KPI path. */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import {
  SEED_IDS,
  SHAPE_MATCHING_PUBLICATION,
  seedSyntheticFixtures,
} from '../prisma/seed';
import { ActivityBatchAdmissionService } from '../src/modules/activity-ingestion/activity-batch-admission.service';
import { ActivityIngestionService } from '../src/modules/activity-ingestion/activity-ingestion.service';
import { scopedDeviceId } from '../src/modules/identity/session/session-issuer.service';
import type { PrismaService } from '../src/modules/prisma/prisma.service';
import { SessionKpiService } from '../src/modules/session-kpi/session-kpi.service';
import { ParentConsentService } from '../src/modules/consent-privacy/parent-consent.service';
import type { AppEnv } from '../src/config/env.validation';
import { PhoneOtpService } from '../src/modules/identity/otp/phone-otp.service';
import { SessionIssuerService } from '../src/modules/identity/session/session-issuer.service';
import { JwtAccessService } from '../src/modules/identity/session/jwt-access.service';
import { OtpAbuseService } from '../src/modules/identity/otp/otp-abuse.service';
import { FakeSmsSender } from '../src/modules/identity/sms/fake-sms.sender';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
} from '../src/modules/identity/otp/otp.constants';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_OTP_PEPPER,
  TEST_PHONE_SUBJECT_PEPPER,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';
import { noopStructuredLogger } from './helpers/noop-structured-logger';

/**
 * Isolation: uses seeded synthetic parent but only deletes rows created by this suite
 * (tracked session/event UUIDs + ephemeral device). Never parent-wide ingest-key wipes
 * on shared UAT databases.
 */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
const fixture = (name: string): Record<string, unknown> =>
  JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'contracts', 'fixtures', 'activity', name),
      'utf8',
    ),
  ) as Record<string, unknown>;

describeDb('LMP-134 Shape Matching production telemetry / PostgreSQL', () => {
  const db = new PrismaClient();
  const childId = SEED_IDS.children[32];
  const deviceId = randomUUID();
  const contentVersionId = SEED_IDS.shapeMatching.contentVersionId;
  const policyVersion = SHAPE_MATCHING_PUBLICATION.policyVersion;
  const createdPlaySessionIds: string[] = [];
  const createdEventIds: string[] = [];
  const ingestion = new ActivityIngestionService(
    {
      get db() {
        return db;
      },
    } as PrismaService,
    new ActivityBatchAdmissionService(noopStructuredLogger()),
    noopStructuredLogger(),
  );
  const kpis = new SessionKpiService(
    {
      get db() {
        return db;
      },
    } as PrismaService,
    new ConfigService({}),
  );
  const prismaService = {
    get db() {
      return db;
    },
  } as PrismaService;
  const parentConsent = new ParentConsentService(prismaService);

  const session = (playSessionId: string): Record<string, unknown> => ({
    ...fixture('valid-activity-session.json'),
    play_session_id: playSessionId,
    device_id: deviceId,
    content_version_id: contentVersionId,
    consent: {
      purpose: 'essential_play_events',
      policy_version: policyVersion,
      consent_scope: 'essential_play_events',
      decision: 'granted',
    },
  });

  const completed = (
    eventId: string,
    playSessionId: string,
  ): Record<string, unknown> => ({
    ...fixture('valid-activity-completed.json'),
    event_id: eventId,
    play_session_id: playSessionId,
    device_id: deviceId,
    content_version_id: contentVersionId,
    consent_scope: 'essential_play_events',
    consent_policy_version: policyVersion,
  });

  beforeAll(async () => {
    await db.$connect();
    await seedSyntheticFixtures(db);
    await db.device.create({
      data: {
        id: deviceId,
        parentId: SEED_IDS.parent,
        childId,
        platform: 'ios',
      },
    });
  });

  afterAll(async () => {
    if (createdEventIds.length > 0) {
      await db.activityIngestKey.deleteMany({
        where: { eventId: { in: createdEventIds } },
      });
      await db.activityEvent.deleteMany({
        where: { eventId: { in: createdEventIds } },
      });
    }
    if (createdPlaySessionIds.length > 0) {
      await db.activitySession.deleteMany({
        where: { id: { in: createdPlaySessionIds } },
      });
    }
    await db.device.deleteMany({ where: { id: deviceId } });
    await db.$disconnect();
  });

  it('accepts ingest for seeded published Shape Matching content_version_id', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdPlaySessionIds.push(sid);
    createdEventIds.push(eid);
    const body = {
      sessions: [
        session(sid),
      ],
      events: [completed(eid, sid)],
    };
    const first = await ingestion.ingest(SEED_IDS.parent, body);
    expect(first.results[0]).toMatchObject({ status: 'accepted' });
    const replay = await ingestion.ingest(SEED_IDS.parent, body);
    expect(replay.results[0]).toMatchObject({ status: 'duplicate_noop' });
  });

  it('rejects fabricated content_version_id not present in catalog', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdPlaySessionIds.push(sid);
    createdEventIds.push(eid);
    const unknownVersionId = randomUUID();
    const rogueSession = session(sid);
    rogueSession.content_version_id = unknownVersionId;
    const rogueEvent = completed(eid, sid);
    rogueEvent.content_version_id = unknownVersionId;
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [rogueSession],
      events: [rogueEvent],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'content.unknown_version',
    });
  });

  it('returns session.pending when event uses published version but session metadata is absent', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdEventIds.push(eid);
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [],
      events: [completed(eid, sid)],
    });
    expect(result.results[0]).toMatchObject({
      status: 'retryable',
      reason_code: 'session.pending',
    });
  });

  it('returns session.pending when session device_id is not parent-scoped but events use scoped device row', async () => {
    const installationId = randomUUID();
    const scopedId = scopedDeviceId(installationId, SEED_IDS.parent);
    await db.device.deleteMany({ where: { id: deviceId } });
    await db.device.create({
      data: {
        id: scopedId,
        parentId: SEED_IDS.parent,
        childId,
        platform: 'ios',
      },
    });
    const sid = randomUUID();
    const eid = randomUUID();
    createdEventIds.push(eid);
    const rogueSession = session(sid);
    rogueSession.device_id = installationId;
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [rogueSession],
      events: [
        {
          ...completed(eid, sid),
          device_id: scopedId,
        },
      ],
    });
    expect(result.results[0]).toMatchObject({
      status: 'retryable',
      reason_code: 'session.pending',
    });
    expect(await db.activitySession.count({ where: { id: sid } })).toBe(0);
    await db.device.deleteMany({ where: { id: scopedId } });
    await db.device.create({
      data: {
        id: deviceId,
        parentId: SEED_IDS.parent,
        childId,
        platform: 'ios',
      },
    });
  });

  it('rejects events with consent.not_authorized when session consent policy_version fails', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdEventIds.push(eid);
    const rogueSession = session(sid);
    rogueSession.consent = {
      ...(rogueSession.consent as Record<string, unknown>),
      policy_version: 'privacy-notice-draft-0',
    };
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [rogueSession],
      events: [completed(eid, sid)],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'consent.not_authorized',
    });
    expect(await db.activitySession.count({ where: { id: sid } })).toBe(0);
    expect(await db.activityEvent.count({ where: { eventId: eid } })).toBe(0);
  });

  it('rejects events when essential_play_events grant is absent for parent', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdEventIds.push(eid);
    await db.consentRecord.deleteMany({
      where: { parentId: SEED_IDS.parent, purpose: 'essential_play_events' },
    });
    try {
      const result = await ingestion.ingest(SEED_IDS.parent, {
        sessions: [session(sid)],
        events: [completed(eid, sid)],
      });
      expect(result.results[0]).toMatchObject({
        status: 'rejected',
        reason_code: 'consent.not_authorized',
      });
    } finally {
      await db.consentRecord.upsert({
        where: { id: SEED_IDS.consentPlayEventsParent },
        update: {
          parentId: SEED_IDS.parent,
          purpose: 'essential_play_events',
          policyVersion: policyVersion,
          status: 'granted',
          source: 'server_consent_store',
          revokedAt: null,
        },
        create: {
          id: SEED_IDS.consentPlayEventsParent,
          parentId: SEED_IDS.parent,
          purpose: 'essential_play_events',
          policyVersion: policyVersion,
          status: 'granted',
          recordedAt: new Date('2026-01-01T12:03:00.000Z'),
          source: 'server_consent_store',
        },
      });
    }
  });

  it('returns session.pending when session has unknown version but event references published catalog id', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdEventIds.push(eid);
    const rogueSession = session(sid);
    rogueSession.content_version_id = randomUUID();
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [rogueSession],
      events: [completed(eid, sid)],
    });
    expect(result.results[0]).toMatchObject({
      status: 'retryable',
      reason_code: 'session.pending',
    });
  });

  it('accepts ingest after explicit consent grant API (no seed grant)', async () => {
    await db.consentRecord.deleteMany({
      where: { parentId: SEED_IDS.parent, purpose: 'essential_play_events' },
    });
    await parentConsent.grant(SEED_IDS.parent, {
      consent_scope: 'essential_play_events',
      policy_version: policyVersion,
      child_id: null,
    });
    const sid = randomUUID();
    const eid = randomUUID();
    createdPlaySessionIds.push(sid);
    createdEventIds.push(eid);
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [session(sid)],
      events: [completed(eid, sid)],
    });
    expect(result.results[0]).toMatchObject({ status: 'accepted' });
    await db.consentRecord.upsert({
      where: { id: SEED_IDS.consentPlayEventsParent },
      update: {
        parentId: SEED_IDS.parent,
        purpose: 'essential_play_events',
        policyVersion: policyVersion,
        status: 'granted',
        source: 'server_consent_store',
        revokedAt: null,
      },
      create: {
        id: SEED_IDS.consentPlayEventsParent,
        parentId: SEED_IDS.parent,
        purpose: 'essential_play_events',
        policyVersion: policyVersion,
        status: 'granted',
        recordedAt: new Date('2026-01-01T12:03:00.000Z'),
        source: 'server_consent_store',
      },
    });
  });

  it('blocks ingest after consent withdrawal API', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdEventIds.push(eid);
    await parentConsent.withdraw(SEED_IDS.parent, {
      consent_scope: 'essential_play_events',
      policy_version: policyVersion,
      child_id: null,
    });
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [session(sid)],
      events: [completed(eid, sid)],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'consent.not_authorized',
    });
    // Latest-effective ordering: a grant older than the withdrawal does not
    // re-authorize. Restore suite isolation with an append-only grant that is
    // newer than the withdrawal (same ParentConsentService path as product).
    await parentConsent.grant(SEED_IDS.parent, {
      consent_scope: 'essential_play_events',
      policy_version: policyVersion,
      child_id: null,
    });
  });

  it('phone sign-in does not auto-grant essential_play_events; grant then ingest accepts', async () => {
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM ??= TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM ??= TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER ??= TEST_REFRESH_PEPPER;
    process.env.OTP_PEPPER ??= TEST_OTP_PEPPER;
    process.env.PHONE_SUBJECT_PEPPER ??= TEST_PHONE_SUBJECT_PEPPER;

    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
          JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
          JWT_KEY_ID: 'lmp-134-consent',
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
    const sessions = new SessionIssuerService(prismaService, jwt, config);
    const fakeSms = new FakeSmsSender(config);
    const phoneOtp = new PhoneOtpService(
      prismaService,
      sessions,
      new OtpAbuseService(prismaService),
      config,
      fakeSms,
    );
    const phone = '+905554441122';
    const start = await phoneOtp.start(
      { socket: { remoteAddress: '127.0.0.1' }, headers: {} } as never,
      {
        phone,
        noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
        noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      },
    );
    const verified = await phoneOtp.verify(
      { socket: { remoteAddress: '127.0.0.1' }, headers: {} } as never,
      {
        challengeId: start.challenge_id,
        code: fakeSms.peekCodeForTests(start.challenge_id)!,
      },
    );
    const newParentId = verified.parent_id;
    const autoGrant = await db.consentRecord.count({
      where: {
        parentId: newParentId,
        purpose: 'essential_play_events',
        source: 'server_consent_store',
        status: 'granted',
      },
    });
    expect(autoGrant).toBe(0);

    await parentConsent.grant(newParentId, {
      consent_scope: 'essential_play_events',
      policy_version: policyVersion,
      child_id: null,
    });

    const ephemeralDevice = randomUUID();
    await db.device.create({
      data: {
        id: ephemeralDevice,
        parentId: newParentId,
        childId,
        platform: 'ios',
      },
    });
    const sid = randomUUID();
    const eid = randomUUID();
    const body = {
      sessions: [
        {
          ...session(sid),
          device_id: ephemeralDevice,
        },
      ],
      events: [
        {
          ...completed(eid, sid),
          device_id: ephemeralDevice,
        },
      ],
    };
    const ingested = await ingestion.ingest(newParentId, body);
    expect(ingested.results[0]).toMatchObject({ status: 'accepted' });

    await db.activityIngestKey.deleteMany({ where: { eventId: eid } });
    await db.activityEvent.deleteMany({ where: { eventId: eid } });
    await db.activitySession.deleteMany({ where: { id: sid } });
    await db.device.deleteMany({ where: { id: ephemeralDevice } });
    await db.consentRecord.deleteMany({ where: { parentId: newParentId } });
    await db.parentSession.deleteMany({ where: { parentId: newParentId } });
    await db.parentIdentity.deleteMany({ where: { parentId: newParentId } });
    await db.parentAccount.deleteMany({ where: { id: newParentId } });
    await db.otpChallenge.deleteMany({ where: { id: start.challenge_id } });
  });

  it('surfaces ingested Shape Matching play in session KPI breakdown', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    createdPlaySessionIds.push(sid);
    createdEventIds.push(eid);
    const startedAt = '2026-03-10T09:00:00.000Z';
    const endedAt = '2026-03-10T09:01:30.000Z';
    await ingestion.ingest(SEED_IDS.parent, {
      sessions: [
        session(sid),
      ].map(row => ({
        ...row,
        started_at: startedAt,
        ended_at: endedAt,
        monotonic_duration_seconds: 90,
      })),
      events: [
        completed(eid, sid),
      ].map(row => ({ ...row, occurred_at: endedAt })),
    });

    const result = await kpis.aggregate(SEED_IDS.parent, {
      from: '2026-03-10T00:00:00.000Z',
      to: '2026-03-11T00:00:00.000Z',
      timezone: 'UTC',
      childId,
    });

    const row = result.metrics.by_activity.find(
      (entry) => entry.content_version_id === contentVersionId,
    );
    expect(row).toMatchObject({
      content_version_id: contentVersionId,
      session_starts: 1,
      completed_sessions: 1,
      play_duration_seconds: 90,
    });
  });
});
