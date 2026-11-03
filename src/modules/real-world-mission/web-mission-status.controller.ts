import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppEnv } from '../../config/env.validation';
import { WebParentSessionService } from '../identity/session/web-parent-session.service';
import { resolvePassiveWebParentId } from '../identity/web/web-bff-auth';
import { MissionStatusService } from './mission-status.service';

@Controller('v1/web/children')
export class WebMissionStatusController {
  constructor(
    private readonly missions: MissionStatusService,
    private readonly web: WebParentSessionService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  @Get(':childId/missions')
  async list(
    @Req() req: Request,
    @Param('childId') childId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const parentId = await resolvePassiveWebParentId(this.config, this.web, req);
    return this.missions.listForChild(parentId, childId, {
      from,
      to,
      limit,
    });
  }
}
