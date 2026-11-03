import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ActivitySession, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_SESSION_KPI_STALE_THRESHOLD_SECONDS,
  SESSION_KPI_DEFINITION_VERSION,
  SESSION_KPI_SUPPORTED_SCHEMA_VERSION,
  TERMINAL_COMPLETION_STATUSES,
} from './session-kpi.constants';
import {
  consentRecordsFromRows,
  isSessionConsentEligibleAtRead,
} from './session-kpi.consent';
import { resolveSessionDurationSeconds } from './session-kpi-duration';
import { isValidIanaTimeZone, localDateKey, parseInstant } from './session-kpi-time';

export type SessionKpiQuery = {
  childId?: string;
  from: string;
  to: string;
  timezone: string;
};

type RateMetric =
  | { availability_status: 'available'; value: number; numerator: number; denominator: number }
  | {
      availability_status: 'unavailable';
      reason_code: string;
      numerator: number;
      denominator: number;
    };

type ActivityBreakdownRow = {
  content_version_id: string;
  session_starts: number;
  completed_sessions: number;
  play_duration_seconds: number;
};

export type SessionKpiResponse = {
  definition_version: typeof SESSION_KPI_DEFINITION_VERSION;
  source: 'server_activity_sessions';
  generated_at: string;
  latest_ingested_at: string | null;
  latest_activity_at: string | null;
  window: {
    from: string;
    to: string;
    timezone: string;
    bounds: 'half_open_started_at';
  };
  freshness: {
    status: 'fresh' | 'stale' | 'no_data' | 'unknown';
    stale_threshold_seconds: number;
    data_completeness: 'complete' | 'partial' | 'unknown';
  };
  sample: {
    eligible_sessions: number;
    terminal_sessions: number;
    excluded_unsupported_schema: number;
    excluded_consent: number;
  };
  metrics: {
    eligible_session_count: number;
    completed_session_count: number;
    interrupted_session_count: number;
    abandoned_session_count: number;
    in_progress_session_count: number;
    total_play_duration_seconds: number;
    completed_session_rate: RateMetric;
    distinct_play_days: number;
    by_activity: ActivityBreakdownRow[];
    first_attempt_accuracy: RateMetric;
  };
};

@Injectable()
export class SessionKpiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async aggregate(parentId: string, query: SessionKpiQuery, now = new Date()): Promise<SessionKpiResponse> {
    const window = this.parseWindow(query);
    if (query.childId) {
      const child = await this.prisma.db.childProfile.findFirst({
        where: { id: query.childId, parentId, deletedAt: null, parent: { lifecycle: 'active', deletedAt: null } },
        select: { id: true },
      });
      if (!child) {
        throw new NotFoundException('Child not found');
      }
    }

    const childFilter: Prisma.ChildProfileWhereInput = {
      parentId,
      deletedAt: null,
      parent: { lifecycle: 'active', deletedAt: null },
      ...(query.childId ? { id: query.childId } : {}),
    };

    const consentRows = await this.prisma.db.consentRecord.findMany({
      where: { parentId },
      orderBy: { recordedAt: 'desc' },
    });
    const parentConsent = consentRecordsFromRows(consentRows.filter((row) => !row.childId));
    const consentByChild = new Map<string, ReturnType<typeof consentRecordsFromRows>>();
    for (const row of consentRows) {
      if (!row.childId) continue;
      const list = consentByChild.get(row.childId) ?? [];
      list.push(...consentRecordsFromRows([row]));
      consentByChild.set(row.childId, list);
    }

    const sessions = await this.prisma.db.activitySession.findMany({
      where: {
        child: childFilter,
        startedAt: { gte: window.from, lt: window.to },
      },
      select: {
        id: true,
        childId: true,
        contentVersionId: true,
        startedAt: true,
        endedAt: true,
        monotonicDurationSeconds: true,
        completionStatus: true,
        schemaVersion: true,
        consentScope: true,
        consentPolicyVersion: true,
      },
      orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
    });

    let excludedUnsupported = 0;
    let excludedConsent = 0;
    const eligible: typeof sessions = [];
    for (const session of sessions) {
      if (session.schemaVersion !== SESSION_KPI_SUPPORTED_SCHEMA_VERSION) {
        excludedUnsupported += 1;
        continue;
      }
      const childConsent = consentByChild.get(session.childId) ?? [];
      if (
        !isSessionConsentEligibleAtRead(
          session.consentScope,
          session.consentPolicyVersion,
          parentConsent,
          childConsent,
        )
      ) {
        excludedConsent += 1;
        continue;
      }
      eligible.push(session);
    }

