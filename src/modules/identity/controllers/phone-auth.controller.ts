import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { throwInvalidRequest } from '../session/auth.errors';
import { PhoneOtpService } from '../otp/phone-otp.service';

@Controller()
export class PhoneAuthController {
  constructor(private readonly phoneOtp: PhoneOtpService) {}

  @Post('v1/auth/phone/start')
  @HttpCode(200)
  async start(
    @Req() req: Request,
    @Body()
    body: {
      phone?: unknown;
      country_code?: unknown;
      notice_version?: unknown;
      notice_locale?: unknown;
      client_surface?: unknown;
      device_id?: unknown;
    },
  ) {
    if (typeof body?.phone !== 'string' || body.phone.length < 5) {
      throwInvalidRequest('Invalid request');
    }
    if (
      typeof body?.notice_version !== 'string' ||
      typeof body?.notice_locale !== 'string'
    ) {
      throwInvalidRequest('Invalid request');
    }
    return this.phoneOtp.start(req, {
      phone: body.phone,
      countryCode:
        typeof body.country_code === 'string' ? body.country_code : null,
      noticeVersion: body.notice_version,
      noticeLocale: body.notice_locale,
      clientSurface:
        typeof body.client_surface === 'string' ? body.client_surface : null,
      deviceId: typeof body.device_id === 'string' ? body.device_id : null,
    });
  }

  @Post('v1/auth/phone/verify')
  @HttpCode(200)
  async verify(
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
    const ua =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent'].slice(0, 128)
        : null;
    return this.phoneOtp.verify(req, {
      challengeId: body.challenge_id,
      code: body.code,
      clientSurface:
        typeof body.client_surface === 'string' ? body.client_surface : null,
      deviceId: typeof body.device_id === 'string' ? body.device_id : null,
      userAgentSummary: ua,
    });
  }
}
