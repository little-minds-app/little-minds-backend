import {
  INestApplication,
  CanActivate,
  ConflictException,
  ExecutionContext,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DeviceActiveChildController } from '../src/modules/device/device-active-child.controller';
import { DeviceActiveChildService } from '../src/modules/device/device-active-child.service';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('LMP-134 device active-child HTTP boundary', () => {
  let app: INestApplication<App>;
  let service: DeviceActiveChildService;
  const parentA = '11111111-1111-4111-8111-111111111111';
  const installationId = '22222222-2222-4222-8222-222222222222';

  const tokenGuard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const token = req.headers.authorization;
      if (token !== `Bearer ${parentA}`) {
        return false;
      }
      req.parentAuth = { parentId: parentA, sessionId: 'test', jti: 'test' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DeviceActiveChildController],
      providers: [
        DeviceActiveChildService,
        { provide: PrismaService, useValue: { db: {} } },
        { provide: ParentAuthGuard, useValue: tokenGuard },
      ],
    })
      .overrideGuard(ParentAuthGuard)
      .useValue(tokenGuard)
      .compile();
    app = moduleRef.createNestApplication();
    service = moduleRef.get(DeviceActiveChildService);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => jest.restoreAllMocks());

  it('denies missing bearer credentials', async () => {
    const spy = jest.spyOn(service, 'get');
    await request(app.getHttpServer())
      .get(`/v1/devices/${installationId}/active-child`)
      .expect(403);
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects malformed installation UUID before service', async () => {
    const spy = jest.spyOn(service, 'get');
    await request(app.getHttpServer())
      .get('/v1/devices/not-a-uuid/active-child')
      .set('Authorization', `Bearer ${parentA}`)
      .expect(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it('forwards authenticated read to service', async () => {
    jest.spyOn(service, 'get').mockResolvedValue({
      device_id: '33333333-3333-4333-8333-333333333333',
      installation_id: installationId,
      child_id: null,
      binding_revision: 0,
      updated_at: '2026-11-04T00:00:00.000Z',
    });
    await request(app.getHttpServer())
      .get(`/v1/devices/${installationId}/active-child`)
      .set('Authorization', `Bearer ${parentA}`)
      .expect(200);
    expect(service.get).toHaveBeenCalledWith(parentA, installationId);
  });

  it('forwards authenticated bind to service', async () => {
    const childId = '44444444-4444-4444-8444-444444444444';
    jest.spyOn(service, 'set').mockResolvedValue({
      device_id: '33333333-3333-4333-8333-333333333333',
      installation_id: installationId,
      child_id: childId,
      binding_revision: 1,
      updated_at: '2026-11-04T00:00:01.000Z',
    });
    await request(app.getHttpServer())
      .put(`/v1/devices/${installationId}/active-child`)
      .set('Authorization', `Bearer ${parentA}`)
      .send({ child_id: childId, expected_binding_revision: 0 })
      .expect(200);
    expect(service.set).toHaveBeenCalledWith(parentA, installationId, childId, 0);
  });

  it('maps stale revision conflicts to HTTP 409', async () => {
    jest
      .spyOn(service, 'set')
      .mockRejectedValue(
        new ConflictException('Stale device active-child binding revision'),
      );
    await request(app.getHttpServer())
      .put(`/v1/devices/${installationId}/active-child`)
      .set('Authorization', `Bearer ${parentA}`)
      .send({ child_id: null, expected_binding_revision: 0 })
      .expect(409);
  });
});
