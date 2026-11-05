import type { ConfigService } from '@nestjs/config';
import { ActivityBatchAdmissionService } from './activity-batch-admission.service';
import { ActivityIngestionService } from './activity-ingestion.service';
import { StructuredLogger } from '../observability/structured-logger';
import { RecentErrorsStore } from '../observability/recent-errors.store';
import type { PrismaService } from '../prisma/prisma.service';

const PARENT_ID = '77777777-7777-4777-8777-777777777777';
const CHILD_ID = '66666666-6666-4666-8666-666666666666';
const SCOPED_DEVICE = '3d15ad77-4bd6-50b8-9422-3db5738c39f1';
const CONTENT_VERSION = '018f1340-0000-4000-8000-000000000001';
const PLAY_SESSION = '55555555-5555-4555-8555-555555555555';
const POLICY = 'synthetic-policy-v1';

function buildIngestion(db: Record<string, unknown>) {
  const config = {
    get: (key: string) => {
      if (key === 'APP_ENV') return 'development';
      if (key === 'RELEASE') return 'test';
      return undefined;
    },
  } as unknown as ConfigService<never, true>;
  const logger = new StructuredLogger(config, new RecentErrorsStore());
  const admission = new ActivityBatchAdmissionService(logger);
  return new ActivityIngestionService(
    { get db() { return db; } } as unknown as PrismaService,
    admission,
    logger,
  );
}

function sessionBody(policyVersion: string) {
  return {
    schema_version: '1.0.0',
    play_session_id: PLAY_SESSION,
    device_id: SCOPED_DEVICE,
    content_version_id: CONTENT_VERSION,
    started_at: '2026-11-04T12:00:00.000Z',
    completion_status: 'started',
    consent: {
      purpose: 'essential_play_events',
      consent_scope: 'essential_play_events',
      policy_version: policyVersion,
      decision: 'granted',
    },
    provenance: {
      emitter: 'kids_mode_client',
      capture_channel: 'offline_queue',
      clock_trust: 'wall_clock_only',
    },
  };
}

function childEvent(eventId: string) {
  return {
    schema_version: '1.0.0',
    play_session_id: PLAY_SESSION,
    device_id: SCOPED_DEVICE,
    content_version_id: CONTENT_VERSION,
    consent_scope: 'essential_play_events',
    consent_policy_version: POLICY,
    provenance: {
      emitter: 'kids_mode_client',
      actor_scope: 'child_play',
      source: 'instrumented',
      clock_trust: 'monotonic_within_boot',
    },
    event_id: eventId,
    event_type: 'activity_started',
    occurred_at: '2026-11-04T12:00:01.000Z',
    payload: { age_months: 36 },
  };
}

