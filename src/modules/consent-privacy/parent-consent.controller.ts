import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  getParentAuth,
  ParentAuthGuard,
} from '../identity/auth/parent-auth.guard';
import { ParentConsentService } from './parent-consent.service';

@Controller('v1/privacy/consent')
@UseGuards(ParentAuthGuard)
export class ParentConsentController {
  constructor(private readonly consent: ParentConsentService) {}

  @Get('effective')
  getEffective(
    @Req() req: Request,
    @Query('scope') scope: string | string[] | undefined,
    @Query('child_id') childIdRaw: unknown,
  ) {
    const parentId = getParentAuth(req).parentId;
    const scopes = this.consent.parseScopes(scope);
    const childId = this.consent.parseOptionalChildId(childIdRaw);
    return this.consent.getEffectiveScopes(parentId, scopes, childId);
  }

  @Post('grant')
  @HttpCode(HttpStatus.CREATED)
  grant(@Req() req: Request, @Body() body: unknown) {
    const parentId = getParentAuth(req).parentId;
    const parsed = this.consent.parseGrantOrWithdrawBody(body);
    return this.consent.grant(parentId, parsed);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  withdraw(@Req() req: Request, @Body() body: unknown) {
    const parentId = getParentAuth(req).parentId;
    const parsed = this.consent.parseGrantOrWithdrawBody(body);
    return this.consent.withdraw(parentId, parsed);
  }
}
