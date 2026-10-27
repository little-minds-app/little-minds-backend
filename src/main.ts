import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
