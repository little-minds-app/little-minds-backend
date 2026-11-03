import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SessionKpiController } from './session-kpi.controller';
import { WebSessionKpiController } from './web-session-kpi.controller';
import { SessionKpiService } from './session-kpi.service';

@Module({
  imports: [IdentityModule],
  controllers: [SessionKpiController, WebSessionKpiController],
  providers: [SessionKpiService],
})
export class SessionKpiModule {}
