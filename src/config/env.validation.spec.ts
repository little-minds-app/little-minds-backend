import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('accepts defaults when NODE_ENV and PORT are omitted', () => {
    const env = validateEnv({});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
  });

  it('accepts explicit valid values', () => {
    const env = validateEnv({
      NODE_ENV: 'production',
      PORT: '4000',
    });
    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe(4000);
  });

  it('rejects invalid NODE_ENV', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'staging',
        PORT: '3000',
      }),
    ).toThrow(/Environment validation failed/);
  });

  it('rejects non-numeric PORT', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'test',
        PORT: 'not-a-port',
      }),
    ).toThrow(/Environment validation failed/);
  });

  it('rejects out-of-range PORT', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'test',
        PORT: '70000',
      }),
    ).toThrow(/Environment validation failed/);
  });
});
