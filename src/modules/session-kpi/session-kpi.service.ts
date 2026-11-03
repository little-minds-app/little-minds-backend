import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ActivitySession, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_SESSION_KPI_STALE_THRESHOLD_SECONDS,
  SESSION_KPI_DEFINITION_VERSION,
  SESSION_KPI_SUPPORTED_SCHEMA_VERSION,
} from './session-kpi.constants';
import { classifySessionLifecycle } from './session-kpi-lifecycle';
import {
  consentRecordsFromRows,
  isSessionConsentEligibleAtRead,
} from './session-kpi.consent';
import { parseFirstAttemptCounters } from './session-kpi-accuracy-payload';
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
      eligible,
      parentConsent,
      consentByChild,
    );

    const ingestBounds = await this.loadIngestFreshness(eligible.map((session) => session.id));
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
      const { bucket, terminal: isTerminal } = classifySessionLifecycle(session);
      if (bucket === 'completed') completed += 1;
      else if (bucket === 'interrupted') interrupted += 1;
      else if (bucket === 'abandoned') abandoned += 1;
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
      if (bucket === 'completed') row.completed_sessions += 1;
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
    eligibleSessions: readonly { id: string; childId: string }[],
    parentConsent: ReturnType<typeof consentRecordsFromRows>,
    consentByChild: Map<string, ReturnType<typeof consentRecordsFromRows>>,
  ): Promise<SessionKpiResponse['metrics']['first_attempt_accuracy']> {
    const sessionIds = eligibleSessions.map((session) => session.id);
    if (sessionIds.length === 0) {
      return {
        availability_status: 'unavailable',
        reason_code: 'insufficient_denominator',
        numerator: 0,
        denominator: 0,
      };
    }

    const events = await this.prisma.db.activityEvent.findMany({
      where: {
        eventType: 'activity_completed',
        playSessionId: { in: sessionIds },
      },
      select: {
        eventId: true,
        playSessionId: true,
        childId: true,
        occurredAt: true,
        schemaVersion: true,
        consentScope: true,
        consentPolicyVersion: true,
        payloadJson: true,
      },
      orderBy: [{ occurredAt: 'desc' }, { eventId: 'asc' }],
    });

    const latestBySession = new Map<string, (typeof events)[number]>();
    for (const event of events) {
      if (!latestBySession.has(event.playSessionId)) {
        latestBySession.set(event.playSessionId, event);
      }
    }

    let numerator = 0;
    let denominator = 0;
    for (const event of latestBySession.values()) {
      if (event.schemaVersion !== SESSION_KPI_SUPPORTED_SCHEMA_VERSION) {
        continue;
      }
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
      const payload = event.payloadJson;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
      const counters = parseFirstAttemptCounters(payload as Record<string, unknown>);
      if (!counters) continue;
      denominator += counters.eligible;
      numerator += counters.correct;
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
    eligibleSessionIds: readonly string[],
  ): Promise<{ latestIngestedAt: Date | null; latestActivityAt: Date | null }> {
    if (eligibleSessionIds.length === 0) {
      return { latestIngestedAt: null, latestActivityAt: null };
    }
    const sessionScope = { id: { in: [...eligibleSessionIds] } };
    const [childEvent, sessionStart] = await Promise.all([
      this.prisma.db.activityEvent.findFirst({
        where: { playSessionId: { in: [...eligibleSessionIds] } },
        orderBy: { receivedAt: 'desc' },
        select: { receivedAt: true, occurredAt: true },
      }),
      this.prisma.db.activitySession.findFirst({
        where: sessionScope,
        orderBy: { startedAt: 'desc' },
        select: { startedAt: true },
      }),
    ]);

    const ingestCandidates = [childEvent?.receivedAt].filter(
      (value): value is Date => value instanceof Date,
    );
    const activityCandidates = [childEvent?.occurredAt, sessionStart?.startedAt].filter(
      (value): value is Date => value instanceof Date,
    );

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
    } else if (eligibleCount === 0 && latestIngestedAt) {
      status = 'unknown';
    } else if (eligibleCount > 0 && latestIngestedAt) {
      const ageSeconds = (now.getTime() - latestIngestedAt.getTime()) / 1000;
      status = ageSeconds <= staleThresholdSeconds ? 'fresh' : 'stale';
    } else if (eligibleCount > 0) {
      status = 'unknown';
    }

    const dataCompleteness =
      inProgressCount > 0
        ? 'partial'
        : eligibleCount > 0
          ? 'complete'
          : latestIngestedAt
            ? 'partial'
            : 'unknown';

    return {
      status,
      stale_threshold_seconds: staleThresholdSeconds,
      data_completeness: dataCompleteness,
    };
  }
}
