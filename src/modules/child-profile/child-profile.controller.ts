import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../identity/auth/parent-auth.guard';
import { ChildProfileService } from './child-profile.service';

@Controller('v1/children')
@UseGuards(ParentAuthGuard)
export class ChildProfileController {
  constructor(private readonly children: ChildProfileService) {}

  @Post()
  create(@Req() req: Request, @Body() body: { age_months?: unknown; reference_date?: unknown; nickname?: unknown; timezone?: unknown }) {
    return this.children.create(getParentAuth(req).parentId, body);
  }

  @Get(':childId')
  get(@Req() req: Request, @Param('childId') childId: string) {
    return this.children.get(getParentAuth(req).parentId, childId);
  }
}
