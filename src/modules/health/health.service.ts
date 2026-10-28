import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecentErrorsStore } from '../observability/recent-errors.store';
import { StructuredLogger } from '../observability/structured-logger';

export type LivenessStatus = {
  status: 'ok';
  service: 'little-minds-backend';
  timestamp: string;
};

export type DatabaseCheck = 'up' | 'down' | 'skipped';

export type ReadinessStatus = {
  status: 'ok' | 'not_ready';
  service: 'little-minds-backend';
  timestamp: string;
  checks: {
    database: DatabaseCheck;
  };
};

/** @deprecated Prefer LivenessStatus — kept for existing imports. */
export type HealthStatus = LivenessStatus;

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger,
    private readonly recentErrors: RecentErrorsStore,
  ) {}

  getLiveness(): LivenessStatus {
    return {
      status: 'ok',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness for load balancers / alert scrapers.
   * - database=skipped when DATABASE_URL is unset (local Nest without DB)
   * - database=up|down when configured; down → status not_ready (HTTP 503)
   */
  async getReadiness(): Promise<ReadinessStatus> {
    let database: DatabaseCheck = 'skipped';

    if (this.prisma.isConfigured) {
      const up = await this.prisma.ping();
      database = up ? 'up' : 'down';
    }

    const ready = database !== 'down';
    const payload: ReadinessStatus = {
      status: ready ? 'ok' : 'not_ready',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
      checks: { database },
    };

    if (!ready) {
      this.logger.error('readiness_failed', {
        alertable: true,
        context: {
          event: 'health',
          check: 'readiness',
          database,
          ready: false,
        },
      });
    }

    return payload;
  }

  /** Alert-ready signal surface for operators (no paid vendor). */
  getAlertSignal(): { recent_error_failures: boolean } {
    return { recent_error_failures: this.recentErrors.hasRecentFailures() };
  }
}
