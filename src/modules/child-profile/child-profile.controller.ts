import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../identity/auth/parent-auth.guard';
import { ParentGateGrantGuard } from '../identity/auth/parent-gate-grant.guard';
import { ChildProfileService } from './child-profile.service';

@Controller('v1/children')
@UseGuards(ParentAuthGuard)
export class ChildProfileController {
  constructor(private readonly children: ChildProfileService) {}

  // Kids Mode needs this deliberately minimal projection for profile selection.
  // No contact data, parent profile, reports or adult settings are returned.
  // Authenticated parent session required; mutations require Parent Gate.
  @Get()
  list(@Req() req: Request) {
    return this.children.list(getParentAuth(req).parentId);
  }

  @Patch(':childId')
  @UseGuards(ParentGateGrantGuard)
  update(@Req() req: Request, @Param('childId', new ParseUUIDPipe({ errorHttpStatusCode: 404 })) childId: string,
    @Body() body: Record<string, unknown>) {
    return this.children.update(getParentAuth(req).parentId, childId, body);
  }

  @Post()
  @UseGuards(ParentGateGrantGuard)
  create(@Req() req: Request, @Body() body: { age_months?: unknown; reference_date?: unknown; nickname?: unknown; timezone?: unknown }) {
    return this.children.create(getParentAuth(req).parentId, body);
  }

  // Same minimal kids-safe projection as list(); never a full child record.
  @Get(':childId')
  get(@Req() req: Request, @Param('childId', new ParseUUIDPipe({ errorHttpStatusCode: 404 })) childId: string) {
    return this.children.get(getParentAuth(req).parentId, childId);
  }
}
