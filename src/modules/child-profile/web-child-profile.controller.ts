import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppEnv } from '../../config/env.validation';
import { WebParentSessionService } from '../identity/session/web-parent-session.service';
import { readTrustedWebSessionHandle, resolvePassiveWebParentId } from '../identity/web/web-bff-auth';
import { ChildProfileService } from './child-profile.service';

/** Opaque-session backend facade. Never accepts a browser JWT or client parentId. */
@Controller('v1/web/children')
export class WebChildProfileController {
  constructor(
    private readonly profiles: ChildProfileService,
    private readonly web: WebParentSessionService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private parent(request: Request): Promise<string> {
    return resolvePassiveWebParentId(this.config, this.web, request);
  }

  private trustedHandle(req: Request): string {
    return readTrustedWebSessionHandle(this.config, req);
  }

  /** Passive child-list read; explicit activity endpoint handles real user interaction. */
  @Get()
  async list(@Req() req: Request) {
    return this.profiles.list(await this.parent(req));
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
