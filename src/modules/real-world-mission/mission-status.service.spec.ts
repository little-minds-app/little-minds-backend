import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { MISSION_STATUS_SCHEMA_VERSION } from './mission-status.constants';
import { missionFeedbackPayloadFingerprint } from './mission-status.payload';
import { NEAR_FAR_CANONICAL_IDS } from '../mentor/near-far.ids';
import { MissionStatusService } from './mission-status.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('MissionStatusService (LMP-130 unit)', () => {
  const parentId = '00000000-0000-4000-8000-000000000001';
  const childId = '00000000-0000-4000-8000-000000000002';
  const occurrenceId = '00000000-0000-4000-8000-000000000010';
  const idempotencyKey = '00000000-0000-4000-8000-000000000011';
  const missionId = NEAR_FAR_CANONICAL_IDS.missionId;

  const childProfile = { findFirst: jest.fn() };
  const consentRecord = { findMany: jest.fn() };
  const parentMissionStatusReport = {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  };
  const parentMissionStatusIdempotencyKey = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const activityEvent = { findMany: jest.fn() };
  const db: {
    childProfile: typeof childProfile;
    consentRecord: typeof consentRecord;
    parentMissionStatusReport: typeof parentMissionStatusReport;
    parentMissionStatusIdempotencyKey: typeof parentMissionStatusIdempotencyKey;
    activityEvent: typeof activityEvent;
    $transaction: jest.Mock;
  } = {
    childProfile,
    consentRecord,
    parentMissionStatusReport,
    parentMissionStatusIdempotencyKey,
    activityEvent,
    $transaction: jest.fn(),
  };
  db.$transaction.mockImplementation(async (fn: (client: typeof db) => Promise<unknown>) => fn(db));

  const service = new MissionStatusService({ get db() { return db; } } as unknown as PrismaService);

  beforeEach(() => {
    jest.resetAllMocks();
    db.$transaction.mockImplementation(async (fn: (client: typeof db) => Promise<unknown>) => fn(db));
    childProfile.findFirst.mockResolvedValue({ id: childId });
    consentRecord.findMany.mockResolvedValue([
      {
        parentId,
        childId: null,
        purpose: 'essential_play_events',
        policyVersion: 'privacy-notice-draft-0',
        status: 'granted',
        source: 'server_consent_store',
        recordedAt: new Date('2026-01-01T00:00:00Z'),
        revokedAt: null,
      },
      {
        parentId,
        childId,
        purpose: 'essential_play_events',
        policyVersion: 'privacy-notice-draft-0',
        status: 'granted',
        source: 'server_consent_store',
        recordedAt: new Date('2026-01-01T00:00:00Z'),
        revokedAt: null,
      },
    ]);
  });

  it('rejects unknown mission ids', async () => {
    await expect(
      service.submitFeedback(parentId, childId, 'unknown_mission', {
        schema_version: MISSION_STATUS_SCHEMA_VERSION,
        idempotency_key: idempotencyKey,
        occurrence_id: occurrenceId,
        status: 'completed',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns duplicate_noop from ledger without mutating state', async () => {
    const fingerprint = missionFeedbackPayloadFingerprint({
      child_id: childId,
      mission_id: missionId,
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    parentMissionStatusIdempotencyKey.findUnique.mockResolvedValueOnce({
      assertionId: '00000000-0000-4000-8000-000000000099',
      childId,
      missionId,
      occurrenceId,
      reportStatus: 'completed',
      revisionAtAccept: 1,
      recordedAtAtAccept: new Date('2026-10-28T06:05:00.000Z'),
      payloadFingerprint: fingerprint,
    });
    const result = await service.submitFeedback(parentId, childId, missionId, {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      idempotency_key: idempotencyKey,
      occurrence_id: occurrenceId,
      status: 'completed',
    });
    expect(result.status).toBe('duplicate_noop');
    expect(result.report_status).toBe('completed');
    expect(parentMissionStatusReport.updateMany).not.toHaveBeenCalled();
  });

  it('conflicts when idempotency key is reused with different payload', async () => {
    parentMissionStatusIdempotencyKey.findUnique.mockResolvedValueOnce({
      payloadFingerprint: 'deadbeef',
    });
    await expect(
      service.submitFeedback(parentId, childId, missionId, {
        schema_version: MISSION_STATUS_SCHEMA_VERSION,
        idempotency_key: idempotencyKey,
        occurrence_id: occurrenceId,
        status: 'completed',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects malformed limit query values', async () => {
    await expect(
      service.listForChild(parentId, childId, {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-02-01T00:00:00.000Z',
        limit: '10junk',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns 409 when revision guard rejects stale correction', async () => {
    parentMissionStatusIdempotencyKey.findUnique.mockResolvedValueOnce(null);
    parentMissionStatusReport.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-4000-8000-000000000099',
      parentId,
      childId,
      missionId,
      occurrenceId,
      reportStatus: 'not_now',
      revision: 1,
      recordedAt: new Date(),
    });
    parentMissionStatusReport.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      service.submitFeedback(parentId, childId, missionId, {
        schema_version: MISSION_STATUS_SCHEMA_VERSION,
        idempotency_key: '00000000-0000-4000-8000-000000000012',
        occurrence_id: occurrenceId,
        status: 'completed',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires bounded from/to window for list reads', async () => {
    await expect(service.listForChild(parentId, childId, {})).rejects.toBeInstanceOf(BadRequestException);
    parentMissionStatusReport.findMany.mockResolvedValue([]);
    activityEvent.findMany.mockResolvedValue([]);
    const result = await service.listForChild(parentId, childId, {
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-02-01T00:00:00.000Z',
    });
    expect(result.items).toEqual([]);
    expect(result.schema_version).toBe(MISSION_STATUS_SCHEMA_VERSION);
  });
});
