import { Injectable } from '@nestjs/common';

export type HealthStatus = {
  status: 'ok';
  service: 'little-minds-backend';
  timestamp: string;
};

@Injectable()
export class HealthService {
  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
