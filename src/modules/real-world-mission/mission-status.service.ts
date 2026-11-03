import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  consentRecordsFromRows,
  isSessionConsentEligibleAtRead,
} from '../session-kpi/session-kpi.consent';
import {
  AUTHORITATIVE_PARENT_REPORT_STATUSES,
  DEFAULT_MISSION_READ_LIMIT,
  MAX_MISSION_READ_LIMIT,
  MISSION_INTERACTION_EVENT_TYPES,
  MISSION_REPORT_STATUSES,
  MISSION_STATUS_CONSENT_POLICY,
  MISSION_STATUS_CONSENT_SCOPE,
  MISSION_STATUS_DEFINITION_VERSION,
  MISSION_STATUS_SCHEMA_VERSION,
  type MissionReportStatus,
} from './mission-status.constants';
import { isSupportedMissionId } from './mission-status.registry';
import { canTransitionMissionReport } from './mission-status.transitions';
import { parseInstant } from '../session-kpi/session-kpi-time';

export type SubmitMissionFeedbackInput = {
  schema_version?: unknown;
  idempotency_key?: unknown;
  occurrence_id?: unknown;
  status?: unknown;
};

export type ListMissionStatusQuery = {
  from?: string;
  to?: string;
  limit?: string;
};

type InteractionFacts = {
  offered_at: string | null;
  opened_at: string | null;
  source: 'child_play_events';
};

type ParentReportFacts = {
  availability: 'reported' | 'no_report';
  status: MissionReportStatus | null;
  authoritative: boolean;
  recorded_at: string | null;
  assertion_id: string | null;
  revision: number | null;
  actor: 'parent';
  source: 'caregiver_report';
};

export type MissionOccurrenceRow = {
  occurrence_id: string;
  mission_id: string;
  interaction: InteractionFacts;
  parent_report: ParentReportFacts;
};

export type MissionStatusListResponse = {
  schema_version: typeof MISSION_STATUS_SCHEMA_VERSION;
  definition_version: typeof MISSION_STATUS_DEFINITION_VERSION;
  generated_at: string;
  child_id: string;
  window: { from: string | null; to: string | null; bounds: 'half_open_recorded_at' };
  items: MissionOccurrenceRow[];
  pagination: { limit: number; truncated: boolean };
};

export type MissionFeedbackWriteResponse = {
  schema_version: typeof MISSION_STATUS_SCHEMA_VERSION;
  status: 'accepted' | 'duplicate_noop';
  assertion_id: string;
  child_id: string;
  mission_id: string;
  occurrence_id: string;
  report_status: MissionReportStatus;
  authoritative: boolean;
  recorded_at: string;
  revision: number;
  actor: 'parent';
  source: 'caregiver_report';
};

