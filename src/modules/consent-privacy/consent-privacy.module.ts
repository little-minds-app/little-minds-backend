import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ParentConsentController } from './parent-consent.controller';
import { ParentConsentService } from './parent-consent.service';

@Module({
  imports: [IdentityModule],
  controllers: [ParentConsentController],
  providers: [ParentConsentService],
  exports: [ParentConsentService],
})
export class ConsentPrivacyModule {}
