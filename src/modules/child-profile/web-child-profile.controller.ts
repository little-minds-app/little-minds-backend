import { UnauthorizedException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type { AppEnv } from '../../config/env.validation';
import { WebParentSessionService } from '../identity/session/web-parent-session.service';
import { ChildProfileService } from './child-profile.service';

/** Opaque-session backend facade. Never accepts a browser JWT or client parentId. */
@Controller('v1/web/children')
export class WebChildProfileController {
  constructor(
    private readonly profiles: ChildProfileService,
    private readonly web: WebParentSessionService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private async parent(request: Request): Promise<string> {
    const secret = this.config.get('LM_WEB_BFF_SECRET', { infer: true });
    const provided = request.headers['x-lm-bff-secret'];
    if (!secret || secret.length < 32 || typeof provided !== 'string' ||
      !timingSafeEqual(createHash('sha256').update(secret).digest(), createHash('sha256').update(provided).digest())) {
      throw new UnauthorizedException('Untrusted web request');
    }
    const handle = request.headers['x-lm-web-session'];
    if (typeof handle !== 'string') throw new UnauthorizedException('Missing web session');
    const active = await this.web.requireActive(handle, false);
    return active.parent_id;
  }

  private trustedHandle(req: Request): string {
    const secret = this.config.get('LM_WEB_BFF_SECRET', { infer: true });
    const provided = req.headers['x-lm-bff-secret'];
    if (!secret || secret.length < 32 || typeof provided !== 'string' ||
        !timingSafeEqual(createHash('sha256').update(secret).digest(), createHash('sha256').update(provided).digest())) {
      throw new UnauthorizedException('Untrusted web request');
    }
    const handle = req.headers['x-lm-web-session'];
    if (typeof handle !== 'string') throw new UnauthorizedException('Missing web session');
    return handle;
  }

  private async successfulActivity(req: Request): Promise<void> {
    const handle = req.headers['x-lm-web-session'];
    if (typeof handle === 'string') await this.web.requireActive(handle, true);
  }

  @Get()
  async list(@Req() req: Request) {
    const result = await this.profiles.list(await this.parent(req));
    await this.successfulActivity(req);
    return result;
  }

  @Post()
  async create(@Req() req: Request, @Body() body: { age_months?: unknown; reference_date?: unknown; nickname?: unknown; timezone?: unknown }) {
    return this.web.authorizedMutation(this.trustedHandle(req),
      (parentId, tx) => this.profiles.create(parentId, body, tx));
  }

  @Patch(':childId')
  async update(@Req() req: Request, @Param('childId', new ParseUUIDPipe({ errorHttpStatusCode: 404 })) childId: string,
    @Body() body: Record<string, unknown>) {
    return this.web.authorizedMutation(this.trustedHandle(req),
      (parentId, tx) => this.profiles.update(parentId, childId, body, tx));
  }
}