@Injectable()
export class MissionStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async listForChild(
    parentId: string,
    childId: string,
    query: ListMissionStatusQuery,
  ): Promise<MissionStatusListResponse> {
    await this.requireOwnedChild(parentId, childId);
    const limit = this.parseLimit(query.limit);
    const from = query.from ? parseInstant(query.from) : null;
    const to = query.to ? parseInstant(query.to) : null;
    if (from && to && from.getTime() >= to.getTime()) {
      throw new BadRequestException('Invalid time window');
    }

    const consent = await this.loadConsent(parentId, childId);
    const reports = await this.prisma.db.parentMissionStatusReport.findMany({
      where: {
        parentId,
        childId,
        ...(from || to
          ? {
              recordedAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lt: to } : {}),
              },
            }
          : {}),
      },
      orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const eligibleReports = reports.filter((row) =>
      isSessionConsentEligibleAtRead(
        row.consentScope,
        row.consentPolicyVersion,
        consent.parent,
        consent.child,
      ),
    );
    const truncatedReports = eligibleReports.length > limit;
    const reportSlice = eligibleReports.slice(0, limit);

    const interactionEvents = await this.prisma.db.activityEvent.findMany({
      where: {
        childId,
        eventType: { in: [...MISSION_INTERACTION_EVENT_TYPES] },
        ...(from || to
          ? {
              occurredAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lt: to } : {}),
              },
            }
          : {}),
      },
      orderBy: [{ occurredAt: 'asc' }, { eventId: 'asc' }],
      select: {
        eventType: true,
        occurredAt: true,
        playSessionId: true,
        payloadJson: true,
        consentScope: true,
        consentPolicyVersion: true,
      },
    });

    const byOccurrence = new Map<string, MissionOccurrenceRow>();

    for (const event of interactionEvents) {
      if (
        !isSessionConsentEligibleAtRead(
          event.consentScope,
          event.consentPolicyVersion,
          consent.parent,
          consent.child,
        )
      ) {
        continue;
      }
      const payload = event.payloadJson as Record<string, unknown>;
      const missionId = typeof payload.mission_id === 'string' ? payload.mission_id : null;
      if (!missionId || !isSupportedMissionId(missionId)) {
        continue;
      }
      const occurrenceId = event.playSessionId;
      const key = `${missionId}:${occurrenceId}`;
      const existing =
        byOccurrence.get(key) ??
        ({
          occurrence_id: occurrenceId,
          mission_id: missionId,
          interaction: {
            offered_at: null,
            opened_at: null,
            source: 'child_play_events',
          },
          parent_report: this.emptyParentReport(),
        } satisfies MissionOccurrenceRow);
      if (event.eventType === 'real_world_mission_offered') {
        existing.interaction.offered_at = event.occurredAt.toISOString();
      }
      if (event.eventType === 'real_world_mission_opened') {
        existing.interaction.opened_at = event.occurredAt.toISOString();
      }
      byOccurrence.set(key, existing);
    }

    for (const row of reportSlice) {
      if (!isSupportedMissionId(row.missionId)) {
        continue;
      }
      const key = `${row.missionId}:${row.occurrenceId}`;
      const existing =
        byOccurrence.get(key) ??
        ({
          occurrence_id: row.occurrenceId,
          mission_id: row.missionId,
          interaction: {
            offered_at: null,
            opened_at: null,
            source: 'child_play_events',
          },
          parent_report: this.emptyParentReport(),
        } satisfies MissionOccurrenceRow);
      existing.parent_report = this.parentReportFromRow(row);
      byOccurrence.set(key, existing);
    }

    const items = [...byOccurrence.values()].sort((a, b) => {
      const aTime = a.parent_report.recorded_at ?? a.interaction.opened_at ?? a.interaction.offered_at ?? '';
      const bTime = b.parent_report.recorded_at ?? b.interaction.opened_at ?? b.interaction.offered_at ?? '';
      return bTime.localeCompare(aTime);
    });

    return {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      definition_version: MISSION_STATUS_DEFINITION_VERSION,
      generated_at: new Date().toISOString(),
      child_id: childId,
      window: {
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
        bounds: 'half_open_recorded_at',
      },
      items: items.slice(0, limit),
      pagination: {
        limit,
        truncated: truncatedReports || items.length > limit,
      },
    };
  }

  async submitFeedback(
    parentId: string,
    childId: string,
    missionId: string,
    raw: SubmitMissionFeedbackInput,
  ): Promise<MissionFeedbackWriteResponse> {
    if (!isSupportedMissionId(missionId)) {
      throw new NotFoundException('Mission not found');
    }
    await this.requireOwnedChild(parentId, childId);
    const body = this.parseFeedbackBody(raw);
    await this.requireWriteConsent(parentId, childId);

    try {
      return await this.prisma.db.$transaction(async (tx) => {
        const existingByKey = await tx.parentMissionStatusReport.findUnique({
          where: {
            parentId_idempotencyKey: {
              parentId,
              idempotencyKey: body.idempotency_key,
            },
          },
        });
        if (existingByKey) {
          if (
            existingByKey.childId !== childId ||
            existingByKey.missionId !== missionId ||
            existingByKey.occurrenceId !== body.occurrence_id ||
            existingByKey.reportStatus !== body.status
          ) {
            throw new ConflictException('Idempotency key reused with different payload');
          }
          return this.writeResponse(existingByKey, 'duplicate_noop');
        }

        const existingOccurrence = await tx.parentMissionStatusReport.findUnique({
          where: {
            parentId_childId_missionId_occurrenceId: {
              parentId,
              childId,
              missionId,
              occurrenceId: body.occurrence_id,
            },
          },
        });
        if (existingOccurrence) {
          const fromStatus = existingOccurrence.reportStatus as MissionReportStatus;
          if (!canTransitionMissionReport(fromStatus, body.status)) {
            throw new ConflictException('Invalid mission status transition');
          }
          if (fromStatus === body.status) {
            return this.writeResponse(existingOccurrence, 'duplicate_noop');
          }
          const updated = await tx.parentMissionStatusReport.update({
            where: { id: existingOccurrence.id },
            data: {
              reportStatus: body.status,
              idempotencyKey: body.idempotency_key,
              revision: existingOccurrence.revision + 1,
              recordedAt: new Date(),
            },
          });
          return this.writeResponse(updated, 'accepted');
        }

        const created = await tx.parentMissionStatusReport.create({
          data: {
            parentId,
            childId,
            missionId,
            occurrenceId: body.occurrence_id,
            reportStatus: body.status,
            idempotencyKey: body.idempotency_key,
            schemaVersion: MISSION_STATUS_SCHEMA_VERSION,
            consentScope: MISSION_STATUS_CONSENT_SCOPE,
            consentPolicyVersion: MISSION_STATUS_CONSENT_POLICY,
          },
        });
        return this.writeResponse(created, 'accepted');
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Concurrent mission status write conflict');
      }
      throw error;
    }
  }

  private writeResponse(
    row: {
      id: string;
      childId: string;
      missionId: string;
      occurrenceId: string;
      reportStatus: string;
      recordedAt: Date;
      revision: number;
    },
    status: 'accepted' | 'duplicate_noop',
  ): MissionFeedbackWriteResponse {
    const reportStatus = row.reportStatus as MissionReportStatus;
    return {
      schema_version: MISSION_STATUS_SCHEMA_VERSION,
      status,
      assertion_id: row.id,
      child_id: row.childId,
      mission_id: row.missionId,
      occurrence_id: row.occurrenceId,
      report_status: reportStatus,
      authoritative: (AUTHORITATIVE_PARENT_REPORT_STATUSES as readonly string[]).includes(
        reportStatus,
      ),
      recorded_at: row.recordedAt.toISOString(),
      revision: row.revision,
      actor: 'parent',
      source: 'caregiver_report',
    };
  }

  private emptyParentReport(): ParentReportFacts {
    return {
      availability: 'no_report',
      status: null,
      authoritative: false,
      recorded_at: null,
      assertion_id: null,
      revision: null,
      actor: 'parent',
      source: 'caregiver_report',
    };
  }

  private parentReportFromRow(row: {
    id: string;
    reportStatus: string;
    recordedAt: Date;
    revision: number;
  }): ParentReportFacts {
    const status = row.reportStatus as MissionReportStatus;
    return {
      availability: 'reported',
      status,
      authoritative: (AUTHORITATIVE_PARENT_REPORT_STATUSES as readonly string[]).includes(status),
      recorded_at: row.recordedAt.toISOString(),
      assertion_id: row.id,
      revision: row.revision,
      actor: 'parent',
      source: 'caregiver_report',
    };
  }

  private parseFeedbackBody(raw: SubmitMissionFeedbackInput): {
    idempotency_key: string;
    occurrence_id: string;
    status: MissionReportStatus;
  } {
    if (raw.schema_version !== MISSION_STATUS_SCHEMA_VERSION) {
      throw new BadRequestException('Unsupported schema_version');
    }
    const idempotency_key = this.parseUuid(raw.idempotency_key, 'idempotency_key');
    const occurrence_id = this.parseUuid(raw.occurrence_id, 'occurrence_id');
    if (typeof raw.status !== 'string' || !(MISSION_REPORT_STATUSES as readonly string[]).includes(raw.status)) {
      throw new BadRequestException('Invalid status');
    }
    return {
      idempotency_key,
      occurrence_id,
      status: raw.status as MissionReportStatus,
    };
  }

  private parseUuid(value: unknown, field: string): string {
    if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return value.toLowerCase();
  }

  private parseLimit(raw: string | undefined): number {
    if (raw === undefined) {
      return DEFAULT_MISSION_READ_LIMIT;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_MISSION_READ_LIMIT) {
      throw new BadRequestException('Invalid limit');
    }
    return parsed;
  }

  private async requireOwnedChild(parentId: string, childId: string): Promise<void> {
    const child = await this.prisma.db.childProfile.findFirst({
      where: { id: childId, parentId, deletedAt: null, parent: { lifecycle: 'active', deletedAt: null } },
      select: { id: true },
    });
    if (!child) {
      throw new NotFoundException('Child profile not found');
    }
  }

  private async requireWriteConsent(parentId: string, childId: string): Promise<void> {
    const consent = await this.loadConsent(parentId, childId);
    const eligible = isSessionConsentEligibleAtRead(
      MISSION_STATUS_CONSENT_SCOPE,
      MISSION_STATUS_CONSENT_POLICY,
      consent.parent,
      consent.child,
    );
    if (!eligible) {
      throw new ForbiddenException('Consent not authorized for mission feedback');
    }
  }

  private async loadConsent(parentId: string, childId: string) {
    const rows = await this.prisma.db.consentRecord.findMany({
      where: {
        parentId,
        OR: [{ childId: null }, { childId }],
      },
      orderBy: { recordedAt: 'desc' },
    });
    const parent = consentRecordsFromRows(rows.filter((row) => row.childId === null));
    const child = consentRecordsFromRows(rows.filter((row) => row.childId === childId));
    return { parent, child };
  }
}
