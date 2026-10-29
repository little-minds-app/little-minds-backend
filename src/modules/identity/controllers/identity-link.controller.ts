import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import {
  LINKABLE_PROVIDERS,
  type LinkableProvider,
} from '../linking/account-linking.constants';
import { AccountLinkingService } from '../linking/account-linking.service';
import { StepUpService } from '../linking/step-up.service';
import { throwInvalidRequest } from '../session/auth.errors';

/**
 * LMP-36 — explicit provider linking (Blueprint §29.1).
 * Requires active Bearer session + server-issued step-up (recent auth of an
 * existing identity on this parent) + fresh target-provider proof.
 * No silent merge / email inference. Unlink & recovery deferred.
 */
@Controller()
export class IdentityLinkController {
  constructor(
    private readonly linking: AccountLinkingService,
    private readonly stepUp: StepUpService,
  ) {}

  /**
   * Issue a short-lived step-up token after proving control of an identity
   * already linked to the authenticated parent. Access-token refresh alone
   * does not satisfy this requirement.
   */
  @Post('v1/auth/identities/step-up')
  @HttpCode(200)
  @UseGuards(ParentAuthGuard)
  async issueStepUp(
    @Req() req: Request,
    @Body()
    body: {
      provider?: unknown;
      id_token?: unknown;
      nonce?: unknown;
      authorization_code?: unknown;
      code_verifier?: unknown;
      redirect_uri?: unknown;
      oauth_state?: unknown;
      challenge_id?: unknown;
      code?: unknown;
    },
  ) {
    if (
      typeof body?.provider !== 'string' ||
      !(LINKABLE_PROVIDERS as readonly string[]).includes(body.provider)
    ) {
      throwInvalidRequest('Invalid request');
    }
    const auth = getParentAuth(req);
    return this.stepUp.issueForIdentityLink(req, {
      parentId: auth.parentId,
      sessionId: auth.sessionId,
      provider: body.provider as LinkableProvider,
      idToken: typeof body.id_token === 'string' ? body.id_token : null,
      nonce: typeof body.nonce === 'string' ? body.nonce : null,
      authorizationCode:
        typeof body.authorization_code === 'string'
          ? body.authorization_code
          : null,
      codeVerifier:
        typeof body.code_verifier === 'string' ? body.code_verifier : null,
      redirectUri:
        typeof body.redirect_uri === 'string' ? body.redirect_uri : null,
      oauthState:
        typeof body.oauth_state === 'string' ? body.oauth_state : null,
      challengeId:
        typeof body.challenge_id === 'string' ? body.challenge_id : null,
      code: typeof body.code === 'string' ? body.code : null,
    });
  }

  @Post('v1/auth/identities/link')
  @HttpCode(200)
  @UseGuards(ParentAuthGuard)
  async link(
    @Req() req: Request,
    @Body()
    body: {
      step_up_token?: unknown;
      provider?: unknown;
      id_token?: unknown;
      nonce?: unknown;
      authorization_code?: unknown;
      code_verifier?: unknown;
      redirect_uri?: unknown;
      oauth_state?: unknown;
      challenge_id?: unknown;
      code?: unknown;
    },
  ) {
    if (
      typeof body?.provider !== 'string' ||
      !(LINKABLE_PROVIDERS as readonly string[]).includes(body.provider)
    ) {
      throwInvalidRequest('Invalid request');
    }
    if (typeof body?.step_up_token !== 'string') {
      throwInvalidRequest('Invalid request');
    }
    const auth = getParentAuth(req);
    return this.linking.link(req, {
      parentId: auth.parentId,
      sessionId: auth.sessionId,
      stepUpToken: body.step_up_token,
      provider: body.provider as LinkableProvider,
      idToken: typeof body.id_token === 'string' ? body.id_token : null,
      nonce: typeof body.nonce === 'string' ? body.nonce : null,
      authorizationCode:
        typeof body.authorization_code === 'string'
          ? body.authorization_code
          : null,
      codeVerifier:
        typeof body.code_verifier === 'string' ? body.code_verifier : null,
      redirectUri:
        typeof body.redirect_uri === 'string' ? body.redirect_uri : null,
      oauthState:
        typeof body.oauth_state === 'string' ? body.oauth_state : null,
      challengeId:
        typeof body.challenge_id === 'string' ? body.challenge_id : null,
      code: typeof body.code === 'string' ? body.code : null,
    });
  }
}
