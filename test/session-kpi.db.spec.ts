/** LMP-52: session KPI aggregation over ingested PostgreSQL data. */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { ActivityBatchAdmissionService } from '../src/modules/activity-ingestion/activity-batch-admission.service';
import { ActivityIngestionService } from '../src/modules/activity-ingestion/activity-ingestion.service';
import type { PrismaService } from '../src/modules/prisma/prisma.service';
import { SessionKpiService } from '../src/modules/session-kpi/session-kpi.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
const fixture = (name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(resolve(process.cwd(), 'contracts', 'fixtures', 'activity', name), 'utf8')) as Record<string, unknown>;

describeDb('LMP-52 session KPI aggregation / real PostgreSQL', () => {
  const db = new PrismaClient();
  const parentA = randomUUID();
  const parentB = randomUUID();
  const childA = randomUUID();
  const childB = randomUUID();
  const deviceA = randomUUID();
  const deviceB = randomUUID();
  const domainId = randomUUID();
  const goalId = randomUUID();
  const mechanicId = randomUUID();
  const definitionId = randomUUID();
  const variantId = randomUUID();
  const consentPolicy = 'privacy-notice-draft-0';
  const ingestion = new ActivityIngestionService({ get db() { return db; } } as PrismaService, new ActivityBatchAdmissionService());
  const kpis = new SessionKpiService({ get db() { return db; } } as PrismaService, new ConfigService({}));

  const session = (id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    ...fixture('valid-activity-session.json'),
    play_session_id: id,
    device_id: deviceA,
    content_version_id: variantId,
    ...overrides,
  });
  const event = (id: string, sessionId: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    ...fixture('valid-activity-completed.json'),
    event_id: id,
    play_session_id: sessionId,
    device_id: deviceA,
    content_version_id: variantId,
    ...overrides,
  });

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
    await db.childProfile.create({ data: { id: childA, parentId: parentA, ageMonthsAtReference: 32, ageReferenceDate: new Date('2026-01-15T00:00:00Z') } });
    await db.childProfile.create({ data: { id: childB, parentId: parentB, ageMonthsAtReference: 32, ageReferenceDate: new Date('2026-01-15T00:00:00Z') } });
    await db.consentRecord.create({
      data: {
        parentId: parentB,
        childId: childB,
        purpose: 'essential_play_events',
        policyVersion: consentPolicy,
        status: 'granted',
        source: 'server_consent_store',
        recordedAt: new Date('2026-01-01T00:00:00Z'),
      },
    });
    await db.device.create({ data: { id: deviceA, parentId: parentA, childId: childA, platform: 'ios' } });
    await db.device.create({ data: { id: deviceB, parentId: parentB, childId: childB, platform: 'ios' } });
    await db.learningDomain.create({ data: { id: domainId, code: 'lmp52-' + domainId, labelKey: 'test' } });
    await db.learningGoal.create({ data: { id: goalId, domainId, objectiveKey: 'test' } });
    await db.gameMechanic.create({ data: { id: mechanicId, code: 'lmp52-' + mechanicId, engineVersion: '1.0.0' } });
    await db.activityDefinition.create({ data: { id: definitionId, mechanicId, learningGoalId: goalId, minAgeMonths: 24, maxAgeMonths: 71, safetyClass: 'low', status: 'published' } });
    await db.activityVariant.create({ data: { id: variantId, activityId: definitionId, version: 1, reviewStatus: 'published' } });
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
    await db.activityIngestKey.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.activityEvent.deleteMany({ where: { childId: { in: [childA, childB] } } });
    await db.activitySession.deleteMany({ where: { childId: { in: [childA, childB] } } });
    await db.consentRecord.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.device.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.childProfile.deleteMany({ where: { id: { in: [childA, childB] } } });
    await db.parentAccount.deleteMany({ where: { id: { in: [parentA, parentB] } } });
    await db.activityVariant.deleteMany({ where: { id: variantId } });
    await db.activityDefinition.deleteMany({ where: { id: definitionId } });
    await db.gameMechanic.deleteMany({ where: { id: mechanicId } });
    await db.learningGoal.deleteMany({ where: { id: goalId } });
    await db.learningDomain.deleteMany({ where: { id: domainId } });
    await db.$disconnect();
  });

  it('dedupes replayed ingest and counts one eligible session', async () => {
    const sid = randomUUID();
    const eid = randomUUID();
    const body = { sessions: [session(sid, { started_at: '2026-02-01T10:00:00.000Z', ended_at: '2026-02-01T10:02:00.000Z' })], events: [event(eid, sid, { occurred_at: '2026-02-01T10:02:00.000Z' })] };
    await ingestion.ingest(parentA, body);
    await ingestion.ingest(parentA, body);
    const result = await kpis.aggregate(parentA, {
      from: '2026-02-01T00:00:00.000Z',
      to: '2026-02-02T00:00:00.000Z',
      timezone: 'UTC',
      childId: childA,
    });
    expect(result.metrics.eligible_session_count).toBe(1);
    expect(result.metrics.total_play_duration_seconds).toBe(84);
    expect(result.metrics.first_attempt_accuracy).toMatchObject({
      availability_status: 'available',
      numerator: 5,
      denominator: 6,
    });
  });

  it('isolates cross-parent reads', async () => {
    const sid = randomUUID();
    await ingestion.ingest(parentB, {
      sessions: [session(sid, { device_id: deviceB, started_at: '2026-02-03T10:00:00.000Z' })],
      events: [],
    });
    const result = await kpis.aggregate(parentA, {
      from: '2026-02-01T00:00:00.000Z',
      to: '2026-02-10T00:00:00.000Z',
      timezone: 'UTC',
    });
    expect(result.metrics.eligible_session_count).toBe(1);
    expect(result.sample.excluded_consent).toBe(0);
  });

  it('uses window-scoped freshness for an empty KPI window', async () => {
    const result = await kpis.aggregate(parentA, {
      from: '2026-03-01T00:00:00.000Z',
      to: '2026-03-02T00:00:00.000Z',
      timezone: 'UTC',
      childId: childA,
    });
    expect(result.metrics.eligible_session_count).toBe(0);
    expect(result.freshness.status).not.toBe('fresh');
  });

  it('excludes sessions after consent revocation', async () => {
    const sid = randomUUID();
    await ingestion.ingest(parentA, {
      sessions: [session(sid, { started_at: '2026-02-05T10:00:00.000Z' })],
      events: [],
    });
    await db.consentRecord.create({
      data: {
        parentId: parentA,
        childId: childA,
        purpose: 'essential_play_events',
        policyVersion: consentPolicy,
        status: 'withdrawn',
        source: 'server_consent_store',
        recordedAt: new Date('2026-02-05T11:00:00.000Z'),
        revokedAt: new Date('2026-02-05T11:00:00.000Z'),
      },
    });
    const result = await kpis.aggregate(parentA, {
      from: '2026-02-01T00:00:00.000Z',
      to: '2026-02-10T00:00:00.000Z',
      timezone: 'UTC',
      childId: childA,
    });
    expect(result.sample.excluded_consent).toBeGreaterThanOrEqual(1);
  });
});
