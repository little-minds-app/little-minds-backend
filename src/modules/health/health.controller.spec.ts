import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get(HealthController);
  });

  it('exposes liveness status from the service', () => {
    const payload = controller.check();
    expect(payload.status).toBe('ok');
    expect(payload.service).toBe('little-minds-backend');
  });
});
