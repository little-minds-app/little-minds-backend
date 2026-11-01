import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get()
  list(@Req() req: Request) {
    return this.children.list(getParentAuth(req).parentId);
  }

  @Patch(':childId')
  update(
    @Req() req: Request,
    @Param('childId', new ParseUUIDPipe({ errorHttpStatusCode: 404 })) childId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.children.update(getParentAuth(req).parentId, childId, body);
  }

  @Get(':childId')
  get(@Req() req: Request, @Param('childId', new ParseUUIDPipe({ errorHttpStatusCode: 404 })) childId: string) {
    return this.children.get(getParentAuth(req).parentId, childId);
  }
}