describe('ActivityIngestionService session consent skip → event ACK', () => {
  const publishedVariant = {
    reviewStatus: 'published',
    activity: { status: 'published' },
  };

  it('accepts session and event when server grant matches wire policy', async () => {
    const db = {
      device: {
        findFirst: jest.fn().mockResolvedValue({ childId: CHILD_ID }),
      },
      activityVariant: { findUnique: jest.fn().mockResolvedValue(publishedVariant) },
      consentRecord: {
        findMany: jest.fn().mockResolvedValue([
          {
            purpose: 'essential_play_events',
            policyVersion: POLICY,
            source: 'server_consent_store',
            status: 'granted',
            revokedAt: null,
            recordedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]),
      },
      activitySession: {
        create: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue({
          childId: CHILD_ID,
          deviceId: SCOPED_DEVICE,
          contentVersionId: CONTENT_VERSION,
          startedAt: new Date('2026-11-04T12:00:00.000Z'),
          schemaVersion: '1.0.0',
          endedAt: null,
          consentScope: 'essential_play_events',
          consentPolicyVersion: POLICY,
        }),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      activityIngestKey: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          activityIngestKey: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
          },
          activityEvent: { create: jest.fn() },
        }),
      ),
    };
    const ingestion = buildIngestion(db);
    const result = await ingestion.ingest(PARENT_ID, {
      sessions: [sessionBody(POLICY)],
      events: [childEvent('44444444-4444-4444-8444-444444444441')],
    });
    expect(result.results[0]).toMatchObject({ status: 'accepted' });
  });

  it('rejects child events with consent.not_authorized when session policy mismatches grant', async () => {
    const db = {
      device: {
        findFirst: jest.fn().mockResolvedValue({ childId: CHILD_ID }),
      },
      activityVariant: { findUnique: jest.fn().mockResolvedValue(publishedVariant) },
      consentRecord: {
        findMany: jest.fn().mockResolvedValue([
          {
            purpose: 'essential_play_events',
            policyVersion: POLICY,
            source: 'server_consent_store',
            status: 'granted',
            revokedAt: null,
            recordedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]),
      },
      activitySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
      },
      activityIngestKey: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const ingestion = buildIngestion(db);
    const result = await ingestion.ingest(PARENT_ID, {
      sessions: [sessionBody('privacy-notice-draft-0')],
      events: [childEvent('44444444-4444-4444-8444-444444444442')],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'consent.not_authorized',
    });
    expect(db.activitySession.create).not.toHaveBeenCalled();
  });

  it('rejects when latest-effective consent is withdrawn', async () => {
    const db = {
      device: {
        findFirst: jest.fn().mockResolvedValue({ childId: CHILD_ID }),
      },
      activityVariant: { findUnique: jest.fn().mockResolvedValue(publishedVariant) },
      consentRecord: {
        findMany: jest.fn().mockResolvedValue([
          {
            purpose: 'essential_play_events',
            policyVersion: POLICY,
            source: 'server_consent_store',
            status: 'withdrawn',
            revokedAt: new Date('2026-10-30T00:00:00.000Z'),
            recordedAt: new Date('2026-10-30T00:00:00.000Z'),
          },
        ]),
      },
      activitySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
      },
      activityIngestKey: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const ingestion = buildIngestion(db);
    const result = await ingestion.ingest(PARENT_ID, {
      sessions: [sessionBody(POLICY)],
      events: [childEvent('44444444-4444-4444-8444-444444444443')],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'consent.not_authorized',
    });
  });

  it('rejects when scoped consent rows include an untrusted source', async () => {
    const db = {
      device: {
        findFirst: jest.fn().mockResolvedValue({ childId: CHILD_ID }),
      },
      activityVariant: { findUnique: jest.fn().mockResolvedValue(publishedVariant) },
      consentRecord: {
        findMany: jest.fn().mockResolvedValue([
          {
            purpose: 'essential_play_events',
            policyVersion: POLICY,
            source: 'server_consent_store',
            status: 'granted',
            revokedAt: null,
            recordedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
          {
            purpose: 'essential_play_events',
            policyVersion: POLICY,
            source: 'client_decision',
            status: 'granted',
            revokedAt: null,
            recordedAt: new Date('2026-10-29T00:00:00.000Z'),
          },
        ]),
      },
      activitySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
      },
      activityIngestKey: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const ingestion = buildIngestion(db);
    const result = await ingestion.ingest(PARENT_ID, {
      sessions: [sessionBody(POLICY)],
      events: [childEvent('44444444-4444-4444-8444-444444444444')],
    });
    expect(result.results[0]).toMatchObject({
      status: 'rejected',
      reason_code: 'consent.not_authorized',
    });
  });

  it('keeps session.pending when session is absent but consent was not denied in-batch', async () => {
    const db = {
      device: {
        findFirst: jest.fn().mockResolvedValue({ childId: CHILD_ID }),
      },
      activityVariant: { findUnique: jest.fn().mockResolvedValue(publishedVariant) },
      consentRecord: { findMany: jest.fn() },
      activitySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
      },
      activityIngestKey: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const ingestion = buildIngestion(db);
    const result = await ingestion.ingest(PARENT_ID, {
      sessions: [],
      events: [childEvent('44444444-4444-4444-8444-444444444445')],
    });
    expect(result.results[0]).toMatchObject({
      status: 'retryable',
      reason_code: 'session.pending',
    });
  });
});
