import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import { ParentGatePinService } from '../parent-gate-pin.service';
import { StepUpService } from '../linking/step-up.service';
import { LINKABLE_PROVIDERS, type LinkableProvider } from '../linking/account-linking.constants';
import { BadRequestException } from '@nestjs/common';

/** Session auth is mandatory; parentId/sessionId always come from verified JWT. */
@Controller('v1/parent/gate')
@UseGuards(ParentAuthGuard)
export class ParentGateController {
  constructor(private readonly pin: ParentGatePinService, private readonly stepUp: StepUpService) {}

  @Get('status')
  status(@Req() req: Request) {
    return this.pin.configuration(getParentAuth(req).parentId);
  }

  /** Fresh OTP/provider proof, never an access token refresh. */
  @Post('proof')
  proof(@Req() req: Request, @Body() body: Record<string, unknown>) {
    if (!body || typeof body.provider !== 'string' ||
      !(LINKABLE_PROVIDERS as readonly string[]).includes(body.provider)) {
      throw new BadRequestException('Invalid identity proof');
    }
    const { parentId, sessionId } = getParentAuth(req);
    return this.stepUp.issueForParentGate(req, {
      parentId, sessionId,
      provider: body.provider as LinkableProvider,
      challengeId: typeof body.challenge_id === 'string' ? body.challenge_id : null,
      code: typeof body.code === 'string' ? body.code : null,
      idToken: typeof body.id_token === 'string' ? body.id_token : null,
      nonce: typeof body.nonce === 'string' ? body.nonce : null,
      authorizationCode: typeof body.authorization_code === 'string' ? body.authorization_code : null,
      codeVerifier: typeof body.code_verifier === 'string' ? body.code_verifier : null,
      redirectUri: typeof body.redirect_uri === 'string' ? body.redirect_uri : null,
      oauthState: typeof body.oauth_state === 'string' ? body.oauth_state : null,
    });
  }

  @Post('setup')
  setup(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const { parentId, sessionId } = getParentAuth(req);
    return this.pin.setWithProof(parentId, sessionId, body?.step_up_token as string,
      body?.pin, body?.confirmation, false);
  }

  @Post('reset')
  reset(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const { parentId, sessionId } = getParentAuth(req);
    return this.pin.setWithProof(parentId, sessionId, body?.step_up_token as string,
      body?.pin, body?.confirmation, true);
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
