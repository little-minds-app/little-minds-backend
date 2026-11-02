import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from './parent-auth.guard';
import { ParentGatePinService } from '../parent-gate-pin.service';

/**
 * Add this guard to adult-sensitive API handlers, in addition to the parent
 * session guard. The bearer token alone must never unlock adult actions.
 */
@Injectable()
export class ParentGateGrantGuard implements CanActivate {
  constructor(
    private readonly parentAuth: ParentAuthGuard,
    private readonly gate: ParentGatePinService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.parentAuth.canActivate(context);
    const request = context.switchToHttp().getRequest<Request>();
    const { parentId, sessionId } = getParentAuth(request);
    await this.gate.requireGrant(
      parentId,
      sessionId,
      request.headers['x-parent-gate-token'],
    );
    return true;
  }
}
