import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { StructuredLogger } from '../observability/structured-logger';
import { RecentErrorsStore } from '../observability/recent-errors.store';

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
    const service = new HealthService(prisma, logger, recentErrors);
    const result = service.getLiveness();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('little-minds-backend');
    expect(result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(result).not.toHaveProperty('DATABASE_URL');
    expect(JSON.stringify(result)).not.toMatch(/password|secret|api[_-]?key/i);
  });

  it('skips database when DATABASE_URL is unset', async () => {
    const prisma = {
      isConfigured: false,
      ping: jest.fn(),
    } as unknown as PrismaService;
    const service = new HealthService(prisma, logger, recentErrors);

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ok',
      checks: { database: 'skipped' },
    });
    expect(prisma.ping).not.toHaveBeenCalled();
  });

  it('marks not_ready and logs alertably when database ping fails', async () => {
    const prisma = {
      isConfigured: true,
      ping: jest.fn().mockResolvedValue(false),
    } as unknown as PrismaService;
    const errorSpy = jest.fn();
    const failingLogger = {
      error: errorSpy,
    } as unknown as StructuredLogger;
    const service = new HealthService(prisma, failingLogger, recentErrors);

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'not_ready',
      checks: { database: 'down' },
    });
    expect(errorSpy).toHaveBeenCalledWith(
      'readiness_failed',
      expect.objectContaining({ alertable: true }),
    );
  });

  it('reports database up when ping succeeds', async () => {
    const prisma = {
      isConfigured: true,
      ping: jest.fn().mockResolvedValue(true),
    } as unknown as PrismaService;
    const service = new HealthService(prisma, logger, recentErrors);

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ok',
      checks: { database: 'up' },
    });
  });
});
