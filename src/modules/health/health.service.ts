import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv, AppEnvironment } from '../../config/env.validation';
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

/**
 * `checks.database: skipped` is allowed only for local development product env.
 * Staging and production must have DATABASE_URL; missing → treat as down / not_ready.
 */
export function allowsDatabaseSkip(appEnv: AppEnvironment): boolean {
  return appEnv === 'development';
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger,
    private readonly recentErrors: RecentErrorsStore,
    private readonly config: ConfigService<AppEnv, true>,
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
   * - database=skipped only when APP_ENV=development and DATABASE_URL unset
   * - staging/production missing DATABASE_URL → database=down, not_ready (HTTP 503)
   * - configured: database=up|down from ping; down → not_ready
   */
  async getReadiness(): Promise<ReadinessStatus> {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    let database: DatabaseCheck;

    if (this.prisma.isConfigured) {
      const up = await this.prisma.ping();
      database = up ? 'up' : 'down';
    } else if (allowsDatabaseSkip(appEnv)) {
      database = 'skipped';
    } else {
      // Staging/production (and any non-development env) require DATABASE_URL.
      database = 'down';
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
