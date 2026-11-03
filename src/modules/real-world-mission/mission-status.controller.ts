import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../identity/auth/parent-auth.guard';
import { ParentGateGrantGuard } from '../identity/auth/parent-gate-grant.guard';
import { MissionStatusService } from './mission-status.service';

@Controller('v1/children')
@UseGuards(ParentAuthGuard)
export class MissionStatusController {
  constructor(private readonly missions: MissionStatusService) {}

  @Get(':childId/missions')
  list(
    @Req() req: Request,
    @Param('childId') childId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.missions.listForChild(getParentAuth(req).parentId, childId, {
      from,
      to,
      limit,
    });
  }

  @Post(':childId/missions/:missionId/feedback')
  @HttpCode(200)
  @UseGuards(ParentGateGrantGuard)
  submit(
    @Req() req: Request,
    @Param('childId') childId: string,
    @Param('missionId') missionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.missions.submitFeedback(
      getParentAuth(req).parentId,
      childId,
      missionId,
      body,
    );
  }
}
