import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../config/env.validation';
import { AuthController } from './controllers/auth.controller';
import { DevAuthController } from './controllers/dev-auth.controller';
import { ParentController } from './controllers/parent.controller';
import { PhoneAuthController } from './controllers/phone-auth.controller';
import { ParentAuthGuard } from './auth/parent-auth.guard';
import { OtpAbuseService } from './otp/otp-abuse.service';
import { PhoneOtpService } from './otp/phone-otp.service';
import { AuthRateLimitService } from './session/auth-rate-limit.service';
import { JwtAccessService } from './session/jwt-access.service';
import { SessionIssuerService } from './session/session-issuer.service';
import { DisabledProductionSmsSender } from './sms/disabled-production-sms.sender';
import { FakeSmsSender } from './sms/fake-sms.sender';
import { SMS_SENDER } from './sms/sms-sender';

/**
 * IdentityModule — parent sessions (LMP-33 / ADR-019) + GSM OTP (LMP-34 / ADR-020).
 */
@Module({
  controllers: [
    AuthController,
    ParentController,
    DevAuthController,
    PhoneAuthController,
  ],
  providers: [
    JwtAccessService,
    SessionIssuerService,
    AuthRateLimitService,
    ParentAuthGuard,
    OtpAbuseService,
    PhoneOtpService,
    FakeSmsSender,
    DisabledProductionSmsSender,
    {
      provide: SMS_SENDER,
      inject: [ConfigService, FakeSmsSender, DisabledProductionSmsSender],
      useFactory: (
        config: ConfigService<AppEnv, true>,
        fake: FakeSmsSender,
        disabled: DisabledProductionSmsSender,
      ) => {
        const sender = config.get('SMS_SENDER', { infer: true });
        const appEnv = config.get('APP_ENV', { infer: true });
        if (sender === 'fake') {
          if (appEnv === 'staging' || appEnv === 'production') {
            throw new Error(
              `SMS_SENDER=fake is forbidden when APP_ENV=${appEnv}`,
            );
          }
          fake.assertAllowedEnvironment();
          return fake;
        }
        // production adapter selected but vendor unapproved → fail-closed disabled sender
        return disabled;
      },
    },
  ],
  exports: [SessionIssuerService, JwtAccessService, ParentAuthGuard],
})
export class IdentityModule {}
