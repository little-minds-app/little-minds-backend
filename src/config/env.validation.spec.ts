import { stagingAuthEnv } from '../../test/fixtures/auth/keys';
import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('applies development defaults when APP_ENV, NODE_ENV, and PORT are omitted', () => {
    const env = validateEnv({});
    expect(env.APP_ENV).toBe('development');
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.PUBLIC_API_BASE_URL).toBe('http://localhost:3000');
    expect(env.RELEASE).toBe('dev');
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it('defaults APP_ENV to development when NODE_ENV=test', () => {
    const env = validateEnv({ NODE_ENV: 'test', PORT: '3000' });
    expect(env.APP_ENV).toBe('development');
    expect(env.NODE_ENV).toBe('test');
  });

  it('accepts explicit development values without DATABASE_URL', () => {
    const env = validateEnv({
      APP_ENV: 'development',
      NODE_ENV: 'development',
      PORT: '4000',
      PUBLIC_API_BASE_URL: 'http://localhost:4000',
    });
    expect(env.PORT).toBe(4000);
    expect(env.PUBLIC_API_BASE_URL).toBe('http://localhost:4000');
  });

  it('rejects invalid APP_ENV values', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'local',
        NODE_ENV: 'development',
      }),
    ).toThrow(/Environment validation failed/);
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

  it('rejects staging APP_ENV with NODE_ENV=development', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'development',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
      }),
    ).toThrow(/requires NODE_ENV=production/);
  });

  it('rejects staging when DATABASE_URL is missing', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      }),
    ).toThrow(/DATABASE_URL is required/);
  });

  it('rejects staging DATABASE_URL targeting localhost', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@localhost:5432/little_minds',
      }),
    ).toThrow(/must not target a local\/dev host/);
  });

  it('rejects staging DATABASE_URL with local placeholder credentials', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://postgres:postgres@db.staging.example.invalid:5432/little_minds',
      }),
    ).toThrow(/local placeholder credentials/);
  });

  it('rejects staging PUBLIC_API_BASE_URL with http: protocol', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'http://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
      }),
    ).toThrow(/must use https:.*rejected protocol http:/);
  });

  it('rejects staging PUBLIC_API_BASE_URL with ftp: protocol', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'ftp://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
      }),
    ).toThrow(/must use https:.*rejected protocol ftp:/);
  });

  it('rejects production PUBLIC_API_BASE_URL without https:', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'http://api.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
      }),
    ).toThrow(/must use https:/);
  });

  it.each([
    'https://localhost:3000',
    'https://127.0.0.1:3000',
    'https://[::1]:3000',
    'https://10.0.2.2:3000',
    'https://host.docker.internal:3000',
    'https://192.168.1.10:3000',
  ])(
    'rejects staging PUBLIC_API_BASE_URL on local/dev host %s',
    (publicUrl) => {
      expect(() =>
        validateEnv({
          ...stagingAuthEnv,
          APP_ENV: 'staging',
          NODE_ENV: 'production',
          PUBLIC_API_BASE_URL: publicUrl,
          DATABASE_URL:
            'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
        }),
      ).toThrow(/must not use a local\/development host/);
    },
  );

  it('accepts development PUBLIC_API_BASE_URL on localhost and Android emulator hosts', () => {
    expect(
      validateEnv({
        APP_ENV: 'development',
        PUBLIC_API_BASE_URL: 'http://localhost:3000',
      }).PUBLIC_API_BASE_URL,
    ).toBe('http://localhost:3000');
    expect(
      validateEnv({
        APP_ENV: 'development',
        PUBLIC_API_BASE_URL: 'http://10.0.2.2:3000',
      }).PUBLIC_API_BASE_URL,
    ).toBe('http://10.0.2.2:3000');
  });

  it('does not echo raw invalid PUBLIC_API_BASE_URL values in errors', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'not a url with user:sekrit@host',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
      }),
    ).toThrow(/PUBLIC_API_BASE_URL is not a valid URL$/);
    try {
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'not a url with user:sekrit@host',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain('sekrit');
      expect(message).not.toContain('not a url');
    }
  });

  it('rejects production when POSTGRES_PASSWORD is a local placeholder', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
        POSTGRES_PASSWORD: 'postgres',
      }),
    ).toThrow(/POSTGRES_PASSWORD must not use a local placeholder/);
  });

  it('accepts valid staging configuration', () => {
    const env = validateEnv({
      ...stagingAuthEnv,
      APP_ENV: 'staging',
      NODE_ENV: 'production',
      PORT: '3000',
      PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      DATABASE_URL:
        'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
    });
    expect(env.APP_ENV).toBe('staging');
    expect(env.DATABASE_URL).toContain('db.staging.example.invalid');
  });

  it('accepts valid production configuration', () => {
    const env = validateEnv({
      ...stagingAuthEnv,
      APP_ENV: 'production',
      NODE_ENV: 'production',
      PUBLIC_API_BASE_URL: 'https://api.example.invalid',
      DATABASE_URL:
        'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
    });
    expect(env.APP_ENV).toBe('production');
    expect(env.PUBLIC_API_BASE_URL).toBe('https://api.example.invalid');
  });

  it('allows staging validation under NODE_ENV=test harness', () => {
    const env = validateEnv({
      ...stagingAuthEnv,
      APP_ENV: 'staging',
      NODE_ENV: 'test',
      PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      DATABASE_URL:
        'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
    });
    expect(env.APP_ENV).toBe('staging');
    expect(env.NODE_ENV).toBe('test');
  });

  it('rejects staging without JWT access key PEMs', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
        REFRESH_TOKEN_PEPPER: 'staging-refresh-pepper-strong',
      }),
    ).toThrow(/JWT_ACCESS_PRIVATE_KEY_PEM/);
  });
});
