import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ChildProfileController } from './child-profile.controller';
import { ChildProfileService } from './child-profile.service';

@Module({
  imports: [IdentityModule],
  controllers: [ChildProfileController],
  providers: [ChildProfileService],
})
export class ChildProfileModule {}
