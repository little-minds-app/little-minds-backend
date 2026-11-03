import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../identity/auth/parent-auth.guard';
import { SessionKpiService } from './session-kpi.service';

@Controller('v1/insights')
@UseGuards(ParentAuthGuard)
export class SessionKpiController {
  constructor(private readonly sessionKpis: SessionKpiService) {}

  @Get('session-kpis')
  get(
    @Req() req: Request,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('timezone') timezone: string,
    @Query('child_id') childId?: string,
  ) {
    return this.sessionKpis.aggregate(getParentAuth(req).parentId, {
      from,
      to,
      timezone,
      childId,
    });
  }
}
