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
  });

  const logger = new Logger('Bootstrap');
  // Public keys only — never log DATABASE_URL or other secrets.
  logger.log(`Starting with public config: ${JSON.stringify(publicConfig)}`);

  await app.listen(port, listenHost);
}

void bootstrap();
