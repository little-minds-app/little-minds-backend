import { type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ActivityIngestionController } from '../src/modules/activity-ingestion/activity-ingestion.controller';
import { ActivityIngestionService } from '../src/modules/activity-ingestion/activity-ingestion.service';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';

describe('LMP-51 batch ingestion HTTP parent authorization', () => {
  let app: INestApplication<App>;
  const ingest = jest.fn();
  const guard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; parentAuth?: { parentId: string; sessionId: string; jti: string } }>();
      if (req.headers.authorization !== 'Bearer parent-A') return false;
      req.parentAuth = { parentId: 'parent-A', sessionId: 'session-test', jti: 'jti-test' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ActivityIngestionController],
      providers: [
        { provide: ActivityIngestionService, useValue: { ingest } },
        { provide: ParentAuthGuard, useValue: guard },
      ],
    }).overrideGuard(ParentAuthGuard).useValue(guard).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => jest.resetAllMocks());

  it('does not admit a batch without parent authentication', async () => {
    await request(app.getHttpServer()).post('/v1/events/batch').send({ sessions: [], events: [] }).expect(403);
    expect(ingest).not.toHaveBeenCalled();
  });

  it('derives parent identity from guard, not from client body', async () => {
    const body = { sessions: [], events: [] };
    ingest.mockResolvedValue({ results: [] });
    const response = await request(app.getHttpServer())
      .post('/v1/events/batch')
      .set('Authorization', 'Bearer parent-A')
      .send(body)
      .expect(200);
    expect(response.body).toEqual({ results: [] });
    expect(ingest).toHaveBeenCalledWith('parent-A', body);
  });
});
