import { Controller, Get, Query, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppEnv } from '../../config/env.validation';
import { WebParentSessionService } from '../identity/session/web-parent-session.service';
import { resolvePassiveWebParentId } from '../identity/web/web-bff-auth';
import { SessionKpiService } from './session-kpi.service';

@Controller('v1/web/insights')
export class WebSessionKpiController {
  constructor(
    private readonly sessionKpis: SessionKpiService,
    private readonly web: WebParentSessionService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  @Get('session-kpis')
  async get(
    @Req() req: Request,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('timezone') timezone: string,
    @Query('child_id') childId?: string,
  ) {
    const parentId = await resolvePassiveWebParentId(this.config, this.web, req);
    return this.sessionKpis.aggregate(parentId, {
      from,
      to,
      timezone,
      childId,
    });
  }
}
