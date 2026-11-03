import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PARENT_AUTH_REQUEST_KEY } from '../src/modules/identity/auth/parent-auth.context';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { WebSessionController } from '../src/modules/identity/controllers/web-session.controller';
import { WebParentSessionService } from '../src/modules/identity/session/web-parent-session.service';

/**
 * LMP-38/132 — WebSessionController BFF boundary (session exchange + activity).
 * Does not duplicate LMP-54 passive dashboard read coverage in web-dashboard-read.e2e-spec.ts.
 */
describe('LMP-38 web session BFF HTTP boundary', () => {
  let app: INestApplication<App>;
  const webSessions = {
    create: jest.fn(),
    requireActive: jest.fn(),
    logout: jest.fn(),
  };
  const bffSecret = 'synthetic-bff-secret-at-least-32-bytes-long';
  const handle = 'B'.repeat(43);
  const parentId = '11111111-1111-4111-8111-111111111111';
  const sessionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  const parentGuard: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<{
        headers: { authorization?: string };
        [PARENT_AUTH_REQUEST_KEY]?: unknown;
      }>();
      const auth = req.headers.authorization;
      if (auth !== 'Bearer trusted-mobile-access') {
        throw new UnauthorizedException('Invalid parent session');
      }
      req[PARENT_AUTH_REQUEST_KEY] = {
        parentId,
        sessionId,
        jti: 'test-jti',
      };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WebSessionController],
      providers: [
        { provide: WebParentSessionService, useValue: webSessions },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'LM_WEB_BFF_SECRET' ? bffSecret : undefined),
          },
        },
        { provide: ParentAuthGuard, useValue: parentGuard },
      ],
    })
      .overrideGuard(ParentAuthGuard)
      .useValue(parentGuard)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    webSessions.create.mockResolvedValue({ handle, expires_at: '2026-12-01T00:00:00.000Z' });
    webSessions.requireActive.mockResolvedValue({
      parent_id: parentId,
      locale: 'tr-TR',
      timezone: 'Europe/Istanbul',
    });
    webSessions.logout.mockResolvedValue(undefined);
  });

  describe('POST /v1/auth/web/session', () => {
    it('requires mobile bearer before BFF secret is evaluated', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/web/session')
        .set('x-lm-bff-secret', bffSecret)
        .expect(401);
      expect(webSessions.create).not.toHaveBeenCalled();
    });

    it('rejects untrusted BFF on session exchange after parent auth', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/web/session')
        .set('Authorization', 'Bearer trusted-mobile-access')
        .set('x-lm-bff-secret', 'wrong-bff-secret-that-is-long-enough-32b')
        .expect(401);
      expect(webSessions.create).not.toHaveBeenCalled();
    });

    it('creates opaque web session from verified mobile session + BFF', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/web/session')
        .set('Authorization', 'Bearer trusted-mobile-access')
        .set('x-lm-bff-secret', bffSecret)
        .expect(201);
      expect(webSessions.create).toHaveBeenCalledWith(parentId, sessionId);
    });
  });

  describe('POST /v1/auth/web/activity', () => {
    it('rejects activity refresh without BFF authority', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/web/activity')
        .set('x-lm-web-session', handle)
        .expect(401);
      expect(webSessions.requireActive).not.toHaveBeenCalled();
    });

    it('extends idle clock only through explicit activity endpoint', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/web/activity')
        .set('x-lm-web-session', handle)
        .set('x-lm-bff-secret', bffSecret)
        .expect(200);
      expect(webSessions.requireActive).toHaveBeenCalledWith(handle, true);
    });
  });

  describe('GET /v1/auth/web/me and POST /v1/auth/web/logout', () => {
    it('reads session state from opaque handle without BFF secret', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/web/me')
        .set('x-lm-web-session', handle)
        .expect(200);
      expect(webSessions.requireActive).toHaveBeenCalledWith(handle);
    });

    it('logout revokes opaque handle without BFF secret', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/web/logout')
        .set('x-lm-web-session', handle)
        .expect(204);
      expect(webSessions.logout).toHaveBeenCalledWith(handle);
    });
  });
});
