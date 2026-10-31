import { Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { throwUnauthorized } from '../session/auth.errors';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import { WebParentSessionService } from '../session/web-parent-session.service';

@Controller('v1/auth/web')
export class WebSessionController {
  constructor(private readonly webSessions: WebParentSessionService) {}

  /** Called only by the Next.js BFF after it verifies OTP on the backend. */
  @Post('session')
  @HttpCode(201)
  @UseGuards(ParentAuthGuard)
  async create(@Req() request: Request) {
    // Require a separate BFF-to-backend secret, not merely a web bearer token.
    const expected = process.env.LM_WEB_BFF_SECRET;
    const supplied = request.headers['x-lm-bff-secret'];
    if (!expected || expected.length < 32 || typeof supplied !== 'string') {
      throwUnauthorized('invalid_token', 'Untrusted web session exchange');
    }
    const a = createHash('sha256').update(expected).digest();
    const b = createHash('sha256').update(supplied).digest();
    if (!timingSafeEqual(a, b)) throwUnauthorized('invalid_token', 'Untrusted web session exchange');
    const auth = getParentAuth(request);
    return this.webSessions.create(auth.parentId, auth.sessionId);
  }

  @Get('me')
  async me(@Req() request: Request) {
    return this.webSessions.requireActive(this.handle(request));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() request: Request): Promise<void> {
    await this.webSessions.logout(this.handle(request));
  }

  private handle(request: Request): string {
    const value = request.headers['x-lm-web-session'];
    if (typeof value !== 'string') throwUnauthorized('invalid_token', 'Invalid web session');
    return value;
  }
}
