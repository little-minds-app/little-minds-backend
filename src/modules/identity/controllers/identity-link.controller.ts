import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../auth/parent-auth.guard';
import {
  LINKABLE_PROVIDERS,
  type LinkableProvider,
} from '../linking/account-linking.constants';
import { AccountLinkingService } from '../linking/account-linking.service';
import { throwInvalidRequest } from '../session/auth.errors';

/**
 * LMP-36 — explicit provider linking (Blueprint §29.1).
 * Requires active Bearer session + fresh provider proof (step-up).
 * No silent merge / email inference. Unlink & recovery deferred.
 */
@Controller()
export class IdentityLinkController {
  constructor(private readonly linking: AccountLinkingService) {}

  @Post('v1/auth/identities/link')
  @HttpCode(200)
  @UseGuards(ParentAuthGuard)
  async link(
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
    return this.linking.link(req, {
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
}
