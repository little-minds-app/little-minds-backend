import { stagingAuthEnv } from '../../test/fixtures/auth/keys';
import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('rejects missing or placeholder BFF secret before staging boot', () => {
    const env = {
      ...stagingAuthEnv,
      APP_ENV: 'staging',
      NODE_ENV: 'production',
      PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
      DATABASE_URL: 'postgresql://app_user:secure@db.staging.example.invalid:5432/little_minds',
    };
    expect(() => validateEnv({ ...env, LM_WEB_BFF_SECRET: undefined }))
      .toThrow(/LM_WEB_BFF_SECRET/);
    expect(() => validateEnv({ ...env, LM_WEB_BFF_SECRET: 'CHANGE_ME_WITH_UNIQUE_32_PLUS_CHARACTER_SECRET' }))
      .toThrow(/LM_WEB_BFF_SECRET/);
  });

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

  describe('APP_ENV / NODE_ENV matrix (LMP-34 security gate)', () => {
    it('rejects missing APP_ENV when NODE_ENV=production (no silent development fallback)', () => {
      expect(() =>
        validateEnv({
          NODE_ENV: 'production',
          PUBLIC_API_BASE_URL: 'https://api.example.invalid',
        }),
      ).toThrow(/APP_ENV is required when NODE_ENV=production/);
    });

    it('preserves local/CI: omitted APP_ENV with NODE_ENV=development → development', () => {
      const env = validateEnv({ NODE_ENV: 'development' });
      expect(env.APP_ENV).toBe('development');
      expect(env.SMS_SENDER).toBe('fake');
    });

    it('preserves local/CI: omitted APP_ENV with NODE_ENV=test → development', () => {
      const env = validateEnv({ NODE_ENV: 'test' });
      expect(env.APP_ENV).toBe('development');
      expect(env.SMS_SENDER).toBe('fake');
    });

    it('allows explicit APP_ENV=development even when NODE_ENV=production', () => {
      // Explicit product flavor wins; not a silent fallback.
      const env = validateEnv({
        APP_ENV: 'development',
        NODE_ENV: 'production',
      });
      expect(env.APP_ENV).toBe('development');
      expect(env.SMS_SENDER).toBe('fake');
    });

    it('blocks SMS_SENDER=fake when APP_ENV=staging (explicit)', () => {
      expect(() =>
        validateEnv({
          ...stagingAuthEnv,
          APP_ENV: 'staging',
          NODE_ENV: 'production',
          PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
          DATABASE_URL:
            'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
          SMS_SENDER: 'fake',
        }),
      ).toThrow(/SMS_SENDER=fake is forbidden/);
    });

    it('blocks MAIL_SENDER=fake when APP_ENV=staging (explicit)', () => {
      expect(() =>
        validateEnv({
          ...stagingAuthEnv,
          APP_ENV: 'staging',
          NODE_ENV: 'production',
          PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
          DATABASE_URL:
            'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
          SMS_SENDER: 'production',
          MAIL_SENDER: 'fake',
        }),
      ).toThrow(/MAIL_SENDER=fake is forbidden/);
    });

    it('defaults MAIL_SENDER=fake in development', () => {
      const env = validateEnv({ APP_ENV: 'development' });
      expect(env.MAIL_SENDER).toBe('fake');
      expect(env.EMAIL_SUBJECT_PEPPER.length).toBeGreaterThanOrEqual(16);
      expect(env.APPLE_CLIENT_IDS).toEqual([]);
      expect(env.GOOGLE_PKCE_ENABLED).toBe(false);
    });

    it('forbids local JWKS JSON overrides in staging', () => {
      expect(() =>
        validateEnv({
          ...stagingAuthEnv,
          APP_ENV: 'staging',
          NODE_ENV: 'production',
          PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
          DATABASE_URL:
            'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
          SMS_SENDER: 'production',
          MAIL_SENDER: 'production',
          APPLE_JWKS_JSON: '{"keys":[]}',
        }),
      ).toThrow(/APPLE_JWKS_JSON \/ GOOGLE_JWKS_JSON are forbidden/);
    });

    it('blocks unpublished privacy catalog when APP_ENV=staging (explicit)', () => {
      expect(() =>
        validateEnv({
          ...stagingAuthEnv,
          APP_ENV: 'staging',
          NODE_ENV: 'production',
          PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
          DATABASE_URL:
            'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
          SMS_SENDER: 'production',
        }),
      ).toThrow(/Privacy notice catalog has no published entry/);
    });
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

  it('rejects staging/production while privacy notice catalog is unpublished', () => {
    // Engineering catalog is published:false until counsel sign-off — real-user
    // envs must not boot on the synthetic placeholder (LMP-34 final review).
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PORT: '3000',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
      }),
    ).toThrow(/Privacy notice catalog has no published entry/);

    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
      }),
    ).toThrow(/Privacy notice catalog has no published entry/);
  });

  it('rejects staging under NODE_ENV=test harness while catalog unpublished', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'test',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds_staging',
      }),
    ).toThrow(/Privacy notice catalog has no published entry/);
  });

  it('allows unpublished synthetic notice fixtures in development/local CI', () => {
    const env = validateEnv({
      APP_ENV: 'development',
      NODE_ENV: 'test',
    });
    expect(env.APP_ENV).toBe('development');
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

  it('rejects staging/production when AUTH_DEV_BOOTSTRAP_ENABLED is true', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.staging.example.invalid:5432/little_minds',
        AUTH_DEV_BOOTSTRAP_ENABLED: 'true',
      }),
    ).toThrow(/AUTH_DEV_BOOTSTRAP_ENABLED must be false/);
  });

  it('rejects production local refresh pepper', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
        REFRESH_TOKEN_PEPPER: 'local-dev-refresh-pepper-not-for-prod',
      }),
    ).toThrow(/REFRESH_TOKEN_PEPPER/);
  });

  it('rejects LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH in production (LMP-134)', () => {
    expect(() =>
      validateEnv({
        ...stagingAuthEnv,
        APP_ENV: 'production',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.example.invalid',
        DATABASE_URL:
          'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
        LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH: 'true',
      }),
    ).toThrow(/LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH is forbidden when APP_ENV=production/);
  });

  it('defaults LISTEN_HOST to 0.0.0.0 when bootstrap is disabled', () => {
    const env = validateEnv({ APP_ENV: 'development' });
    expect(env.LISTEN_HOST).toBe('0.0.0.0');
    expect(env.AUTH_DEV_BOOTSTRAP_ENABLED).toBe(false);
  });

  it('requires loopback LISTEN_HOST when AUTH_DEV_BOOTSTRAP_ENABLED=true', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'development',
        AUTH_DEV_BOOTSTRAP_ENABLED: 'true',
        PUBLIC_API_BASE_URL: 'http://localhost:3000',
        LISTEN_HOST: '0.0.0.0',
      }),
    ).toThrow(/LISTEN_HOST must be 127\.0\.0\.1/);
  });

  it('requires local PUBLIC_API_BASE_URL when bootstrap is enabled', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'development',
        AUTH_DEV_BOOTSTRAP_ENABLED: 'true',
        PUBLIC_API_BASE_URL: 'https://api.shared.example.invalid',
        LISTEN_HOST: '127.0.0.1',
      }),
    ).toThrow(/PUBLIC_API_BASE_URL must use a local/);
  });

  it('accepts bootstrap with loopback bind + local API URL', () => {
    const env = validateEnv({
      APP_ENV: 'development',
      AUTH_DEV_BOOTSTRAP_ENABLED: 'true',
      PUBLIC_API_BASE_URL: 'http://127.0.0.1:3000',
      LISTEN_HOST: '127.0.0.1',
    });
    expect(env.LISTEN_HOST).toBe('127.0.0.1');
    expect(env.AUTH_DEV_BOOTSTRAP_ENABLED).toBe(true);
  });

  it('rejects bootstrap when LISTEN_HOST is omitted (defaults to 0.0.0.0)', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'development',
        AUTH_DEV_BOOTSTRAP_ENABLED: 'true',
        PUBLIC_API_BASE_URL: 'http://localhost:3000',
      }),
    ).toThrow(/LISTEN_HOST must be 127\.0\.0\.1/);
  });
});
