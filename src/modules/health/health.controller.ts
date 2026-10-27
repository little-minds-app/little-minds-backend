import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

/**
 * Process liveness only (no DB dependency). Product APIs will live under /v1 later.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthStatus {
    return this.healthService.getLiveness();
  }
}
