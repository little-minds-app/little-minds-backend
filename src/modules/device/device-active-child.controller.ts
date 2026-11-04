import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  getParentAuth,
  ParentAuthGuard,
} from '../identity/auth/parent-auth.guard';
import { DeviceActiveChildService } from './device-active-child.service';

@Controller('v1/devices/:installationId/active-child')
@UseGuards(ParentAuthGuard)
export class DeviceActiveChildController {
  constructor(private readonly devices: DeviceActiveChildService) {}

  @Get()
  get(
    @Req() req: Request,
    @Param(
      'installationId',
      new ParseUUIDPipe({ errorHttpStatusCode: 400 }),
    )
    installationId: string,
  ) {
    return this.devices.get(getParentAuth(req).parentId, installationId);
  }

  @Put()
  set(
    @Req() req: Request,
    @Param(
      'installationId',
      new ParseUUIDPipe({ errorHttpStatusCode: 400 }),
    )
    installationId: string,
    @Body() body: unknown,
  ) {
    const payload = this.devices.parseSetRequest(body);
    return this.devices.set(
      getParentAuth(req).parentId,
      installationId,
      payload.child_id,
      payload.expected_binding_revision,
    );
  }
}
