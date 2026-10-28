import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppEnv } from './config/env.validation';
import { toPublicConfig } from './config/public-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  const port = config.get('PORT', { infer: true });
  const listenHost = config.get('LISTEN_HOST', { infer: true });
  const publicConfig = toPublicConfig({
    APP_ENV: config.get('APP_ENV', { infer: true }),
    NODE_ENV: config.get('NODE_ENV', { infer: true }),
    PORT: port,
    PUBLIC_API_BASE_URL: config.get('PUBLIC_API_BASE_URL', { infer: true }),
    RELEASE: config.get('RELEASE', { infer: true }),
    DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
    REFRESH_TOKEN_PEPPER: config.get('REFRESH_TOKEN_PEPPER', { infer: true }),
    AUTH_DEV_BOOTSTRAP_ENABLED: config.get('AUTH_DEV_BOOTSTRAP_ENABLED', {
      infer: true,
    }),
    LISTEN_HOST: listenHost,
    SMS_SENDER: config.get('SMS_SENDER', { infer: true }),
    OTP_PEPPER: config.get('OTP_PEPPER', { infer: true }),
    PHONE_SUBJECT_PEPPER: config.get('PHONE_SUBJECT_PEPPER', { infer: true }),
    MAIL_SENDER: config.get('MAIL_SENDER', { infer: true }),
    EMAIL_SUBJECT_PEPPER: config.get('EMAIL_SUBJECT_PEPPER', { infer: true }),
    APPLE_CLIENT_IDS: config.get('APPLE_CLIENT_IDS', { infer: true }),
    GOOGLE_CLIENT_IDS: config.get('GOOGLE_CLIENT_IDS', { infer: true }),
    GOOGLE_ISSUERS: config.get('GOOGLE_ISSUERS', { infer: true }),
    GOOGLE_REDIRECT_URIS: config.get('GOOGLE_REDIRECT_URIS', { infer: true }),
    GOOGLE_PKCE_ENABLED: config.get('GOOGLE_PKCE_ENABLED', { infer: true }),
  });

  const logger = new Logger('Bootstrap');
  // Public keys only — never log DATABASE_URL or other secrets.
  logger.log(`Starting with public config: ${JSON.stringify(publicConfig)}`);

  await app.listen(port, listenHost);
}

void bootstrap();
