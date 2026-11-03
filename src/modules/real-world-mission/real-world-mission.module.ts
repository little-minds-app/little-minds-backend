import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { MissionStatusController } from './mission-status.controller';
import { MissionStatusService } from './mission-status.service';

@Module({
  imports: [IdentityModule],
  controllers: [MissionStatusController],
  providers: [MissionStatusService],
  exports: [MissionStatusService],
})
export class RealWorldMissionModule {}
