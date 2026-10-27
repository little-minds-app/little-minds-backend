import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok liveness payload without secrets', () => {
    const service = new HealthService();
    const result = service.getLiveness();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('little-minds-backend');
    expect(result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(result).not.toHaveProperty('DATABASE_URL');
    expect(JSON.stringify(result)).not.toMatch(/password|secret|api[_-]?key/i);
  });
});
