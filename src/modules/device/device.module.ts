import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { DeviceActiveChildController } from './device-active-child.controller';
import { DeviceActiveChildService } from './device-active-child.service';

@Module({
  imports: [IdentityModule],
  controllers: [DeviceActiveChildController],
  providers: [DeviceActiveChildService],
  exports: [DeviceActiveChildService],
})
export class DeviceModule {}
