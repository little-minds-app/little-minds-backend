/** LMP-130: mission status persistence, idempotency ledger, concurrency, bounded-window reads. */
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { NEAR_FAR_CANONICAL_IDS } from '../src/modules/mentor/near-far.ids';
import { MissionStatusService } from '../src/modules/real-world-mission/mission-status.service';
import type { PrismaService } from '../src/modules/prisma/prisma.service';
import { MISSION_STATUS_SCHEMA_VERSION } from '../src/modules/real-world-mission/mission-status.constants';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

function listWindowAroundNow(): { from: string; to: string } {
  const to = new Date(Date.now() + 60_000);
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

describeDb('LMP-130 mission status / real PostgreSQL', () => {
  const db = new PrismaClient();
  const parentA = randomUUID();
  const parentB = randomUUID();
  const childA = randomUUID();
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
    await db.parentMissionStatusIdempotencyKey.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.parentMissionStatusReport.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.consentRecord.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.childProfile.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.parentAccount.deleteMany({ where: { id: { in: [parentA, parentB] } } });
    await db.$disconnect();
  });

  it('A completes, B corrects to skipped, retry A is duplicate_noop without rollback', async () => {
    const occurrenceId = randomUUID();
    const keyA = randomUUID();
    const keyB = randomUUID();
    const accepted = await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: keyA,
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    expect(accepted.status).toBe('accepted');
    expect(accepted.report_status).toBe('completed');

    const corrected = await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: keyB,
      occurrence_id: occurrenceId,
      status: 'skipped',
    });
    expect(corrected.report_status).toBe('skipped');

    const retryA = await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: keyA,
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    expect(retryA.status).toBe('duplicate_noop');
    expect(retryA.report_status).toBe('completed');

    const row = await db.parentMissionStatusReport.findFirstOrThrow({
      where: { parentId: parentA, childId: childA, occurrenceId },
    });
    expect(row.reportStatus).toBe('skipped');
    expect(await db.parentMissionStatusIdempotencyKey.count({ where: { parentId: parentA } })).toBe(2);
  });

  it('serializes valid competing corrections with one revision increment each', async () => {
    const occurrenceId = randomUUID();
    await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: occurrenceId,
      status: 'not_now',
    });

    const completed = await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    const skipped = await service.submitFeedback(parentA, childA, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: occurrenceId,
      status: 'skipped',
    });

    expect(completed.revision).toBe(2);
    expect(skipped.revision).toBe(3);
    expect(
      await db.parentMissionStatusIdempotencyKey.count({
        where: { parentId: parentA, childId: childA, occurrenceId },
      }),
    ).toBe(3);
  });

  it('returns all consent-eligible rows inside the required window without scan-cap loss', async () => {
    const parentId = randomUUID();
    const childId = randomUUID();
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

    const occurrenceIds: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      const occurrenceId = randomUUID();
      occurrenceIds.push(occurrenceId);
      await service.submitFeedback(parentId, childId, missionId, {
        schema_version: MISSION_STATUS_SCHEMA_VERSION,
        idempotency_key: randomUUID(),
        occurrence_id: occurrenceId,
        status: 'completed',
      });
    }

    const limited = await service.listForChild(parentId, childId, { ...listWindowAroundNow(), limit: '2' });
    expect(limited.items).toHaveLength(2);
    expect(limited.pagination.truncated).toBe(true);

    const full = await service.listForChild(parentId, childId, { ...listWindowAroundNow(), limit: '100' });
    expect(full.items).toHaveLength(5);
    expect(full.pagination.truncated).toBe(false);

    await db.parentMissionStatusIdempotencyKey.deleteMany({ where: { parentId } });
    await db.parentMissionStatusReport.deleteMany({ where: { parentId } });
    await db.consentRecord.deleteMany({ where: { parentId } });
    await db.childProfile.deleteMany({ where: { parentId } });
    await db.parentAccount.delete({ where: { id: parentId } });
  });

  it('keeps older eligible reports when newer rows fail consent re-check', async () => {
    const parentId = randomUUID();
    const childId = randomUUID();
    const olderOccurrence = randomUUID();
    const newerOccurrence = randomUUID();
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
      occurrence_id: olderOccurrence,
      status: 'completed',
    });
    const window = listWindowAroundNow();
    await db.parentMissionStatusReport.updateMany({
      where: { parentId, childId, occurrenceId: olderOccurrence },
      data: { recordedAt: new Date(new Date(window.from).getTime() + 86_400_000) },
    });

    await service.submitFeedback(parentId, childId, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: randomUUID(),
      occurrence_id: newerOccurrence,
      status: 'skipped',
    });
    await db.parentMissionStatusReport.updateMany({
      where: { parentId, childId, occurrenceId: newerOccurrence },
      data: {
        recordedAt: new Date(new Date(window.to).getTime() - 86_400_000),
        consentPolicyVersion: 'legacy-ungranted-policy',
      },
    });

    const list = await service.listForChild(parentId, childId, window);
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.occurrence_id).toBe(olderOccurrence);

    await db.parentMissionStatusIdempotencyKey.deleteMany({ where: { parentId } });
    await db.parentMissionStatusReport.deleteMany({ where: { parentId } });
    await db.consentRecord.deleteMany({ where: { parentId } });
    await db.childProfile.deleteMany({ where: { parentId } });
    await db.parentAccount.delete({ where: { id: parentId } });
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
    const list = await service.listForChild(parentId, childId, listWindowAroundNow());
    expect(list.items).toHaveLength(0);
    await db.parentMissionStatusIdempotencyKey.deleteMany({ where: { parentId } });
    await db.parentMissionStatusReport.deleteMany({ where: { parentId } });
    await db.consentRecord.deleteMany({ where: { parentId } });
    await db.childProfile.deleteMany({ where: { parentId } });
    await db.parentAccount.delete({ where: { id: parentId } });
  });
});
