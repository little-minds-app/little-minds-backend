import type { ConfigService } from '@nestjs/config';
import { ActivityBatchAdmissionService } from './activity-batch-admission.service';
import { ActivityIngestionService } from './activity-ingestion.service';
import { StructuredLogger } from '../observability/structured-logger';
import { RecentErrorsStore } from '../observability/recent-errors.store';
import type { PrismaService } from '../prisma/prisma.service';

describe('ActivityIngestionService batch summary logging', () => {
  it('logs sanitized ingest summary when sessions are skipped and events are retryable', async () => {
    const logSpy = jest.spyOn(StructuredLogger.prototype, 'log');
    const config = {
      get: (key: string) => {
        if (key === 'APP_ENV') return 'development';
        if (key === 'RELEASE') return 'test';
        return undefined;
      },
    } as unknown as ConfigService<never, true>;
    const logger = new StructuredLogger(config, new RecentErrorsStore());
    const admission = new ActivityBatchAdmissionService(logger);
    const db = {
      device: { findFirst: jest.fn().mockResolvedValue(null) },
      activityVariant: { findUnique: jest.fn() },
      activitySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      consentRecord: { findMany: jest.fn() },
      activityIngestKey: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const ingestion = new ActivityIngestionService(
      { get db() { return db; } } as unknown as PrismaService,
      admission,
      logger,
    );
    const body = {
      sessions: [
        {
          schema_version: '1.0.0',
          play_session_id: '55555555-5555-4555-8555-555555555555',
          device_id: '3d15ad77-4bd6-50b8-9422-3db5738c39f1',
          content_version_id: '018f1340-0000-4000-8000-000000000001',
          started_at: '2026-11-04T12:00:00.000Z',
          completion_status: 'started',
          consent: {
            purpose: 'essential_play_events',
            consent_scope: 'essential_play_events',
            policy_version: 'synthetic-policy-v1',
            decision: 'granted',
          },
          provenance: {
            emitter: 'kids_mode_client',
            capture_channel: 'offline_queue',
            clock_trust: 'wall_clock_only',
          },
        },
      ],
      events: [
        {
          schema_version: '1.0.0',
          play_session_id: '55555555-5555-4555-8555-555555555555',
          device_id: '3d15ad77-4bd6-50b8-9422-3db5738c39f1',
          content_version_id: '018f1340-0000-4000-8000-000000000001',
          consent_scope: 'essential_play_events',
          consent_policy_version: 'synthetic-policy-v1',
          provenance: {
            emitter: 'kids_mode_client',
            actor_scope: 'child_play',
            source: 'instrumented',
            clock_trust: 'monotonic_within_boot',
          },
          event_id: '44444444-4444-4444-8444-444444444441',
          event_type: 'activity_started',
          occurred_at: '2026-11-04T12:00:01.000Z',
          payload: { age_months: 36 },
        },
      ],
    };

    db.device.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ childId: '66666666-6666-4666-8666-666666666666' });
    db.activityVariant.findUnique.mockResolvedValue({
      reviewStatus: 'published',
      activity: { status: 'published' },
    });
    db.activitySession.findFirst.mockResolvedValue(null);

    const result = await ingestion.ingest('77777777-7777-4777-8777-777777777777', body);
    expect(result.results[0]).toMatchObject({
      status: 'retryable',
      reason_code: 'session.pending',
    });

    const summaryCall = logSpy.mock.calls.find(
      (call) => call[0]?.message === 'activity_ingest_batch_summary',
    );
    expect(summaryCall?.[0]?.context).toMatchObject({
      ingest_sessions_wire: 1,
      ingest_sessions_admitted: 0,
      ingest_session_skip_counts: { 'device.not_authorized': 1 },
      ingest_retryable_reason_counts: { 'session.pending': 1 },
    });
    logSpy.mockRestore();
  });
});
