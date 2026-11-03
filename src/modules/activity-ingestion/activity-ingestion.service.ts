import { Injectable } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityBatchAdmissionService, eventFingerprint } from './activity-batch-admission.service';
import { evaluateConsentScopeAuthorization } from './activity-event.consent';
import { PARENT_ONLY_EVENT_TYPES, type ActivityEventV1, type ServerConsentRecord } from './activity-contract.types';

type Ack = { event_id: string; status: 'accepted' | 'duplicate_noop' | 'rejected' | 'retryable'; reason_code?: string };
const isParentEvent = (event: ActivityEventV1) =>
  (PARENT_ONLY_EVENT_TYPES as readonly string[]).includes(event.event_type);

/**
 * Authenticated-only ingestion. Never accepts parent/child IDs from the wire.
 * Each insert and global idempotency claim use the same transaction.
 */
@Injectable()
export class ActivityIngestionService {
  constructor(private readonly prisma: PrismaService, private readonly admission: ActivityBatchAdmissionService) {}

  async ingest(parentId: string, raw: unknown): Promise<{results: Ack[]}> {
    const { sessions, events } = this.admission.validate(raw);
    const db = this.prisma.db;
    const results: Ack[] = [];

    // Validate session ownership before any writes. Device may be assigned to a
    // single child; unassigned devices do not authorize inference of child IDs.
    const knownSessions = new Map<string, { childId: string; contentVersionId: string; deviceId: string }>();
    for (const session of sessions) {
      const device = await db.device.findFirst({ where: { id: session.device_id, parentId, revokedAt: null, childId: { not: null }, child: { deletedAt: null } }, select: { childId: true } });
      const variant = await db.activityVariant.findUnique({ where: { id: session.content_version_id }, select: { reviewStatus: true, activity: { select: { status: true } } } });
      if (!device?.childId || variant?.reviewStatus !== 'published' || variant.activity.status !== 'published') continue;
      const consent = await this.checkConsent(db, parentId, device.childId, session.consent.consent_scope, session.consent.policy_version);
      if (!consent) continue;
      try {
        await db.activitySession.create({
          data: { id: session.play_session_id, childId: device.childId, deviceId: session.device_id, contentVersionId: session.content_version_id, startedAt: new Date(session.started_at), endedAt: session.ended_at ? new Date(session.ended_at) : null, completionStatus: session.completion_status, monotonicDurationSeconds: session.monotonic_duration_seconds, schemaVersion: session.schema_version, consentScope: session.consent.consent_scope, consentPolicyVersion: session.consent.policy_version, provenanceJson: session.provenance as Prisma.InputJsonValue },
        });
      } catch (error) {
        // The only acceptable race is a pre-existing session with the same
        // immutable ownership and metadata. A unique-key collision must never
        // silently reassign an existing session.
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
          throw error;
        }
      }
      const persisted = await db.activitySession.findUnique({ where: { id: session.play_session_id }, select: { childId: true, deviceId: true, contentVersionId: true, startedAt: true, schemaVersion: true, endedAt: true, consentScope: true, consentPolicyVersion: true } });
      if (!persisted || persisted.childId !== device.childId || persisted.deviceId !== session.device_id || persisted.contentVersionId !== session.content_version_id || persisted.startedAt.getTime() !== new Date(session.started_at).getTime() || persisted.schemaVersion !== session.schema_version || (persisted.consentScope && persisted.consentScope !== session.consent.consent_scope) || (persisted.consentPolicyVersion && persisted.consentPolicyVersion !== session.consent.policy_version)) continue;
      // Complete a previously started session without permitting downgrade or
      // inconsistent replay of immutable session metadata.
      if (session.ended_at) {
        const end = new Date(session.ended_at);
        if (persisted.endedAt && persisted.endedAt.getTime() !== end.getTime()) continue;
        if (!persisted.endedAt) {
          await db.activitySession.updateMany({
            where: { id: session.play_session_id, childId: device.childId, deviceId: session.device_id, endedAt: null },
            data: { endedAt: end, completionStatus: session.completion_status, monotonicDurationSeconds: session.monotonic_duration_seconds },
          });
          const final = await db.activitySession.findUnique({ where: { id: session.play_session_id }, select: { endedAt: true } });
          if (!final?.endedAt || final.endedAt.getTime() !== end.getTime()) continue;
        }
      }
      knownSessions.set(session.play_session_id, { childId: device.childId, contentVersionId: session.content_version_id, deviceId: session.device_id });
    }

