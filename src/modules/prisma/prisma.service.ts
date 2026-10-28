import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { AppEnv } from '../../config/env.validation';

/**
 * Minimal Nest Prisma lifecycle wrapper for operational probes (LMP-32).
 * Domain repositories continue to land with their owning Jira tasks.
 * When DATABASE_URL is unset (local Nest without Compose), the client is not
 * created and readiness reports database=skipped.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient | null;

  constructor(config: ConfigService<AppEnv, true>) {
    const url = config.get('DATABASE_URL', { infer: true });
    this.client = url
      ? new PrismaClient({
          datasources: {
            db: { url },
          },
        })
      : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async onModuleInit(): Promise<void> {
    if (!this.client) {
      return;
    }
    try {
      await this.client.$connect();
    } catch {
      // Do not crash boot when DB is unreachable — readiness returns 503.
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }
    await this.client.$disconnect();
  }

  /**
   * Lightweight readiness ping. Returns false when unconfigured or on failure.
   */
  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
