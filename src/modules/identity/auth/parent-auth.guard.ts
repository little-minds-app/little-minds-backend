import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ParentAccountLifecycle } from '@prisma/client';
import type { Request } from 'express';
import { JwtAccessService } from '../session/jwt-access.service';
import { SessionIssuerService } from '../session/session-issuer.service';
import { throwUnauthorized } from '../session/auth.errors';
import {
  PARENT_AUTH_REQUEST_KEY,
  type ParentAuthContext,
} from './parent-auth.context';

type AuthedRequest = Request & {
  [PARENT_AUTH_REQUEST_KEY]?: ParentAuthContext;
};

@Injectable()
export class ParentAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtAccessService,
    private readonly sessions: SessionIssuerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') {
      throwUnauthorized('invalid_token', 'Missing bearer token');
    }
    const match = /^Bearer\s+(\S+)$/i.exec(header);
    if (!match) {
      throwUnauthorized('invalid_token', 'Missing bearer token');
    }

    let claims;
    try {
      claims = await this.jwt.verifyAccessToken(match[1]);
    } catch {
      throwUnauthorized('invalid_token', 'Invalid access token');
    }

    // Immediate revoke: always load session row (ADR-019 §3.1).
    await this.sessions.requireActiveSession(claims.sid, claims.sub);
    const parent = await this.sessions.getActiveParent(claims.sub);
    if (parent.lifecycle !== ParentAccountLifecycle.active) {
      throwUnauthorized('invalid_token', 'Parent account is not active');
    }

    req[PARENT_AUTH_REQUEST_KEY] = {
      parentId: claims.sub,
      sessionId: claims.sid,
      jti: claims.jti,
    };
    return true;
  }
}

export function getParentAuth(req: Request): ParentAuthContext {
  const auth = (req as AuthedRequest)[PARENT_AUTH_REQUEST_KEY];
  if (!auth) {
    throwUnauthorized('invalid_token', 'Not authenticated');
  }
  return auth;
}
