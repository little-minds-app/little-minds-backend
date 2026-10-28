import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthRateLimitService } from '../session/auth-rate-limit.service';
import { JwtAccessService } from '../session/jwt-access.service';
import { SessionIssuerService } from '../session/session-issuer.service';
import {
  throwInvalidRequest,
  throwNotFound,
} from '../session/auth.errors';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import { clientIp } from '../auth/client-ip';

@Controller()
export class AuthController {
  constructor(
    private readonly sessions: SessionIssuerService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly jwt: JwtAccessService,
  ) {}

  @Post('v1/auth/token/refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Body() body: { refresh_token?: unknown },
  ) {
    const token = body?.refresh_token;
    if (typeof token !== 'string' || token.length < 16) {
      throwInvalidRequest('refresh_token is required');
    }
    const ip = clientIp(req);
    this.rateLimit.consumeRefreshIp(ip);
    this.rateLimit.consumeRefreshSession(`rt:${token.slice(0, 24)}`);
    return this.sessions.refresh(token);
  }

  @Post('v1/auth/logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Body() body: { refresh_token?: unknown },
  ): Promise<void> {
    const refresh =
      typeof body?.refresh_token === 'string' && body.refresh_token.length >= 16
        ? body.refresh_token
        : undefined;

    let sessionId: string | undefined;
    let parentId: string | undefined;
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string') {
      const match = /^Bearer\s+(\S+)$/i.exec(authHeader);
      if (match) {
        try {
          const claims = await this.jwt.verifyAccessToken(match[1]);
          sessionId = claims.sid;
          parentId = claims.sub;
        } catch {
          // Invalid bearer alone is ok if refresh is present; otherwise still logout no-op path
        }
      }
    }

    if (!refresh && !(sessionId && parentId)) {
      throwInvalidRequest('refresh_token or Authorization bearer required');
    }

    await this.sessions.logout({
      refreshToken: refresh,
      sessionId,
      parentId,
    });
  }

  @Post('v1/auth/logout-all')
  @HttpCode(200)
  @UseGuards(ParentAuthGuard)
  async logoutAll(@Req() req: Request) {
    const auth = getParentAuth(req);
    const count = await this.sessions.logoutAll(auth.parentId);
    return { revoked_session_count: count };
  }

  @Get('v1/auth/sessions')
  @UseGuards(ParentAuthGuard)
  async listSessions(@Req() req: Request) {
    const auth = getParentAuth(req);
    const sessions = await this.sessions.listSessions(auth.parentId);
    return { sessions };
  }

  @Delete('v1/auth/sessions/:sessionId')
  @HttpCode(204)
  @UseGuards(ParentAuthGuard)
  async revokeSession(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    const auth = getParentAuth(req);
    if (!sessionId || sessionId.length < 32) {
      throwNotFound();
    }
    const result = await this.sessions.revokeOwnedSession(
      auth.parentId,
      sessionId,
    );
    if (result === 'missing') {
      throwNotFound();
    }
  }
}
