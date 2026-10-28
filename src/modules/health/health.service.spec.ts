import { ConfigService } from '@nestjs/config';
import { HealthService, allowsDatabaseSkip } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { StructuredLogger } from '../observability/structured-logger';
import { RecentErrorsStore } from '../observability/recent-errors.store';
import type { AppEnv } from '../../config/env.validation';

function mockConfig(appEnv: AppEnv['APP_ENV']): ConfigService<AppEnv, true> {
  return {
    get: (key: string) => {
      if (key === 'APP_ENV') {
        return appEnv;
      }
      return undefined;
    },
  } as unknown as ConfigService<AppEnv, true>;
}

describe('allowsDatabaseSkip', () => {
  it('allows skip only for development product env', () => {
    expect(allowsDatabaseSkip('development')).toBe(true);
    expect(allowsDatabaseSkip('staging')).toBe(false);
    expect(allowsDatabaseSkip('production')).toBe(false);
  });
});

describe('HealthService', () => {
  const logger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  } as unknown as StructuredLogger;
  const recentErrors = new RecentErrorsStore();

  it('returns ok liveness payload without secrets', () => {
    const prisma = {
      isConfigured: false,
      ping: jest.fn(),
    } as unknown as PrismaService;
    const service = new HealthService(
      prisma,
      logger,
      recentErrors,
      mockConfig('development'),
    );
    const result = service.getLiveness();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('little-minds-backend');
    expect(result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(result).not.toHaveProperty('DATABASE_URL');
    expect(JSON.stringify(result)).not.toMatch(/password|secret|api[_-]?key/i);
  });

  it('positive: development may skip database when DATABASE_URL is unset', async () => {
    const prisma = {
      isConfigured: false,
      ping: jest.fn(),
    } as unknown as PrismaService;
    const service = new HealthService(
      prisma,
      logger,
      recentErrors,
      mockConfig('development'),
    );

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ok',
      checks: { database: 'skipped' },
    });
    expect(prisma.ping).not.toHaveBeenCalled();
  });

  it.each(['staging', 'production'] as const)(
    'negative: %s missing DATABASE_URL is not_ready with database=down',
    async (appEnv) => {
      const prisma = {
        isConfigured: false,
        ping: jest.fn(),
      } as unknown as PrismaService;
      const errorSpy = jest.fn();
      const failingLogger = {
        error: errorSpy,
      } as unknown as StructuredLogger;
      const service = new HealthService(
        prisma,
        failingLogger,
        recentErrors,
        mockConfig(appEnv),
      );

      await expect(service.getReadiness()).resolves.toMatchObject({
        status: 'not_ready',
        checks: { database: 'down' },
      });
      expect(prisma.ping).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        'readiness_failed',
        expect.objectContaining({ alertable: true }),
      );
    },
  );

  it('marks not_ready and logs alertably when database ping fails', async () => {
    const prisma = {
      isConfigured: true,
      ping: jest.fn().mockResolvedValue(false),
    } as unknown as PrismaService;
    const errorSpy = jest.fn();
    const failingLogger = {
      error: errorSpy,
    } as unknown as StructuredLogger;
    const service = new HealthService(
      prisma,
      failingLogger,
      recentErrors,
      mockConfig('production'),
    );

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'not_ready',
      checks: { database: 'down' },
    });
    expect(errorSpy).toHaveBeenCalledWith(
      'readiness_failed',
      expect.objectContaining({ alertable: true }),
    );
  });

  it('positive: reports database up when ping succeeds (staging)', async () => {
    const prisma = {
      isConfigured: true,
      ping: jest.fn().mockResolvedValue(true),
    } as unknown as PrismaService;
    const service = new HealthService(
      prisma,
      logger,
      recentErrors,
      mockConfig('staging'),
    );

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ok',
      checks: { database: 'up' },
    });
  });

  it('positive: reports database up when ping succeeds (production)', async () => {
    const prisma = {
      isConfigured: true,
      ping: jest.fn().mockResolvedValue(true),
    } as unknown as PrismaService;
    const service = new HealthService(
      prisma,
      logger,
      recentErrors,
      mockConfig('production'),
    );

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ok',
      checks: { database: 'up' },
    });
  });
});
