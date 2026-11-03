import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionKpiService } from './session-kpi.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('SessionKpiService', () => {
  const db = {
    childProfile: { findFirst: jest.fn() },
    consentRecord: { findMany: jest.fn().mockResolvedValue([]) },
    activitySession: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn() },
    activityEvent: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn() },
  };
  const parentConsentRow = {
    parentId: 'parent',
    childId: null,
    purpose: 'essential_play_events',
    policyVersion: 'p1',
    status: 'granted',
    revokedAt: null,
    source: 'server_consent_store',
    recordedAt: new Date('2025-12-01T00:00:00.000Z'),
  };
  const service = new SessionKpiService(
    { get db() { return db; } } as unknown as PrismaService,
    { get: () => undefined } as unknown as ConfigService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('rejects invalid windows', async () => {
    await expect(
      service.aggregate('parent', {
        from: '2026-01-02T00:00:00.000Z',
        to: '2026-01-01T00:00:00.000Z',
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns 404 for unknown child scope', async () => {
    db.childProfile.findFirst.mockResolvedValue(null);
    await expect(
      service.aggregate('parent', {
        childId: '00000000-0000-4000-8000-000000000001',
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('aggregates eligible sessions without double counting', async () => {
    db.childProfile.findFirst.mockResolvedValue({ id: 'child' });
    db.activitySession.findMany.mockResolvedValue([
      {
        id: 's1',
        childId: 'child',
        contentVersionId: 'v1',
        startedAt: new Date('2026-01-01T12:00:00.000Z'),
        endedAt: new Date('2026-01-01T12:05:00.000Z'),
        monotonicDurationSeconds: 300,
        completionStatus: 'completed',
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
      },
      {
        id: 's2',
        childId: 'child',
        contentVersionId: 'v1',
        startedAt: new Date('2026-01-01T13:00:00.000Z'),
        endedAt: null,
        monotonicDurationSeconds: null,
        completionStatus: 'started',
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
      },
    ]);
    db.consentRecord.findMany.mockResolvedValue([parentConsentRow]);
    db.activityEvent.findFirst.mockResolvedValue(null);
    db.activitySession.findFirst.mockResolvedValue({ startedAt: new Date('2026-01-01T13:00:00.000Z') });

    const result = await service.aggregate(
      'parent',
      {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'UTC',
      },
      new Date('2026-01-02T00:00:00.000Z'),
    );

    expect(result.metrics.eligible_session_count).toBe(2);
    expect(result.metrics.total_play_duration_seconds).toBe(300);
    expect(result.metrics.completed_session_rate).toMatchObject({
      availability_status: 'available',
      numerator: 1,
      denominator: 1,
    });
    expect(result.freshness.data_completeness).toBe('partial');
    expect(result.metrics.in_progress_session_count).toBe(1);
    expect(result.metrics.interrupted_session_count).toBe(0);
  });

  it('classifies ended_at without terminal status as interrupted terminal', async () => {
    db.activitySession.findMany.mockResolvedValue([
      {
        id: 's-closed',
        childId: 'child',
        contentVersionId: 'v1',
        startedAt: new Date('2026-01-01T12:00:00.000Z'),
        endedAt: new Date('2026-01-01T12:01:00.000Z'),
        monotonicDurationSeconds: 60,
        completionStatus: 'started',
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
      },
    ]);
    db.consentRecord.findMany.mockResolvedValue([parentConsentRow]);
    db.activityEvent.findMany.mockResolvedValue([]);
    db.activityEvent.findFirst.mockResolvedValue(null);
    db.activitySession.findFirst.mockResolvedValue(null);

    const result = await service.aggregate(
      'parent',
      {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'UTC',
      },
      new Date('2026-01-02T00:00:00.000Z'),
    );

    expect(result.metrics.in_progress_session_count).toBe(0);
    expect(result.metrics.interrupted_session_count).toBe(1);
    expect(result.sample.terminal_sessions).toBe(1);
  });

  it('ignores invalid accuracy payload counters', async () => {
    db.activitySession.findMany.mockResolvedValue([
      {
        id: 's1',
        childId: 'child',
        contentVersionId: 'v1',
        startedAt: new Date('2026-01-01T12:00:00.000Z'),
        endedAt: new Date('2026-01-01T12:05:00.000Z'),
        monotonicDurationSeconds: 300,
        completionStatus: 'completed',
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
      },
    ]);
    db.consentRecord.findMany.mockResolvedValue([parentConsentRow]);
    db.activityEvent.findMany.mockResolvedValue([
      {
        eventId: 'e1',
        playSessionId: 's1',
        childId: 'child',
        occurredAt: new Date('2026-01-01T12:05:00.000Z'),
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
        payloadJson: { eligible_first_attempts: 4, correct_first_attempts: 10 },
      },
    ]);
    db.activityEvent.findFirst.mockResolvedValue(null);
    db.activitySession.findFirst.mockResolvedValue({ startedAt: new Date('2026-01-01T12:00:00.000Z') });

    const result = await service.aggregate(
      'parent',
      {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'UTC',
      },
      new Date('2026-01-02T00:00:00.000Z'),
    );

    expect(result.metrics.first_attempt_accuracy).toMatchObject({
      availability_status: 'unavailable',
      reason_code: 'insufficient_denominator',
    });
  });

  it('does not resurrect older eligible accuracy when latest event is ineligible', async () => {
    db.activitySession.findMany.mockResolvedValue([
      {
        id: 's1',
        childId: 'child',
        contentVersionId: 'v1',
        startedAt: new Date('2026-01-01T12:00:00.000Z'),
        endedAt: new Date('2026-01-01T12:05:00.000Z'),
        monotonicDurationSeconds: 300,
        completionStatus: 'completed',
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
      },
    ]);
    db.consentRecord.findMany.mockResolvedValue([parentConsentRow]);
    db.activityEvent.findMany.mockResolvedValue([
      {
        eventId: 'e-new',
        playSessionId: 's1',
        childId: 'child',
        occurredAt: new Date('2026-01-01T12:05:00.000Z'),
        schemaVersion: '2.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
        payloadJson: { eligible_first_attempts: 1, correct_first_attempts: 1 },
      },
      {
        eventId: 'e-old',
        playSessionId: 's1',
        childId: 'child',
        occurredAt: new Date('2026-01-01T12:04:00.000Z'),
        schemaVersion: '1.0.0',
        consentScope: 'essential_play_events',
        consentPolicyVersion: 'p1',
        payloadJson: { eligible_first_attempts: 10, correct_first_attempts: 9 },
      },
    ]);
    db.activityEvent.findFirst.mockResolvedValue(null);
    db.activitySession.findFirst.mockResolvedValue(null);

    const result = await service.aggregate(
      'parent',
      {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'UTC',
      },
      new Date('2026-01-02T00:00:00.000Z'),
    );

    expect(result.metrics.first_attempt_accuracy).toMatchObject({
      availability_status: 'unavailable',
      reason_code: 'insufficient_denominator',
    });
  });

  it('does not mark an empty window fresh when window-scoped ingest is absent', async () => {
    db.activitySession.findMany.mockResolvedValue([]);
    db.consentRecord.findMany.mockResolvedValue([parentConsentRow]);
    db.activityEvent.findMany.mockResolvedValue([]);
    db.activityEvent.findFirst.mockResolvedValue(null);
    db.activitySession.findFirst.mockResolvedValue(null);

    const result = await service.aggregate(
      'parent',
      {
        from: '2026-02-01T00:00:00.000Z',
        to: '2026-02-02T00:00:00.000Z',
        timezone: 'UTC',
      },
      new Date('2026-02-02T00:00:00.000Z'),
    );

    expect(result.metrics.eligible_session_count).toBe(0);
    expect(result.freshness.status).toBe('no_data');
  });
});
