import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ActivityBatchAdmissionService } from './activity-batch-admission.service';
import { ActivityIngestionController } from './activity-ingestion.controller';
import { ActivityIngestionService } from './activity-ingestion.service';

@Module({
  imports: [IdentityModule],
  controllers: [ActivityIngestionController],
  providers: [ActivityBatchAdmissionService, ActivityIngestionService],
})
export class ActivityIngestionModule {}
