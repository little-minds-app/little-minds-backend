import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { isUuidV4OrV7 } from '../otp/otp-uuid';
import { EmailOtpService } from '../otp/email-otp.service';
import { AppleIdentityService } from '../providers/apple-identity.service';
import { GoogleIdentityService } from '../providers/google-identity.service';
import { OidcNonceService } from '../providers/oidc-nonce.service';
import {
  throwInvalidRequest,
  throwOtpInvalid,
} from '../session/auth.errors';

@Controller()
export class MultiProviderAuthController {
  constructor(
    private readonly apple: AppleIdentityService,
    private readonly google: GoogleIdentityService,
    private readonly emailOtp: EmailOtpService,
    private readonly nonces: OidcNonceService,
  ) {}

  @Post('v1/auth/oidc/nonce')
  @HttpCode(200)
  async issueNonce(
    @Req() req: Request,
    @Body()
    body: {
      provider?: unknown;
    },
  ) {
    const providerRaw =
      typeof body?.provider === 'string' ? body.provider : 'shared';
    const provider =
      providerRaw === 'apple' || providerRaw === 'google'
        ? providerRaw
        : 'shared';
    return this.nonces.issue(req, provider);
  }

  @Post('v1/auth/apple')
  @HttpCode(200)
  async appleAuth(
    @Req() req: Request,
    @Body()
    body: {
      id_token?: unknown;
      nonce?: unknown;
      notice_version?: unknown;
      notice_locale?: unknown;
      client_surface?: unknown;
      device_id?: unknown;
    },
  ) {
    if (
      typeof body?.id_token !== 'string' ||
      typeof body?.nonce !== 'string' ||
      typeof body?.notice_version !== 'string' ||
      typeof body?.notice_locale !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    const ua =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent'].slice(0, 128)
        : null;
    return this.apple.authenticate(req, {
      idToken: body.id_token,
      nonce: body.nonce,
      noticeVersion: body.notice_version,
      noticeLocale: body.notice_locale,
      clientSurface:
        typeof body.client_surface === 'string' ? body.client_surface : null,
      deviceId: typeof body.device_id === 'string' ? body.device_id : null,
      userAgentSummary: ua,
    });
  }

  @Post('v1/auth/google')
  @HttpCode(200)
  async googleAuth(
    @Req() req: Request,
    @Body()
    body: {
      id_token?: unknown;
      nonce?: unknown;
      authorization_code?: unknown;
      code_verifier?: unknown;
      redirect_uri?: unknown;
      notice_version?: unknown;
      notice_locale?: unknown;
      client_surface?: unknown;
      device_id?: unknown;
    },
  ) {
    if (
      typeof body?.notice_version !== 'string' ||
      typeof body?.notice_locale !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    const ua =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent'].slice(0, 128)
        : null;
    return this.google.authenticate(req, {
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
      noticeVersion: body.notice_version,
      noticeLocale: body.notice_locale,
      clientSurface:
        typeof body.client_surface === 'string' ? body.client_surface : null,
      deviceId: typeof body.device_id === 'string' ? body.device_id : null,
      userAgentSummary: ua,
    });
  }

  @Post('v1/auth/email/start')
  @HttpCode(200)
  async emailStart(
    @Req() req: Request,
    @Body()
    body: {
      email?: unknown;
      notice_version?: unknown;
      notice_locale?: unknown;
      client_surface?: unknown;
    },
  ) {
    if (
      typeof body?.email !== 'string' ||
      typeof body?.notice_version !== 'string' ||
      typeof body?.notice_locale !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    return this.emailOtp.start(req, {
      email: body.email,
      noticeVersion: body.notice_version,
      noticeLocale: body.notice_locale,
      clientSurface:
        typeof body.client_surface === 'string' ? body.client_surface : null,
    });
  }

  @Post('v1/auth/email/verify')
  @HttpCode(200)
  async emailVerify(
    @Req() req: Request,
    @Body()
    body: {
      challenge_id?: unknown;
      code?: unknown;
      client_surface?: unknown;
      device_id?: unknown;
    },
  ) {
    if (
      typeof body?.challenge_id !== 'string' ||
      typeof body?.code !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    if (!isUuidV4OrV7(body.challenge_id)) {
      throwOtpInvalid();
    }
    const ua =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent'].slice(0, 128)
        : null;
    return this.emailOtp.verify(req, {
      challengeId: body.challenge_id,
      code: body.code,
      clientSurface:
        typeof body.client_surface === 'string' ? body.client_surface : null,
      deviceId: typeof body.device_id === 'string' ? body.device_id : null,
      userAgentSummary: ua,
    });
  }
}
