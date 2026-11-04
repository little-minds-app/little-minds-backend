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
import type { PrismaService } from '../src/modules/prisma/prisma.service';
import { SessionKpiService } from '../src/modules/session-kpi/session-kpi.service';

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
  const ingestion = new ActivityIngestionService(
    {
      get db() {
        return db;
      },
    } as PrismaService,
    new ActivityBatchAdmissionService(),
  );
  const kpis = new SessionKpiService(
    {
      get db() {
        return db;
      },
    } as PrismaService,
    new ConfigService({}),
  );

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
    await db.activityIngestKey.deleteMany({ where: { parentId: SEED_IDS.parent } });
    await db.activityEvent.deleteMany({ where: { deviceId } });
    await db.activitySession.deleteMany({ where: { deviceId } });
    await db.device.deleteMany({ where: { id: deviceId } });
    await db.$disconnect();
  });

  it('accepts ingest for seeded published Shape Matching content_version_id', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
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
    const rogue = session(sid);
    rogue.content_version_id = randomUUID();
    const result = await ingestion.ingest(SEED_IDS.parent, {
      sessions: [rogue],
      events: [completed(eid, sid)],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'content.unknown_version',
    });
  });

  it('surfaces ingested Shape Matching play in session KPI breakdown', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
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
