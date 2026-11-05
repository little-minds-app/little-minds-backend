import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateEnv } from '../src/config/env.validation';

/**
 * LMP-28 file/gitignore/example contract + isolation smoke against example matrices.
 */
describe('Environment & secrets contract (LMP-28)', () => {
  const root = join(__dirname, '..');

  const read = (rel: string): string =>
    readFileSync(join(root, rel), 'utf8');

  it('ships per-environment example files', () => {
    for (const rel of [
      '.env.example',
      'infrastructure/environments/development.env.example',
      'infrastructure/environments/staging.env.example',
      'infrastructure/environments/production.env.example',
      'docs/environments-config.md',
    ]) {
      expect(existsSync(join(root, rel))).toBe(true);
    }
  });

  it('documents secret vs public split in .env.example', () => {
    const example = read('.env.example');
    expect(example).toContain('APP_ENV=development');
    expect(example).toMatch(/PUBLIC configuration/i);
    expect(example).toMatch(/SECRET configuration/i);
    expect(example).toContain('PUBLIC_API_BASE_URL=');
  });

  it('keeps .gitignore rules that block real env files but allow examples', () => {
    const gi = read('.gitignore');
    expect(gi).toMatch(/^\.env$/m);
    expect(gi).toMatch(/^\.env\.\*$/m);
    expect(gi).toMatch(/^!\.env\.example$/m);
    expect(gi).toMatch(/^!\.env\.\*\.example$/m);
    expect(gi).toContain('infrastructure/environments/*');
    expect(gi).toContain('!infrastructure/environments/*.example');
  });

  it('documents client LM_API_BASE_URL mapping for all three APP_ENV names', () => {
    const docs = read('docs/environments-config.md');
    expect(docs).toContain('LM_API_BASE_URL');
    expect(docs).toContain('PUBLIC_API_BASE_URL');
    for (const name of ['development', 'staging', 'production']) {
      expect(docs).toContain(name);
    }
  });

  it('allows Nest boot defaults from development example public keys', () => {
    const env = validateEnv({
      APP_ENV: 'development',
      NODE_ENV: 'development',
      PORT: '3000',
      PUBLIC_API_BASE_URL: 'http://localhost:3000',
    });
    expect(env.APP_ENV).toBe('development');
  });

  it('rejects booting staging example placeholders without real secrets replaced', () => {
    // Staging example intentionally uses CHANGE_ME_* — startup must fail-fast.
    expect(() =>
      validateEnv({
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        PUBLIC_API_BASE_URL: 'https://api.staging.example.invalid',
        DATABASE_URL:
          'postgresql://CHANGE_ME_USER:CHANGE_ME_PASSWORD@CHANGE_ME_HOST:5432/little_minds_staging?schema=public',
      }),
    ).toThrow(/Environment validation failed/);
  });

  it('keeps OpenAPI path surface health-only (version may bump additively)', () => {
    const version = read('contracts/VERSION').trim();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(read('contracts/openapi.yaml')).toContain(`version: ${version}`);
    expect(read('contracts/openapi.yaml')).toContain('/health:');
    expect(read('contracts/openapi.yaml')).toContain('/health/ready:');
    // LMP-51 adds a versioned, authenticated batch ingest path.
    expect(read('contracts/openapi.yaml')).toContain('/v1/events/batch:');
    expect(read('contracts/openapi.yaml')).toContain('/v1/insights/session-kpis:');
    // LMP-134 parent privacy consent (explicit opt-in for play telemetry).
    expect(read('contracts/openapi.yaml')).toContain('/v1/privacy/consent/effective:');
    expect(read('contracts/openapi.yaml')).toContain('/v1/privacy/consent/grant:');
    expect(read('contracts/openapi.yaml')).toContain('/v1/privacy/consent/withdraw:');
  });
});
