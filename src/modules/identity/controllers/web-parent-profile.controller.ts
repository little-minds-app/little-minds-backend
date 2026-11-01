import { Body, Controller, Delete, Get, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import { ParentProfileService } from '../parent-profile.service';
import { WebParentSessionService } from '../session/web-parent-session.service';

@Controller('v1/auth/web/profile')
export class WebParentProfileController {
  constructor(
    private readonly profiles: ParentProfileService,
    private readonly web: WebParentSessionService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private trustedHandle(req: Request): string {
    const secret = this.config.get('LM_WEB_BFF_SECRET', { infer: true });
    const provided = req.headers['x-lm-bff-secret'];
    if (!secret || secret.length < 32 || typeof provided !== 'string' ||
      !timingSafeEqual(createHash('sha256').update(secret).digest(), createHash('sha256').update(provided).digest())) {
      throw new UnauthorizedException('Untrusted BFF');
    }
    const handle = req.headers['x-lm-web-session'];
    if (typeof handle !== 'string') throw new UnauthorizedException('Missing web session');
    return handle;
  }

  @Get()
  async get(@Req() req: Request) {
    // Passive read must not extend the meaningful-activity clock.
    const active = await this.web.requireActive(this.trustedHandle(req), false);
    return this.profiles.get(active.parent_id);
  }

  @Patch()
  update(@Req() req: Request, @Body() body: unknown) {
    return this.web.authorizedMutation(this.trustedHandle(req),
      (parentId, tx) => this.profiles.update(parentId, body, tx));
  }

  @Delete()
  clear(@Req() req: Request) {
    return this.web.authorizedMutation(this.trustedHandle(req),
      (parentId, tx) => this.profiles.clear(parentId, tx));
  }
}
