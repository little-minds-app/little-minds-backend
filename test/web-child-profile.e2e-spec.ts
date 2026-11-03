import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ChildProfileService } from '../src/modules/child-profile/child-profile.service';
import { WebChildProfileController } from '../src/modules/child-profile/web-child-profile.controller';
import { WebParentSessionService } from '../src/modules/identity/session/web-parent-session.service';

describe('LMP-40 HTTP web-session child profile boundary', () => {
  let app: INestApplication<App>;
  const children = { list: jest.fn(), create: jest.fn(), update: jest.fn() };
  const sessions = { requireActive: jest.fn(), authorizedMutation: jest.fn() };
  const bffSecret = 'synthetic-bff-secret-at-least-32-bytes-long';
  const handle = 'A'.repeat(43);
  const childId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WebChildProfileController],
      providers: [
        { provide: ChildProfileService, useValue: children },
        { provide: WebParentSessionService, useValue: sessions },
        { provide: ConfigService, useValue: { get: (key: string) =>
          key === 'LM_WEB_BFF_SECRET' ? bffSecret : undefined } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    jest.resetAllMocks();
    sessions.requireActive.mockResolvedValue({ parent_id: 'parent-A', locale: 'tr-TR', timezone: 'Europe/Istanbul' });
    sessions.authorizedMutation.mockImplementation((_handle: string, operation: (parentId: string, tx: object) => Promise<unknown>) => operation('parent-A', {}));
    children.list.mockResolvedValue({ children: [] });
    children.create.mockResolvedValue({ child_id: childId });
    children.update.mockResolvedValue({ child_id: childId, nickname: 'Updated', age_months: 33, preferred_locale: 'tr-TR' });
  });

  const headers = (req: request.Test) =>
    req.set('x-lm-web-session', handle).set('x-lm-bff-secret', bffSecret);

  it('rejects absent BFF authority without touching the session', async () => {
    await request(app.getHttpServer()).get('/v1/web/children').set('x-lm-web-session', handle).expect(401);
    expect(sessions.requireActive).not.toHaveBeenCalled();
  });

  it('rejects wrong BFF secret without touching the session', async () => {
    await request(app.getHttpServer())
      .get('/v1/web/children')
      .set('x-lm-web-session', handle)
      .set('x-lm-bff-secret', 'wrong-bff-secret-that-is-long-enough-32b')
      .expect(401);
    expect(sessions.requireActive).not.toHaveBeenCalled();
    expect(children.list).not.toHaveBeenCalled();
  });

  it('rejects invalid opaque session without reaching profile storage', async () => {
    sessions.requireActive.mockRejectedValue(new UnauthorizedException('Invalid session'));
    await headers(request(app.getHttpServer()).get('/v1/web/children')).expect(401);
    expect(children.list).not.toHaveBeenCalled();
  });

  it('derives parent only from verified opaque session on list/create/edit', async () => {
    await headers(request(app.getHttpServer()).get('/v1/web/children')).expect(200);
    await headers(request(app.getHttpServer()).post('/v1/web/children'))
      .send({ age_months: 32, reference_date: '2026-01-01' }).expect(201);
    await headers(request(app.getHttpServer()).patch('/v1/web/children/' + childId))
      .send({ nickname: 'Updated' }).expect(200);
    expect(children.list).toHaveBeenCalledWith('parent-A');
    expect(children.create).toHaveBeenCalledWith('parent-A', { age_months: 32, reference_date: '2026-01-01' }, expect.any(Object));
    expect(children.update).toHaveBeenCalledWith('parent-A', childId, { nickname: 'Updated' }, expect.any(Object));
    expect(sessions.requireActive).toHaveBeenCalledWith(handle, false);
    expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
    expect(sessions.authorizedMutation).toHaveBeenCalledWith(handle, expect.any(Function));
  });

  it('does not extend idle timeout on passive child list (dashboard load)', async () => {
    await headers(request(app.getHttpServer()).get('/v1/web/children')).expect(200);
    expect(sessions.requireActive).toHaveBeenCalledTimes(1);
    expect(sessions.requireActive).toHaveBeenCalledWith(handle, false);
    expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
  });

  it('rejects malformed UUID before service invocation', async () => {
    await headers(request(app.getHttpServer()).patch('/v1/web/children/not-a-uuid'))
      .send({ nickname: 'x' }).expect(404);
    expect(children.update).not.toHaveBeenCalled();
  });
  it('does not refresh idle clock when a foreign edit is rejected', async () => {
    children.update.mockRejectedValue(new (await import('@nestjs/common')).NotFoundException('Child profile not found'));
    await headers(request(app.getHttpServer()).patch('/v1/web/children/' + childId))
      .send({ nickname: 'Rejected' }).expect(404);
    expect(sessions.authorizedMutation).toHaveBeenCalledTimes(1);
    expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
  });

  it('does not refresh idle clock for invalid profile data', async () => {
    children.create.mockRejectedValue(new (await import('@nestjs/common')).BadRequestException('Invalid profile'));
    await headers(request(app.getHttpServer()).post('/v1/web/children'))
      .send({ age_months: -1, reference_date: '2026-11-01' }).expect(400);
    expect(sessions.authorizedMutation).toHaveBeenCalledTimes(1);
    expect(sessions.requireActive).not.toHaveBeenCalledWith(handle, true);
  });

});
