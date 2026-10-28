import { AuthRateLimitService } from './auth-rate-limit.service';
import { RATE_LIMIT_BOOTSTRAP_PER_IP } from './session.constants';

describe('AuthRateLimitService (LMP-33)', () => {
  it('allows up to bootstrap limit then throws 429', () => {
    const limiter = new AuthRateLimitService();
    for (let i = 0; i < RATE_LIMIT_BOOTSTRAP_PER_IP; i += 1) {
      expect(() => limiter.consumeBootstrapIp('127.0.0.1')).not.toThrow();
    }
    try {
      limiter.consumeBootstrapIp('127.0.0.1');
      throw new Error('expected rate limit');
    } catch (err) {
      expect(err).toMatchObject({
        status: 429,
        response: { error: 'rate_limited' },
      });
    }
  });
});