    for (const event of events) {
      results.push(await this.storeEvent(db, parentId, event, knownSessions));
    }
    return { results };
  }

  private async checkConsent(db: PrismaClient, parentId: string, childId: string | null, scope: ActivityEventV1['consent_scope'], policyVersion: string): Promise<boolean> {
    const rows = await db.consentRecord.findMany({ where: { parentId, OR: [{ childId: null }, ...(childId ? [{ childId }] : [])] }, orderBy: { recordedAt: 'desc' } });
    const scoped = rows.filter(row => row.purpose === scope);
    // A database row is not automatically an authoritative consent grant.
    // Never promote arbitrary client/source strings into trusted attestations.
    if (scoped.some(row => row.source !== 'server_consent_store' && row.source !== 'sync_scope_grant')) return false;
    const records: ServerConsentRecord[] = scoped.map(row => ({
      purpose: row.purpose,
      consent_scope: scope,
      policy_version: row.policyVersion,
      source: row.source as ServerConsentRecord['source'],
      status: row.status === 'granted' && !row.revokedAt ? 'granted' : 'withdrawn',
      effective_at: (row.revokedAt ?? row.recordedAt).toISOString(),
    }));
    const effective = evaluateConsentScopeAuthorization(scope, records);
    return effective.authorized && effective.effective?.policy_version === policyVersion;
  }

  private async storeEvent(db: PrismaClient, parentId: string, event: ActivityEventV1, sessions: Map<string, { childId: string; contentVersionId: string; deviceId: string }>): Promise<Ack> {
    const reject = (reason_code: string): Ack => ({ event_id: event.event_id, status: 'rejected', reason_code });
    const parentOnly = isParentEvent(event);
    const device = await db.device.findFirst({ where: { id: event.device_id, parentId, revokedAt: null }, select: { childId: true } });
    if (!device) return reject('ownership.invalid_device');
    const variant = await db.activityVariant.findUnique({ where: { id: event.content_version_id }, select: { reviewStatus: true, activity: { select: { status: true } } } });
    if (!variant) return reject('content.unknown_version');
    if (variant.reviewStatus !== 'published' || variant.activity.status !== 'published') return reject('content.not_published');
    let session: { childId: string; contentVersionId: string; deviceId: string } | undefined;
    if (!parentOnly) {
      if (!event.play_session_id || !device.childId) return reject('session.required');
      session = sessions.get(event.play_session_id);
      if (!session) {
        const persisted = await db.activitySession.findFirst({
          where: { id: event.play_session_id, child: { parentId, deletedAt: null } },
          select: { childId: true, deviceId: true, contentVersionId: true },
        });
        if (persisted?.deviceId) session = { childId: persisted.childId, deviceId: persisted.deviceId, contentVersionId: persisted.contentVersionId };
      }
      // An offline batch may arrive before its session metadata. Do not
      // permanently reject an otherwise valid event just for arrival order.
      if (!session) return { event_id: event.event_id, status: 'retryable', reason_code: 'session.pending' };
      if (session.childId !== device.childId || session.deviceId !== event.device_id || session.contentVersionId !== event.content_version_id) return reject('session.ownership_mismatch');
    }
    if (!await this.checkConsent(db, parentId, parentOnly ? null : session!.childId, event.consent_scope, event.consent_policy_version)) return reject('consent.not_authorized');
    const fingerprint = eventFingerprint(event);
    const eventClass = parentOnly ? 'parent' : 'child';
    try {
      return await db.$transaction(async tx => {
        // A unique global registry prevents same UUID across parent/child tables.
        const claim = await tx.activityIngestKey.findUnique({ where: { eventId: event.event_id } });
        if (claim) {
          return claim.parentId === parentId && claim.eventClass === eventClass && claim.payloadFingerprint === fingerprint
            ? { event_id: event.event_id, status: 'duplicate_noop' as const }
            : reject('idempotency.conflict');
        }
        await tx.activityIngestKey.create({ data: { eventId: event.event_id, parentId, payloadFingerprint: fingerprint, eventClass } });
        if (parentOnly) {
          await tx.parentActivityEvent.create({ data: { eventId: event.event_id, parentId, deviceId: event.device_id, contentVersionId: event.content_version_id, eventType: event.event_type, occurredAt: new Date(event.occurred_at), payloadJson: event.payload as Prisma.InputJsonValue, schemaVersion: event.schema_version, consentScope: event.consent_scope, consentPolicyVersion: event.consent_policy_version, provenanceJson: event.provenance as Prisma.InputJsonValue, payloadFingerprint: fingerprint } });
        } else {
          await tx.activityEvent.create({ data: { eventId: event.event_id, childId: session!.childId, playSessionId: event.play_session_id!, deviceId: event.device_id, contentVersionId: event.content_version_id, eventType: event.event_type, occurredAt: new Date(event.occurred_at), receivedAt: new Date(), monotonicDurationSeconds: event.monotonic_duration_seconds, payloadJson: event.payload as Prisma.InputJsonValue, schemaVersion: event.schema_version, consentScope: event.consent_scope, consentPolicyVersion: event.consent_policy_version, provenanceJson: event.provenance as Prisma.InputJsonValue } });
        }
        return { event_id: event.event_id, status: 'accepted' as const };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const claim = await db.activityIngestKey.findUnique({ where: { eventId: event.event_id } });
        if (claim?.parentId === parentId && claim.eventClass === eventClass && claim.payloadFingerprint === fingerprint) return { event_id: event.event_id, status: 'duplicate_noop' };
        return reject('idempotency.conflict');
      }
      return { event_id: event.event_id, status: 'retryable', reason_code: 'storage.temporarily_unavailable' };
    }
  }
}
