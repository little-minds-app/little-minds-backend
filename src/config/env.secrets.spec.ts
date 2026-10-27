import {
  databaseUrlUsesForbiddenLocalSecrets,
  isForbiddenStandaloneSecret,
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
