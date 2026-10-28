import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  HealthService,
  LivenessStatus,
  ReadinessStatus,
} from './health.service';

/**
 * Process liveness + dependency readiness (LMP-32).
 * Product APIs remain under /v1 when their Jira tasks land.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): LivenessStatus {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response): Promise<ReadinessStatus> {
    const payload = await this.healthService.getReadiness();
    if (payload.status !== 'ok') {
      res.status(503);
    }
    return payload;
  }
}
