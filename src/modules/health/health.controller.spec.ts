import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { StructuredLogger } from '../observability/structured-logger';
import { RecentErrorsStore } from '../observability/recent-errors.store';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        RecentErrorsStore,
        {
          provide: PrismaService,
          useValue: {
            isConfigured: false,
            ping: jest.fn(),
          },
        },
        {
          provide: StructuredLogger,
          useValue: {
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
    healthService = module.get(HealthService);
  });

  it('exposes liveness status from the service', () => {
    const payload = controller.check();
    expect(payload.status).toBe('ok');
    expect(payload.service).toBe('little-minds-backend');
  });

  it('returns readiness and sets 503 when not ready', async () => {
    jest.spyOn(healthService, 'getReadiness').mockResolvedValue({
      status: 'not_ready',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
      checks: { database: 'down' },
    });

    const res = { status: jest.fn() };
    const payload = await controller.ready(res as never);
    expect(payload.status).toBe('not_ready');
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('does not force status when readiness is ok', async () => {
    jest.spyOn(healthService, 'getReadiness').mockResolvedValue({
      status: 'ok',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
      checks: { database: 'skipped' },
    });

    const res = { status: jest.fn() };
    const payload = await controller.ready(res as never);
    expect(payload.status).toBe('ok');
    expect(res.status).not.toHaveBeenCalled();
  });
});
