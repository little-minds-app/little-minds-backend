import { type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { SessionKpiController } from '../src/modules/session-kpi/session-kpi.controller';
import { SessionKpiService } from '../src/modules/session-kpi/session-kpi.service';

describe('LMP-52 session KPI HTTP authorization', () => {
  let app: INestApplication<App>;
  const aggregate = jest.fn();
  const guard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; parentAuth?: { parentId: string; sessionId: string; jti: string } }>();
      if (req.headers.authorization !== 'Bearer parent-A') return false;
      req.parentAuth = { parentId: 'parent-A', sessionId: 's', jti: 'j' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SessionKpiController],
      providers: [{ provide: SessionKpiService, useValue: { aggregate } }, { provide: ParentAuthGuard, useValue: guard }],
    }).overrideGuard(ParentAuthGuard).useValue(guard).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => jest.resetAllMocks());

  it('requires parent authentication', async () => {
    await request(app.getHttpServer()).get('/v1/insights/session-kpis').query({ from: 'a', to: 'b', timezone: 'UTC' }).expect(403);
  });

  it('derives parent identity from guard for KPI reads', async () => {
    aggregate.mockResolvedValue({ definition_version: 'session-kpi-v1' });
    await request(app.getHttpServer())
      .get('/v1/insights/session-kpis')
      .set('Authorization', 'Bearer parent-A')
      .query({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'Europe/Istanbul',
        child_id: '00000000-0000-4000-8000-000000000099',
      })
      .expect(200);
    expect(aggregate).toHaveBeenCalledWith('parent-A', expect.objectContaining({
      childId: '00000000-0000-4000-8000-000000000099',
    }));
  });
});
