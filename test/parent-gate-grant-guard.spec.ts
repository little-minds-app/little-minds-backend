import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ParentGateGrantGuard } from '../src/modules/identity/auth/parent-gate-grant.guard';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { ParentGatePinService } from '../src/modules/identity/parent-gate-pin.service';
import { PARENT_AUTH_REQUEST_KEY } from '../src/modules/identity/auth/parent-auth.context';

describe('LMP-42 parent gate grant boundary', () => {
  const parentId = '11111111-1111-4111-8111-111111111111';
  const sessionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const parentAuth = { canActivate: jest.fn() };
  const gate = { requireGrant: jest.fn() };
  const guard = new ParentGateGrantGuard(
    parentAuth as unknown as ParentAuthGuard,
    gate as unknown as ParentGatePinService,
  );
  const request = {
    headers: { 'x-parent-gate-token': 'test-opaque-token' },
    [PARENT_AUTH_REQUEST_KEY]: { parentId, sessionId, jti: 'test-jti' },
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.resetAllMocks();
    parentAuth.canActivate.mockResolvedValue(true);
    gate.requireGrant.mockResolvedValue(undefined);
  });

  it('requires validated session AND matching gate token', async () => {
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(parentAuth.canActivate).toHaveBeenCalledWith(context);
    expect(gate.requireGrant).toHaveBeenCalledWith(parentId, sessionId, 'test-opaque-token');
  });

  it('never checks gate token if parent session authentication failed', async () => {
    parentAuth.canActivate.mockRejectedValue(new ForbiddenException('Invalid parent session'));
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
    expect(gate.requireGrant).not.toHaveBeenCalled();
  });

  it('denies access on an invalid or revoked grant', async () => {
    gate.requireGrant.mockRejectedValue(new ForbiddenException('Parent gate locked'));
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
