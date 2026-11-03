/** LMP-130: mission status persistence, isolation, consent and occurrence semantics. */
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { NEAR_FAR_CANONICAL_IDS } from '../src/modules/mentor/near-far.ids';
import { MissionStatusService } from '../src/modules/real-world-mission/mission-status.service';
import type { PrismaService } from '../src/modules/prisma/prisma.service';
import { MISSION_STATUS_SCHEMA_VERSION } from '../src/modules/real-world-mission/mission-status.constants';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('LMP-130 mission status / real PostgreSQL', () => {
  const db = new PrismaClient();
  const parentA = randomUUID();
  const parentB = randomUUID();
  const childA = randomUUID();
  const childB = randomUUID();
  const consentPolicy = 'privacy-notice-draft-0';
  const missionId = NEAR_FAR_CANONICAL_IDS.missionId;
  const service = new MissionStatusService({ get db() { return db; } } as PrismaService);

  beforeAll(async () => {
    await db.$connect();
    for (const parentId of [parentA, parentB]) {
      await db.parentAccount.create({ data: { id: parentId, lifecycle: 'active' } });
      await db.consentRecord.create({
        data: {
          parentId,
          purpose: 'essential_play_events',
          policyVersion: consentPolicy,
          status: 'granted',
          source: 'server_consent_store',
          recordedAt: new Date('2026-01-01T00:00:00Z'),
        },
      });
    }
    await db.childProfile.create({
      data: {
        id: childA,
        parentId: parentA,
        ageMonthsAtReference: 32,
        ageReferenceDate: new Date('2026-01-15T00:00:00Z'),
      },
    });
    await db.childProfile.create({
      data: {
        id: childB,
        parentId: parentB,
        ageMonthsAtReference: 32,
        ageReferenceDate: new Date('2026-01-15T00:00:00Z'),
      },
    });
    await db.consentRecord.create({
      data: {
        parentId: parentA,
        childId: childA,
        purpose: 'essential_play_events',
        policyVersion: consentPolicy,
        status: 'granted',
        source: 'server_consent_store',
        recordedAt: new Date('2026-01-01T00:00:00Z'),
      },
    });
  });

  afterAll(async () => {
    await db.parentMissionStatusReport.deleteMany({
      where: { parentId: { in: [parentA, parentB] } },
    });
    await db.consentRecord.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.childProfile.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.parentAccount.deleteMany({ where: { id: { in: [parentA, parentB] } } });
    await db.$disconnect();
  });

  it('persists parent-reported status with idempotent replay', async () => {
    const occurrenceId = randomUUID();
    const idempotencyKey = randomUUID();
    const body = {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: idempotencyKey,
      occurrence_id: occurrenceId,
      status: 'completed',
    };
    const first = await service.submitFeedback(parentA, childA, missionId, body);
    const second = await service.submitFeedback(parentA, childA, missionId, body);
    expect(first.status).toBe('accepted');
    expect(second.status).toBe('duplicate_noop');
    expect(await db.parentMissionStatusReport.count({ where: { parentId: parentA, childId: childA } })).toBe(1);
  });

  it('isolates reads across parents and supports correction transitions', async () => {
    const occurrenceId = randomUUID();
    await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    const corrected = await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: occurrenceId,
      status: 'skipped',
    });
    expect(corrected.report_status).toBe('skipped');
    expect(corrected.revision).toBe(2);

    const listA = await service.listForChild(parentA, childA, {});
    expect(listA.items.some((row) => row.parent_report.status === 'skipped')).toBe(true);

    await expect(service.listForChild(parentB, childA, {})).rejects.toMatchObject({ status: 404 });
  });

  it('hides revoked consent rows at read time', async () => {
    const parentId = randomUUID();
    const childId = randomUUID();
    const occurrenceId = randomUUID();
    await db.parentAccount.create({ data: { id: parentId, lifecycle: 'active' } });
    await db.childProfile.create({
      data: {
        id: childId,
        parentId,
        ageMonthsAtReference: 32,
        ageReferenceDate: new Date('2026-01-15T00:00:00Z'),
      },
    });
    await db.consentRecord.createMany({
      data: [
        {
          parentId,
          purpose: 'essential_play_events',
          policyVersion: consentPolicy,
          status: 'granted',
          source: 'server_consent_store',
          recordedAt: new Date('2026-01-01T00:00:00Z'),
        },
        {
          parentId,
          childId,
          purpose: 'essential_play_events',
          policyVersion: consentPolicy,
          status: 'granted',
          source: 'server_consent_store',
          recordedAt: new Date('2026-01-01T00:00:00Z'),
        },
      ],
    });
    await service.submitFeedback(parentId, childId, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    await db.consentRecord.create({
      data: {
        parentId,
        childId,
        purpose: 'essential_play_events',
        policyVersion: consentPolicy,
        status: 'withdrawn',
        source: 'server_consent_store',
        recordedAt: new Date('2026-02-01T00:00:00Z'),
        revokedAt: new Date('2026-02-01T00:00:00Z'),
      },
    });
    const list = await service.listForChild(parentId, childId, {});
    expect(list.items).toHaveLength(0);
    await db.parentMissionStatusReport.deleteMany({ where: { parentId } });
    await db.consentRecord.deleteMany({ where: { parentId } });
    await db.childProfile.deleteMany({ where: { parentId } });
    await db.parentAccount.delete({ where: { id: parentId } });
  });
});
