import {
  databaseUrlUsesForbiddenLocalSecrets,
  isForbiddenStandaloneSecret,
  isLocalApiBaseHost,
  isLoopbackListenHost,
  isLocalDatabaseUrl,
  isSecretEnvKey,
} from './env.secrets';

describe('env.secrets helpers', () => {
  it('classifies secret keys', () => {
    expect(isSecretEnvKey('DATABASE_URL')).toBe(true);
    expect(isSecretEnvKey('PORT')).toBe(false);
  });

  it('detects local database hosts', () => {
    expect(
      isLocalDatabaseUrl(
        'postgresql://app:pass@localhost:5432/little_minds',
      ),
    ).toBe(true);
    expect(
      isLocalDatabaseUrl(
        'postgresql://app:pass@127.0.0.1:5432/little_minds',
      ),
    ).toBe(true);
    expect(
      isLocalDatabaseUrl(
        'postgresql://app:pass@db.staging.example.invalid:5432/little_minds',
      ),
    ).toBe(false);
  });

  it('detects local/dev API base hosts without treating public hosts as local', () => {
    expect(isLocalApiBaseHost('localhost')).toBe(true);
    expect(isLocalApiBaseHost('127.0.0.1')).toBe(true);
    expect(isLocalApiBaseHost('::1')).toBe(true);
    expect(isLocalApiBaseHost('10.0.2.2')).toBe(true);
    expect(isLocalApiBaseHost('192.168.0.5')).toBe(true);
    expect(isLocalApiBaseHost('api.staging.example.invalid')).toBe(false);
  });

  it('allows only strict loopback listen hosts for bootstrap bind', () => {
    expect(isLoopbackListenHost('127.0.0.1')).toBe(true);
    expect(isLoopbackListenHost('::1')).toBe(true);
    expect(isLoopbackListenHost('localhost')).toBe(true);
    expect(isLoopbackListenHost('0.0.0.0')).toBe(false);
    expect(isLoopbackListenHost('10.0.2.2')).toBe(false);
  });

  it('detects local placeholder credentials in DATABASE_URL', () => {
    expect(
      databaseUrlUsesForbiddenLocalSecrets(
        'postgresql://postgres:postgres@db.example.invalid:5432/little_minds',
      ),
    ).toBe(true);
    expect(
      databaseUrlUsesForbiddenLocalSecrets(
        'postgresql://app_user:s3curePass@db.example.invalid:5432/little_minds',
      ),
    ).toBe(false);
  });

  it('flags forbidden standalone secret placeholders', () => {
    expect(isForbiddenStandaloneSecret('postgres')).toBe(true);
    expect(isForbiddenStandaloneSecret('CHANGE_ME')).toBe(true);
    expect(isForbiddenStandaloneSecret('s3curePass-not-local')).toBe(false);
  });
});
