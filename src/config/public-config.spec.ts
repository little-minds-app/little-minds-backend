import { toPublicConfig, isPublicEnvKey } from './public-config';
import type { AppEnv } from './env.validation';

describe('toPublicConfig', () => {
  it('omits DATABASE_URL and other secrets', () => {
    const env: AppEnv = {
      APP_ENV: 'staging',
      NODE_ENV: 'production',
      PORT: 3000,
      PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      RELEASE: '2026.10.28-rc1',
      DATABASE_URL:
        'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
      REFRESH_TOKEN_PEPPER: 'staging-refresh-pepper-strong!!',
      AUTH_DEV_BOOTSTRAP_ENABLED: false,
    };

    expect(toPublicConfig(env)).toEqual({
      APP_ENV: 'staging',
      NODE_ENV: 'production',
      PORT: 3000,
      PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      RELEASE: '2026.10.28-rc1',
    });
    expect(JSON.stringify(toPublicConfig(env))).not.toContain('s3curePass');
  });

  it('recognizes public env keys only', () => {
    expect(isPublicEnvKey('APP_ENV')).toBe(true);
    expect(isPublicEnvKey('RELEASE')).toBe(true);
    expect(isPublicEnvKey('DATABASE_URL')).toBe(false);
  });
});
