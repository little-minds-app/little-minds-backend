import { type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ParentConsentController } from '../src/modules/consent-privacy/parent-consent.controller';
import { ParentConsentService } from '../src/modules/consent-privacy/parent-consent.service';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('LMP-134 privacy consent HTTP boundary', () => {
  let app: INestApplication<App>;
  const parentA = '11111111-1111-4111-8111-111111111111';
  const guard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      if (req.headers.authorization !== `Bearer ${parentA}`) {
        return false;
      }
      req.parentAuth = { parentId: parentA, sessionId: 'test', jti: 'test' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ParentConsentController],
      providers: [
        ParentConsentService,
        // HTTP-boundary suite spies on the service; Prisma is required for DI only.
        { provide: PrismaService, useValue: { db: {} } },
        { provide: ParentAuthGuard, useValue: guard },
      ],
    })
      .overrideGuard(ParentAuthGuard)
      .useValue(guard)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => jest.restoreAllMocks());

  it('denies effective read without bearer credentials', async () => {
    const service = app.get(ParentConsentService);
    const spy = jest.spyOn(service, 'getEffectiveScopes');
    await request(app.getHttpServer())
      .get('/v1/privacy/consent/effective')
      .query({ scope: 'essential_play_events' })
      .expect(403);
    expect(spy).not.toHaveBeenCalled();
  });

  it('forwards authenticated grant to service', async () => {
    const service = app.get(ParentConsentService);
    jest.spyOn(service, 'grant').mockResolvedValue({
      record_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      consent_scope: 'essential_play_events',
      child_id: null,
      policy_version: 'synthetic-policy-v1',
      status: 'granted',
      recorded_at: '2026-03-01T12:00:00.000Z',
      source: 'server_consent_store',
    });
    const response = await request(app.getHttpServer())
      .post('/v1/privacy/consent/grant')
      .set('Authorization', `Bearer ${parentA}`)
      .send({
        consent_scope: 'essential_play_events',
        policy_version: 'synthetic-policy-v1',
      })
      .expect(201);
    expect(response.body.status).toBe('granted');
    expect(service.grant).toHaveBeenCalledWith(
      parentA,
      expect.objectContaining({
        consent_scope: 'essential_play_events',
        policy_version: 'synthetic-policy-v1',
      }),
    );
  });
});
