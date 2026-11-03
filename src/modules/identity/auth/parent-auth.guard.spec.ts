import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ParentAccountLifecycle } from '@prisma/client';
import { PARENT_AUTH_REQUEST_KEY } from './parent-auth.context';
import { ParentAuthGuard, getParentAuth } from './parent-auth.guard';
import type { JwtAccessService } from '../session/jwt-access.service';
import type { SessionIssuerService } from '../session/session-issuer.service';

describe('ParentAuthGuard (LMP-132 regression)', () => {
  const parentId = '11111111-1111-4111-8111-111111111111';
  const sessionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const jti = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  const jwt = { verifyAccessToken: jest.fn() };
  const sessions = {
    requireActiveSession: jest.fn(),
    getActiveParent: jest.fn(),
  };
  const guard = new ParentAuthGuard(
    jwt as unknown as JwtAccessService,
    sessions as unknown as SessionIssuerService,
  );

  function context(authHeader?: string) {
    const request: Record<string, unknown> = { headers: {} };
    if (authHeader !== undefined) {
      (request.headers as Record<string, string>).authorization = authHeader;
    }
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      request,
    } as unknown as ExecutionContext & { request: Record<string, unknown> };
  }

  beforeEach(() => {
    jest.resetAllMocks();
    jwt.verifyAccessToken.mockResolvedValue({ sub: parentId, sid: sessionId, jti });
    sessions.requireActiveSession.mockResolvedValue(undefined);
    sessions.getActiveParent.mockResolvedValue({
      id: parentId,
      lifecycle: ParentAccountLifecycle.active,
    });
  });

  it('rejects missing Authorization header', async () => {
    const ctx = context();
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('rejects malformed bearer scheme', async () => {
    const ctx = context('Token abc');
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('rejects invalid JWT before session lookup', async () => {
    jwt.verifyAccessToken.mockRejectedValue(new Error('bad sig'));
    const ctx = context('Bearer bad.jwt.token');
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessions.requireActiveSession).not.toHaveBeenCalled();
  });

  it('requires active session row after JWT verify (immediate revoke)', async () => {
    sessions.requireActiveSession.mockRejectedValue(new UnauthorizedException('revoked'));
    const ctx = context('Bearer valid.jwt');
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessions.requireActiveSession).toHaveBeenCalledWith(sessionId, parentId);
    expect(sessions.getActiveParent).not.toHaveBeenCalled();
  });

  it('rejects non-active parent lifecycle', async () => {
    sessions.getActiveParent.mockResolvedValue({
      id: parentId,
      lifecycle: ParentAccountLifecycle.deleted,
    });
    const ctx = context('Bearer valid.jwt');
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches parent auth context on success', async () => {
    const ctx = context('Bearer valid.jwt');
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(ctx.request[PARENT_AUTH_REQUEST_KEY]).toEqual({
      parentId,
      sessionId,
      jti,
    });
    expect(getParentAuth(ctx.request as never)).toEqual({
      parentId,
      sessionId,
      jti,
    });
  });

  it('getParentAuth fails when guard did not run', () => {
    expect(() => getParentAuth({ headers: {} } as never)).toThrow(UnauthorizedException);
  });
});