    const { terminal_sessions: terminalSessions, ...metrics } = this.computeSessionMetrics(
      eligible,
      query.timezone,
    );
    const accuracy = await this.computeFirstAttemptAccuracy(
      childFilter,
      window.from,
      window.to,
      parentConsent,
      consentByChild,
    );

    const ingestBounds = await this.loadIngestFreshness(parentId, childFilter);
    const staleThreshold = this.staleThresholdSeconds();
    const freshness = this.buildFreshness(
      now,
      ingestBounds.latestIngestedAt,
      ingestBounds.latestActivityAt,
      metrics.in_progress_session_count,
      eligible.length,
      staleThreshold,
    );

    return {
      definition_version: SESSION_KPI_DEFINITION_VERSION,
      source: 'server_activity_sessions',
      generated_at: now.toISOString(),
      latest_ingested_at: ingestBounds.latestIngestedAt?.toISOString() ?? null,
      latest_activity_at: ingestBounds.latestActivityAt?.toISOString() ?? null,
      window: {
        from: window.from.toISOString(),
        to: window.to.toISOString(),
        timezone: query.timezone,
        bounds: 'half_open_started_at',
      },
      freshness,
      sample: {
        eligible_sessions: eligible.length,
        terminal_sessions: terminalSessions,
        excluded_unsupported_schema: excludedUnsupported,
        excluded_consent: excludedConsent,
      },
      metrics: {
        ...metrics,
        first_attempt_accuracy: accuracy,
      },
    };
  }

  private staleThresholdSeconds(): number {
    const raw = this.config.get<string>('SESSION_KPI_STALE_THRESHOLD_SECONDS');
    if (!raw) {
      return DEFAULT_SESSION_KPI_STALE_THRESHOLD_SECONDS;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_SESSION_KPI_STALE_THRESHOLD_SECONDS;
  }

  private parseWindow(query: SessionKpiQuery): { from: Date; to: Date } {
    if (!isValidIanaTimeZone(query.timezone)) {
      throw new BadRequestException('Invalid timezone');
    }
    const from = parseInstant(query.from);
    const to = parseInstant(query.to);
    if (!from || !to || from >= to) {
      throw new BadRequestException('Invalid window');
    }
    return { from, to };
  }

  private computeSessionMetrics(
    sessions: readonly Pick<
      ActivitySession,
      | 'id'
      | 'contentVersionId'
      | 'startedAt'
      | 'endedAt'
      | 'monotonicDurationSeconds'
      | 'completionStatus'
    >[],
    timezone: string,
  ) {
    let completed = 0;
    let interrupted = 0;
    let abandoned = 0;
    let inProgress = 0;
    let terminal = 0;
    let totalDuration = 0;
    const playDays = new Set<string>();
    const byActivity = new Map<string, ActivityBreakdownRow>();

    for (const session of sessions) {
      playDays.add(localDateKey(session.startedAt, timezone));
      const status = session.completionStatus ?? 'started';
      const isTerminal =
        (TERMINAL_COMPLETION_STATUSES as readonly string[]).includes(status) ||
        session.endedAt !== null;
      if (status === 'completed') completed += 1;
      else if (status === 'interrupted') interrupted += 1;
      else if (status === 'abandoned') abandoned += 1;
      else inProgress += 1;
      if (isTerminal) terminal += 1;

      const duration = resolveSessionDurationSeconds({
        monotonicDurationSeconds: session.monotonicDurationSeconds,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      });
      if (duration !== null) {
        totalDuration += duration;
      }

      const row =
        byActivity.get(session.contentVersionId) ??
        {
          content_version_id: session.contentVersionId,
          session_starts: 0,
          completed_sessions: 0,
          play_duration_seconds: 0,
        };
      row.session_starts += 1;
      if (status === 'completed') row.completed_sessions += 1;
      if (duration !== null) row.play_duration_seconds += duration;
      byActivity.set(session.contentVersionId, row);
    }

    const completedRate =
      terminal > 0
        ? {
            availability_status: 'available' as const,
            value: completed / terminal,
            numerator: completed,
            denominator: terminal,
          }
        : {
            availability_status: 'unavailable' as const,
            reason_code: 'zero_denominator',
            numerator: completed,
            denominator: 0,
          };

    return {
      eligible_session_count: sessions.length,
      completed_session_count: completed,
      interrupted_session_count: interrupted,
      abandoned_session_count: abandoned,
      in_progress_session_count: inProgress,
      total_play_duration_seconds: totalDuration,
      completed_session_rate: completedRate,
      distinct_play_days: playDays.size,
      by_activity: [...byActivity.values()].sort((a, b) =>
        a.content_version_id.localeCompare(b.content_version_id),
      ),
      terminal_sessions: terminal,
    };
  }

  private async computeFirstAttemptAccuracy(
    childFilter: Prisma.ChildProfileWhereInput,
    from: Date,
    to: Date,
    parentConsent: ReturnType<typeof consentRecordsFromRows>,
    consentByChild: Map<string, ReturnType<typeof consentRecordsFromRows>>,
  ): Promise<SessionKpiResponse['metrics']['first_attempt_accuracy']> {
    const events = await this.prisma.db.activityEvent.findMany({
      where: {
        eventType: 'activity_completed',
        schemaVersion: SESSION_KPI_SUPPORTED_SCHEMA_VERSION,
        occurredAt: { gte: from, lt: to },
        playSession: { child: childFilter },
      },
      select: {
        playSessionId: true,
        childId: true,
        occurredAt: true,
        consentScope: true,
        consentPolicyVersion: true,
        payloadJson: true,
      },
      orderBy: [{ occurredAt: 'desc' }, { playSessionId: 'asc' }],
    });

    const latestBySession = new Map<string, (typeof events)[number]>();
    for (const event of events) {
      if (latestBySession.has(event.playSessionId)) continue;
      const childConsent = consentByChild.get(event.childId) ?? [];
      if (
        !isSessionConsentEligibleAtRead(
          event.consentScope,
          event.consentPolicyVersion,
          parentConsent,
          childConsent,
        )
      ) {
        continue;
      }
      latestBySession.set(event.playSessionId, event);
    }

    let numerator = 0;
    let denominator = 0;
    for (const event of latestBySession.values()) {
      const payload = event.payloadJson;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      const eligible = (payload as Record<string, unknown>).eligible_first_attempts;
      const correct = (payload as Record<string, unknown>).correct_first_attempts;
      if (typeof eligible !== 'number' || typeof correct !== 'number') continue;
      if (!Number.isFinite(eligible) || !Number.isFinite(correct) || eligible <= 0) continue;
      denominator += Math.floor(eligible);
      numerator += Math.min(Math.floor(correct), Math.floor(eligible));
    }

    if (denominator <= 0) {
      return {
        availability_status: 'unavailable',
        reason_code: 'insufficient_denominator',
        numerator: 0,
        denominator: 0,
      };
    }
    return {
      availability_status: 'available',
      numerator,
      denominator,
      value: numerator / denominator,
    };
  }

  private async loadIngestFreshness(
    parentId: string,
    childFilter: Prisma.ChildProfileWhereInput,
  ): Promise<{ latestIngestedAt: Date | null; latestActivityAt: Date | null }> {
    const [childEvent, parentEvent, sessionStart] = await Promise.all([
      this.prisma.db.activityEvent.findFirst({
        where: { playSession: { child: childFilter } },
        orderBy: { receivedAt: 'desc' },
        select: { receivedAt: true, occurredAt: true },
      }),
      this.prisma.db.parentActivityEvent.findFirst({
        where: { parentId },
        orderBy: { receivedAt: 'desc' },
        select: { receivedAt: true, occurredAt: true },
      }),
      this.prisma.db.activitySession.findFirst({
        where: { child: childFilter },
        orderBy: { startedAt: 'desc' },
        select: { startedAt: true },
      }),
    ]);

    const ingestCandidates = [childEvent?.receivedAt, parentEvent?.receivedAt].filter(
      (value): value is Date => value instanceof Date,
    );
    const activityCandidates = [
      childEvent?.occurredAt,
      parentEvent?.occurredAt,
      sessionStart?.startedAt,
    ].filter((value): value is Date => value instanceof Date);

    return {
      latestIngestedAt: ingestCandidates.length
        ? new Date(Math.max(...ingestCandidates.map((d) => d.getTime())))
        : null,
      latestActivityAt: activityCandidates.length
        ? new Date(Math.max(...activityCandidates.map((d) => d.getTime())))
        : null,
    };
  }

  private buildFreshness(
    now: Date,
    latestIngestedAt: Date | null,
    latestActivityAt: Date | null,
    inProgressCount: number,
    eligibleCount: number,
    staleThresholdSeconds: number,
  ): SessionKpiResponse['freshness'] {
    let status: SessionKpiResponse['freshness']['status'] = 'unknown';
    if (eligibleCount === 0 && !latestIngestedAt && !latestActivityAt) {
      status = 'no_data';
    } else if (latestIngestedAt) {
      const ageSeconds = (now.getTime() - latestIngestedAt.getTime()) / 1000;
      status = ageSeconds <= staleThresholdSeconds ? 'fresh' : 'stale';
    }

    const dataCompleteness =
      inProgressCount > 0 ? 'partial' : eligibleCount > 0 || latestIngestedAt ? 'complete' : 'unknown';

    return {
      status,
      stale_threshold_seconds: staleThresholdSeconds,
      data_completeness: dataCompleteness,
    };
  }
}
