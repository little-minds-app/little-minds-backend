import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getParentAuth, ParentAuthGuard } from '../identity/auth/parent-auth.guard';
import { ActivityIngestionService } from './activity-ingestion.service';

@Controller('v1/events')
@UseGuards(ParentAuthGuard)
export class ActivityIngestionController {
  constructor(private readonly ingestion: ActivityIngestionService) {}

  @Post('batch')
  ingest(@Req() req: Request, @Body() body: unknown) {
    return this.ingestion.ingest(getParentAuth(req).parentId, body);
  }
}
