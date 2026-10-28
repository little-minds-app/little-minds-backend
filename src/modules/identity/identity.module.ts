import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../config/env.validation';
import { AuthController } from './controllers/auth.controller';
import { DevAuthController } from './controllers/dev-auth.controller';
import { MultiProviderAuthController } from './controllers/multi-provider-auth.controller';
import { ParentController } from './controllers/parent.controller';
import { PhoneAuthController } from './controllers/phone-auth.controller';
import { ParentAuthGuard } from './auth/parent-auth.guard';
import { DisabledProductionMailSender } from './mail/disabled-production-mail.sender';
import { FakeMailSender } from './mail/fake-mail.sender';
import { MAIL_SENDER } from './mail/mail-sender';
import { EmailOtpService } from './otp/email-otp.service';
import { OtpAbuseService } from './otp/otp-abuse.service';
import { OtpRetentionService } from './otp/otp-retention.service';
import { PhoneOtpService } from './otp/phone-otp.service';
import { AppleIdentityService } from './providers/apple-identity.service';
import { GoogleIdentityService } from './providers/google-identity.service';
import {
  GOOGLE_TOKEN_EXCHANGER,
  HttpGoogleTokenExchanger,
} from './providers/google-token-exchanger';
import { OidcNonceService } from './providers/oidc-nonce.service';
import { IdentityResolveService } from './resolve/identity-resolve.service';
import { AuthRateLimitService } from './session/auth-rate-limit.service';
import { JwtAccessService } from './session/jwt-access.service';
import { SessionIssuerService } from './session/session-issuer.service';
import { DisabledProductionSmsSender } from './sms/disabled-production-sms.sender';
import { FakeSmsSender } from './sms/fake-sms.sender';
import { SMS_SENDER } from './sms/sms-sender';

/**
 * IdentityModule — parent sessions (LMP-33) + GSM OTP (LMP-34) +
 * Apple / Google / Email OTP (LMP-35 / ADR-021).
 */
@Module({
  controllers: [
    AuthController,
    ParentController,
    DevAuthController,
    PhoneAuthController,
    MultiProviderAuthController,
  ],
  providers: [
    JwtAccessService,
    SessionIssuerService,
    AuthRateLimitService,
    ParentAuthGuard,
    OtpAbuseService,
    OtpRetentionService,
    PhoneOtpService,
    EmailOtpService,
    IdentityResolveService,
    OidcNonceService,
    AppleIdentityService,
    GoogleIdentityService,
    HttpGoogleTokenExchanger,
    {
      provide: GOOGLE_TOKEN_EXCHANGER,
      useExisting: HttpGoogleTokenExchanger,
    },
    FakeSmsSender,
    DisabledProductionSmsSender,
    FakeMailSender,
    DisabledProductionMailSender,
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
        return disabled;
      },
    },
    {
      provide: MAIL_SENDER,
      inject: [ConfigService, FakeMailSender, DisabledProductionMailSender],
      useFactory: (
        config: ConfigService<AppEnv, true>,
        fake: FakeMailSender,
        disabled: DisabledProductionMailSender,
      ) => {
        const sender = config.get('MAIL_SENDER', { infer: true });
        const appEnv = config.get('APP_ENV', { infer: true });
        if (sender === 'fake') {
          if (appEnv === 'staging' || appEnv === 'production') {
            throw new Error(
              `MAIL_SENDER=fake is forbidden when APP_ENV=${appEnv}`,
            );
          }
          fake.assertAllowedEnvironment();
          return fake;
        }
        return disabled;
      },
    },
  ],
  exports: [SessionIssuerService, JwtAccessService, ParentAuthGuard],
})
export class IdentityModule {}
