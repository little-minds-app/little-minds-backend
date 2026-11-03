import { ActivityIngestionModule } from './modules/activity-ingestion/activity-ingestion.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { ChildProfileModule } from './modules/child-profile/child-profile.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    ObservabilityModule,
    PrismaModule,
    HealthModule,
    ChildProfileModule,
    ActivityIngestionModule,
    IdentityModule,
  ],
})
export class AppModule {}
