import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { AppEnv } from '../../config/env.validation';

/**
 * Nest Prisma lifecycle wrapper (LMP-32 readiness + LMP-33 domain access).
 * When DATABASE_URL is unset (local Nest without Compose), the client is not
 * created and readiness reports database=skipped. Session APIs require `db`.
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

  /**
   * Configured Prisma client for domain modules.
   * @throws ServiceUnavailableException when DATABASE_URL is unset
   */
  get db(): PrismaClient {
    if (!this.client) {
      throw new ServiceUnavailableException({
        error: 'database_unavailable',
        message: 'Database is not configured',
      });
    }
    return this.client;
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
