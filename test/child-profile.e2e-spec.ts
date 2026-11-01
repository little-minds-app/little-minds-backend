import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ChildProfileController } from '../src/modules/child-profile/child-profile.controller';
import { ChildProfileService } from '../src/modules/child-profile/child-profile.service';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';

describe('LMP-39 HTTP child profile security boundary', () => {
  let app: INestApplication<App>;
  const get = jest.fn();
  const create = jest.fn();
  const tokenGuard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const token = req.headers.authorization;
      if (token !== 'Bearer parent-A' && token !== 'Bearer parent-B') return false;
      req.parentAuth = { parentId: token.slice('Bearer '.length), sessionId: 'test', jti: 'test' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ChildProfileController],
      providers: [{ provide: ChildProfileService, useValue: { get, create } }, { provide: ParentAuthGuard, useValue: tokenGuard }],
    }).overrideGuard(ParentAuthGuard).useValue(tokenGuard).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  beforeEach(() => jest.resetAllMocks());

  const childId = '7bb93fcf-2263-4fef-a4ec-93c130edb5cd';

  it('denies missing bearer credentials', async () => {
    await request(app.getHttpServer()).get('/v1/children/' + childId).expect(403);
    await request(app.getHttpServer()).post('/v1/children').send({ age_months: 24, reference_date: '2026-01-01' }).expect(403);
    expect(get).not.toHaveBeenCalled();
  });

  it('rejects malformed child IDs before service/Prisma', async () => {
    await request(app.getHttpServer()).get('/v1/children/not-a-uuid').set('Authorization', 'Bearer parent-A').expect(404);
    expect(get).not.toHaveBeenCalled();
  });

  it('passes only authenticated parent identity to the service', async () => {
    get.mockResolvedValue({ child_id: childId, nickname: null, age_months: 24, preferred_locale: 'tr-TR' });
    await request(app.getHttpServer()).get('/v1/children/' + childId).set('Authorization', 'Bearer parent-B').expect(200);
    expect(get).toHaveBeenCalledWith('parent-B', childId);
  });

  it('never trusts the parent from a request body', async () => {
    create.mockResolvedValue({ child_id: childId });
    await request(app.getHttpServer()).post('/v1/children').set('Authorization', 'Bearer parent-A')
      .send({ age_months: 24, reference_date: '2026-01-01' }).expect(201);
    expect(create).toHaveBeenCalledWith('parent-A', { age_months: 24, reference_date: '2026-01-01' });
  });
});
