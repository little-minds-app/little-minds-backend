import { type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { ParentGateGrantGuard } from '../src/modules/identity/auth/parent-gate-grant.guard';
import { MissionStatusController } from '../src/modules/real-world-mission/mission-status.controller';
import { MissionStatusService } from '../src/modules/real-world-mission/mission-status.service';

describe('LMP-130 mission status HTTP authorization', () => {
  let app: INestApplication<App>;
  const listForChild = jest.fn();
  const submitFeedback = jest.fn();

  const parentGuard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<{
        headers: { authorization?: string };
        parentAuth?: { parentId: string; sessionId: string; jti: string };
      }>();
      if (req.headers.authorization !== 'Bearer parent-A') return false;
      req.parentAuth = { parentId: 'parent-A', sessionId: 's', jti: 'j' };
      return true;
    },
  };

  const gateGuard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<{ headers: { 'x-parent-gate-token'?: string } }>();
      return req.headers['x-parent-gate-token'] === 'gate-ok';
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MissionStatusController],
      providers: [
        { provide: MissionStatusService, useValue: { listForChild, submitFeedback } },
        { provide: ParentAuthGuard, useValue: parentGuard },
        { provide: ParentGateGrantGuard, useValue: gateGuard },
      ],
    })
      .overrideGuard(ParentAuthGuard)
      .useValue(parentGuard)
      .overrideGuard(ParentGateGrantGuard)
      .useValue(gateGuard)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => jest.resetAllMocks());

  it('requires parent authentication for mission reads', async () => {
    await request(app.getHttpServer())
      .get('/v1/children/00000000-0000-4000-8000-000000000099/missions')
      .expect(403);
  });

  it('derives parent identity for mission reads', async () => {
    listForChild.mockResolvedValue({ schema_version: 'mission-status-v1', items: [] });
    await request(app.getHttpServer())
      .get('/v1/children/00000000-0000-4000-8000-000000000099/missions')
      .set('Authorization', 'Bearer parent-A')
      .expect(200);
    expect(listForChild).toHaveBeenCalledWith('parent-A', '00000000-0000-4000-8000-000000000099', expect.any(Object));
  });

  it('requires parent gate for mission feedback writes', async () => {
    await request(app.getHttpServer())
      .post('/v1/children/00000000-0000-4000-8000-000000000099/missions/near_far_sock_soft_toy_v1/feedback')
      .set('Authorization', 'Bearer parent-A')
      .send({
        schema_version: 'mission-status-v1',
        idempotency_key: '00000000-0000-4000-8000-000000000011',
        occurrence_id: '00000000-0000-4000-8000-000000000010',
        status: 'completed',
      })
      .expect(403);
  });

  it('accepts mission feedback when gate grant is present', async () => {
    submitFeedback.mockResolvedValue({ status: 'accepted' });
    await request(app.getHttpServer())
      .post('/v1/children/00000000-0000-4000-8000-000000000099/missions/near_far_sock_soft_toy_v1/feedback')
      .set('Authorization', 'Bearer parent-A')
      .set('x-parent-gate-token', 'gate-ok')
      .send({
        schema_version: 'mission-status-v1',
        idempotency_key: '00000000-0000-4000-8000-000000000011',
        occurrence_id: '00000000-0000-4000-8000-000000000010',
        status: 'completed',
      })
      .expect(200);
    expect(submitFeedback).toHaveBeenCalledWith(
      'parent-A',
      '00000000-0000-4000-8000-000000000099',
      'near_far_sock_soft_toy_v1',
      expect.objectContaining({ status: 'completed' }),
    );
  });
});
