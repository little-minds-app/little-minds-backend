import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SessionKpiController } from './session-kpi.controller';
import { SessionKpiService } from './session-kpi.service';

@Module({
  imports: [IdentityModule],
  controllers: [SessionKpiController],
  providers: [SessionKpiService],
})
export class SessionKpiModule {}
