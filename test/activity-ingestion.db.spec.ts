/** LMP-51: real PostgreSQL ingestion, replay, isolation and consent tests. */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { ActivityBatchAdmissionService } from '../src/modules/activity-ingestion/activity-batch-admission.service';
import { noopStructuredLogger } from './helpers/noop-structured-logger';
import { ActivityIngestionService } from '../src/modules/activity-ingestion/activity-ingestion.service';
import type { PrismaService } from '../src/modules/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
const fixture = (name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(resolve(process.cwd(), 'contracts', 'fixtures', 'activity', name), 'utf8')) as Record<string, unknown>;

describeDb('LMP-51 authenticated activity ingestion / real PostgreSQL', () => {
  const db = new PrismaClient();
  const parentId = randomUUID();
  const childId = randomUUID();
  const deviceId = randomUUID();
  const domainId = randomUUID();
  const goalId = randomUUID();
  const mechanicId = randomUUID();
  const definitionId = randomUUID();
  const variantId = randomUUID();
  const consentPolicy = 'privacy-notice-draft-0';
  const ingestion = new ActivityIngestionService({ get db() { return db; } } as PrismaService, new ActivityBatchAdmissionService(noopStructuredLogger()), noopStructuredLogger());

  const session = (id: string): Record<string, unknown> => ({
    ...fixture('valid-activity-session.json'),
    play_session_id: id, device_id: deviceId, content_version_id: variantId,
  });
  const event = (id: string, sessionId: string): Record<string, unknown> => ({
    ...fixture('valid-activity-completed.json'),
    event_id: id, play_session_id: sessionId, device_id: deviceId, content_version_id: variantId,
  });
  const parentEvent = (id: string): Record<string, unknown> => ({
    ...fixture('valid-mission-feedback-parent.json'),
    event_id: id, device_id: deviceId, content_version_id: variantId,
  });

  beforeAll(async () => {
    await db.$connect();
    await db.parentAccount.create({ data: { id: parentId, lifecycle: 'active' } });
    await db.childProfile.create({ data: { id: childId, parentId, ageMonthsAtReference: 32, ageReferenceDate: new Date('2026-01-15T00:00:00Z') } });
    await db.device.create({ data: { id: deviceId, parentId, childId, platform: 'ios' } });
    await db.learningDomain.create({ data: { id: domainId, code: 'lmp51-test-' + domainId, labelKey: 'test' } });
    await db.learningGoal.create({ data: { id: goalId, domainId, objectiveKey: 'test' } });
    await db.gameMechanic.create({ data: { id: mechanicId, code: 'lmp51-test-' + mechanicId, engineVersion: '1.0.0' } });
    await db.activityDefinition.create({ data: { id: definitionId, mechanicId, learningGoalId: goalId, minAgeMonths: 24, maxAgeMonths: 71, safetyClass: 'low', status: 'published' } });
    await db.activityVariant.create({ data: { id: variantId, activityId: definitionId, version: 1, reviewStatus: 'published' } });
    await db.consentRecord.create({ data: { parentId, childId, purpose: 'essential_play_events', policyVersion: consentPolicy, status: 'granted', source: 'server_consent_store', recordedAt: new Date('2026-01-01T00:00:00Z') } });
    await db.consentRecord.create({ data: { parentId, purpose: 'essential_play_events', policyVersion: consentPolicy, status: 'granted', source: 'server_consent_store', recordedAt: new Date('2026-01-01T00:00:00Z') } });
  });
  afterAll(async () => {
    await db.activityIngestKey.deleteMany({ where: { parentId } });
    await db.parentActivityEvent.deleteMany({ where: { parentId } });
    await db.activityEvent.deleteMany({ where: { childId } });
    await db.activitySession.deleteMany({ where: { childId } });
    await db.consentRecord.deleteMany({ where: { parentId } });
    await db.device.deleteMany({ where: { parentId } });
    await db.childProfile.deleteMany({ where: { parentId } });
    await db.parentAccount.deleteMany({ where: { id: parentId } });
    await db.activityVariant.deleteMany({ where: { id: variantId } });
    await db.activityDefinition.deleteMany({ where: { id: definitionId } });
    await db.gameMechanic.deleteMany({ where: { id: mechanicId } });
    await db.learningGoal.deleteMany({ where: { id: goalId } });
    await db.learningDomain.deleteMany({ where: { id: domainId } });
    await db.$disconnect();
  });

  it('atomically accepts then deduplicates concurrent identical replays', async () => {
    const sid = randomUUID(), eid = randomUUID();
    const request = { sessions: [session(sid)], events: [event(eid, sid)] };
    const results = await Promise.all(Array.from({ length: 4 }, () => ingestion.ingest(parentId, request)));
    const statuses = results.map(result => result.results[0].status);
    expect(statuses.filter(status => status === 'accepted')).toHaveLength(1);
    expect(statuses.filter(status => status === 'duplicate_noop')).toHaveLength(3);
    expect(await db.activityIngestKey.count({ where: { eventId: eid } })).toBe(1);
    expect(await db.activityEvent.count({ where: { eventId: eid } })).toBe(1);
    expect(await db.activityEvent.findUnique({ where: { eventId: eid } })).toMatchObject({ consentPolicyVersion: consentPolicy, provenanceJson: expect.objectContaining({ actor_scope: 'child_play' }) });
    const changed = event(eid, sid);
    changed.payload = { ...(changed.payload as Record<string, unknown>), hints_used: 2 };
    const conflict = await ingestion.ingest(parentId, { sessions: [], events: [changed] });
    expect(conflict.results[0]).toMatchObject({ status: 'rejected', reason_code: 'idempotency.conflict' });
    const crossClass = await ingestion.ingest(parentId, { sessions: [], events: [parentEvent(eid)] });
    expect(crossClass.results[0]).toMatchObject({ status: 'rejected', reason_code: 'idempotency.conflict' });
  });

  it('allows out-of-order event arrival via retryable session dependency', async () => {
    const sid = randomUUID(), eid = randomUUID();
    const before = await ingestion.ingest(parentId, { sessions: [], events: [event(eid, sid)] });
    expect(before.results[0]).toMatchObject({ status: 'retryable', reason_code: 'session.pending' });
    expect(await db.activityEvent.count({ where: { eventId: eid } })).toBe(0);
    const after = await ingestion.ingest(parentId, { sessions: [session(sid)], events: [event(eid, sid)] });
    expect(after.results[0].status).toBe('accepted');
  });

  it('upgrades a running session to completion without changing ownership', async () => {
    const sid = randomUUID();
    const active = session(sid);
    delete active.ended_at;
    delete active.monotonic_duration_seconds;
    active.completion_status = 'started';
    await ingestion.ingest(parentId, { sessions: [active], events: [] });
    const initial = await db.activitySession.findUnique({ where: { id: sid } });
    expect(initial?.endedAt).toBeNull();
    await ingestion.ingest(parentId, { sessions: [session(sid)], events: [] });
    const final = await db.activitySession.findUnique({ where: { id: sid } });
    expect(final).toMatchObject({ completionStatus: 'completed', consentPolicyVersion: consentPolicy });
    expect(final?.endedAt).not.toBeNull();
  });

  it('saves parent-only events without a fabricated play session', async () => {
    const id = randomUUID();
    const result = await ingestion.ingest(parentId, { sessions: [], events: [parentEvent(id)] });
    expect(result.results[0].status).toBe('accepted');
    expect(await db.parentActivityEvent.count({ where: { eventId: id } })).toBe(1);
    expect(await db.parentActivityEvent.findUnique({ where: { eventId: id } })).toMatchObject({ consentPolicyVersion: consentPolicy, provenanceJson: expect.objectContaining({ actor_scope: 'parent' }) });
    expect(await db.activitySession.count({ where: { id } })).toBe(0);
  });

  it('rejects draft variants and draft definitions without persisting events', async () => {
    const sid = randomUUID(), eid = randomUUID();
    await db.activityVariant.update({ where: { id: variantId }, data: { reviewStatus: 'draft' } });
    try {
      const draftVariant = await ingestion.ingest(parentId, { sessions: [session(sid)], events: [event(eid, sid)] });
      expect(draftVariant.results[0]).toMatchObject({ status: 'rejected', reason_code: 'content.not_published' });
      expect(await db.activityEvent.count({ where: { eventId: eid } })).toBe(0);
    } finally {
      await db.activityVariant.update({ where: { id: variantId }, data: { reviewStatus: 'published' } });
    }
    await db.activityDefinition.update({ where: { id: definitionId }, data: { status: 'draft' } });
    try {
      const draftDefinition = await ingestion.ingest(parentId, { sessions: [session(randomUUID())], events: [parentEvent(randomUUID())] });
      expect(draftDefinition.results[0]).toMatchObject({ status: 'rejected', reason_code: 'content.not_published' });
    } finally {
      await db.activityDefinition.update({ where: { id: definitionId }, data: { status: 'published' } });
    }
  });

  it('fails closed on untrusted consent attestation source', async () => {
    const rogue = await db.consentRecord.create({ data: { parentId, purpose: 'essential_play_events', policyVersion: consentPolicy, status: 'granted', source: 'client_decision', recordedAt: new Date('2026-10-29T00:00:00Z') } });
    try {
      const denied = await ingestion.ingest(parentId, { sessions: [], events: [parentEvent(randomUUID())] });
      expect(denied.results[0]).toMatchObject({ status: 'rejected', reason_code: 'consent.not_authorized' });
    } finally {
      await db.consentRecord.delete({ where: { id: rogue.id } });
    }
  });

  it('refuses another parent and rejects events after consent withdrawal', async () => {
    const cross = await ingestion.ingest(randomUUID(), { sessions: [], events: [parentEvent(randomUUID())] });
    expect(cross.results[0]).toMatchObject({ status: 'rejected', reason_code: 'ownership.invalid_device' });
    await db.consentRecord.create({ data: { parentId, purpose: 'essential_play_events', policyVersion: 'newer-policy', status: 'withdrawn', source: 'server_consent_store', recordedAt: new Date('2026-10-30T00:00:00Z') } });
    const withdrawn = await ingestion.ingest(parentId, { sessions: [], events: [parentEvent(randomUUID())] });
    expect(withdrawn.results[0]).toMatchObject({ status: 'rejected', reason_code: 'consent.not_authorized' });
  });
});
