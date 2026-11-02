import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import { ParentGateGrantGuard } from '../auth/parent-gate-grant.guard';
import { ParentProfileService } from '../parent-profile.service';
import { SessionIssuerService } from '../session/session-issuer.service';

@Controller()
export class ParentController {
  constructor(private readonly sessions: SessionIssuerService, private readonly profiles: ParentProfileService) {}

  @Get('v1/parent/me')
  @UseGuards(ParentAuthGuard)
  async me(@Req() req: Request) {
    const auth = getParentAuth(req);
    const parent = await this.sessions.getActiveParent(auth.parentId);
    return {
      parent_id: parent.id,
      locale: parent.locale,
      timezone: parent.timezone,
      lifecycle: parent.lifecycle,
    };
  }
  @Get('v1/parent/profile')
  @UseGuards(ParentGateGrantGuard)
  profile(@Req() req: Request) {
    return this.profiles.get(getParentAuth(req).parentId);
  }

  @Patch('v1/parent/profile')
  @UseGuards(ParentGateGrantGuard)
  updateProfile(@Req() req: Request, @Body() body: unknown) {
    return this.profiles.update(getParentAuth(req).parentId, body);
  }

  @Delete('v1/parent/profile')
  @UseGuards(ParentGateGrantGuard)
  deleteProfile(@Req() req: Request) {
    return this.profiles.clear(getParentAuth(req).parentId);
  }

}
