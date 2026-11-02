import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import { ParentGatePinService } from '../parent-gate-pin.service';

/** Session auth is mandatory; parentId/sessionId always come from verified JWT. */
@Controller('v1/parent/gate')
@UseGuards(ParentAuthGuard)
export class ParentGateController {
  constructor(private readonly pin: ParentGatePinService) {}

  @Get('status')
  status(@Req() req: Request) {
    return this.pin.configuration(getParentAuth(req).parentId);
  }

  @Post('verify')
  verify(@Req() req: Request, @Body() body: unknown) {
    const { parentId, sessionId } = getParentAuth(req);
    const pin = body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).pin : undefined;
    return this.pin.verifyAndIssue(parentId, sessionId, pin);
  }

  /** Explicit lock when returning to Kids Mode; grants are not persisted client-side. */
  @Delete('grant')
  async lock(@Req() req: Request) {
    const { parentId, sessionId } = getParentAuth(req);
    await this.pin.revokeGrant(parentId, sessionId, req.headers['x-parent-gate-token']);
    return { locked: true };
  }

  /** A proof check for future sensitive endpoints; not itself a security gate. */
  @Get('grant')
  async check(@Req() req: Request) {
    const { parentId, sessionId } = getParentAuth(req);
    await this.pin.requireGrant(parentId, sessionId, req.headers['x-parent-gate-token']);
    return { authorized: true };
  }
}
