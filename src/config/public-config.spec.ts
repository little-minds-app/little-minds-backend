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
      LISTEN_HOST: '0.0.0.0',
      SMS_SENDER: 'production',
      OTP_PEPPER: 'staging-otp-pepper-strong-value!!',
      PHONE_SUBJECT_PEPPER: 'staging-phone-subject-pepper!!',
      MAIL_SENDER: 'production',
      EMAIL_SUBJECT_PEPPER: 'staging-email-subject-pepper!!',
      APPLE_CLIENT_IDS: [],
      GOOGLE_CLIENT_IDS: [],
      GOOGLE_ISSUERS: [],
      GOOGLE_REDIRECT_URIS: [],
      GOOGLE_PKCE_ENABLED: false,
    };

    expect(toPublicConfig(env)).toEqual({
      APP_ENV: 'staging',
      NODE_ENV: 'production',
      PORT: 3000,
      PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      RELEASE: '2026.10.28-rc1',
      LISTEN_HOST: '0.0.0.0',
      AUTH_DEV_BOOTSTRAP_ENABLED: false,
      SMS_SENDER: 'production',
      MAIL_SENDER: 'production',
      GOOGLE_PKCE_ENABLED: false,
    });
    expect(JSON.stringify(toPublicConfig(env))).not.toContain('s3curePass');
    expect(JSON.stringify(toPublicConfig(env))).not.toContain('otp-pepper');
  });

  it('recognizes public env keys only', () => {
    expect(isPublicEnvKey('APP_ENV')).toBe(true);
    expect(isPublicEnvKey('RELEASE')).toBe(true);
    expect(isPublicEnvKey('LISTEN_HOST')).toBe(true);
    expect(isPublicEnvKey('SMS_SENDER')).toBe(true);
    expect(isPublicEnvKey('MAIL_SENDER')).toBe(true);
    expect(isPublicEnvKey('DATABASE_URL')).toBe(false);
    expect(isPublicEnvKey('OTP_PEPPER')).toBe(false);
    expect(isPublicEnvKey('EMAIL_SUBJECT_PEPPER')).toBe(false);
  });
});
