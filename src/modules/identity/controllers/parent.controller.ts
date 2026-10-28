import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import { SessionIssuerService } from '../session/session-issuer.service';

@Controller()
export class ParentController {
  constructor(private readonly sessions: SessionIssuerService) {}

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
}
