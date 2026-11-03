import { INestApplication, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ChildProfileService } from '../src/modules/child-profile/child-profile.service';
import { WebChildProfileController } from '../src/modules/child-profile/web-child-profile.controller';
import { WebParentSessionService } from '../src/modules/identity/session/web-parent-session.service';
import { MissionStatusService } from '../src/modules/real-world-mission/mission-status.service';
import { WebMissionStatusController } from '../src/modules/real-world-mission/web-mission-status.controller';
import { SessionKpiService } from '../src/modules/session-kpi/session-kpi.service';
import { WebSessionKpiController } from '../src/modules/session-kpi/web-session-kpi.controller';

describe('LMP-54 web dashboard passive read APIs', () => {
  let app: INestApplication<App>;
  const aggregate = jest.fn();
  const listForChild = jest.fn();
  const listChildren = jest.fn();
  const sessions = { requireActive: jest.fn() };
  const bffSecret = 'synthetic-bff-secret-at-least-32-bytes-long';
  const handle = 'A'.repeat(43);
  const childId = '00000000-0000-4000-8000-000000000099';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WebSessionKpiController, WebMissionStatusController, WebChildProfileController],
      providers: [
        { provide: SessionKpiService, useValue: { aggregate } },
        { provide: MissionStatusService, useValue: { listForChild } },
        { provide: ChildProfileService, useValue: { list: listChildren } },
        { provide: WebParentSessionService, useValue: sessions },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'LM_WEB_BFF_SECRET' ? bffSecret : undefined),
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    sessions.requireActive.mockResolvedValue({
      parent_id: 'parent-A',
      locale: 'tr-TR',
      timezone: 'Europe/Istanbul',
    });
    aggregate.mockResolvedValue({ definition_version: 'session-kpi-v1' });
    listForChild.mockResolvedValue({ schema_version: 'mission-status-v1', items: [] });
    listChildren.mockResolvedValue({ children: [] });
  });

  const headers = (req: request.Test) =>
    req.set('x-lm-web-session', handle).set('x-lm-bff-secret', bffSecret);

  describe('GET /v1/web/children', () => {
    it('keeps successful child list reads passive', async () => {
      await headers(request(app.getHttpServer()).get('/v1/web/children')).expect(200);
      expect(sessions.requireActive).toHaveBeenCalledTimes(1);
      expect(sessions.requireActive).toHaveBeenCalledWith(handle, false);
      expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
      expect(listChildren).toHaveBeenCalledWith('parent-A');
    });
  });

  describe('GET /v1/web/insights/session-kpis', () => {
    it('rejects absent BFF authority without touching the session', async () => {
      await request(app.getHttpServer())
        .get('/v1/web/insights/session-kpis')
        .query({ from: 'a', to: 'b', timezone: 'UTC' })
        .set('x-lm-web-session', handle)
        .expect(401);
      expect(sessions.requireActive).not.toHaveBeenCalled();
      expect(aggregate).not.toHaveBeenCalled();
    });

    it('rejects incorrect BFF secret without touching session', async () => {
      await request(app.getHttpServer())
        .get('/v1/web/insights/session-kpis')
        .query({ from: '2026-01-01T00:00:00.000Z', to: '2026-01-02T00:00:00.000Z', timezone: 'Europe/Istanbul' })
        .set('x-lm-web-session', handle)
        .set('x-lm-bff-secret', 'incorrect-bff-secret-at-least-32-bytes-long')
        .expect(401);
      expect(sessions.requireActive).not.toHaveBeenCalled();
      expect(aggregate).not.toHaveBeenCalled();
    });

    it('rejects invalid opaque session without reaching KPI aggregation', async () => {
      sessions.requireActive.mockRejectedValue(new UnauthorizedException('Invalid session'));
      await headers(
        request(app.getHttpServer()).get('/v1/web/insights/session-kpis').query({
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T00:00:00.000Z',
          timezone: 'Europe/Istanbul',
        }),
      ).expect(401);
      expect(aggregate).not.toHaveBeenCalled();
    });

    it('delegates to SessionKpiService with passive session check only', async () => {
      await headers(
        request(app.getHttpServer()).get('/v1/web/insights/session-kpis').query({
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T00:00:00.000Z',
          timezone: 'Europe/Istanbul',
          child_id: childId,
        }),
      ).expect(200);
      expect(sessions.requireActive).toHaveBeenCalledWith(handle, false);
      expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
      expect(aggregate).toHaveBeenCalledWith('parent-A', {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        timezone: 'Europe/Istanbul',
        childId,
      });
    });
  });

  describe('GET /v1/web/children/:childId/missions', () => {
    it('rejects absent BFF authority without touching the session', async () => {
      await request(app.getHttpServer())
        .get(`/v1/web/children/${childId}/missions`)
        .query({
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T00:00:00.000Z',
        })
        .set('x-lm-web-session', handle)
        .expect(401);
      expect(sessions.requireActive).not.toHaveBeenCalled();
      expect(listForChild).not.toHaveBeenCalled();
    });

    it('rejects wrong BFF secret without touching the session', async () => {
      await request(app.getHttpServer())
        .get(`/v1/web/children/${childId}/missions`)
        .query({
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T00:00:00.000Z',
        })
        .set('x-lm-web-session', handle)
        .set('x-lm-bff-secret', 'wrong-bff-secret-that-is-long-enough-32b')
        .expect(401);
      expect(sessions.requireActive).not.toHaveBeenCalled();
      expect(listForChild).not.toHaveBeenCalled();
    });

    it('returns uniform 404 for foreign child without idle refresh', async () => {
      listForChild.mockRejectedValue(new NotFoundException('Child profile not found'));
      await headers(
        request(app.getHttpServer()).get(`/v1/web/children/${childId}/missions`).query({
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T00:00:00.000Z',
        }),
      ).expect(404);
      expect(sessions.requireActive).toHaveBeenCalledWith(handle, false);
      expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
    });

    it('delegates to MissionStatusService with passive session check only', async () => {
      await headers(
        request(app.getHttpServer()).get(`/v1/web/children/${childId}/missions`).query({
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-01-02T00:00:00.000Z',
          limit: '25',
        }),
      ).expect(200);
      expect(sessions.requireActive).toHaveBeenCalledWith(handle, false);
      expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
      expect(listForChild).toHaveBeenCalledWith('parent-A', childId, {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-02T00:00:00.000Z',
        limit: '25',
      });
    });
  });
});
