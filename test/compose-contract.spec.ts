import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LMP-21 / DEVX-001 contract: Compose must declare healthy local
 * PostgreSQL, MinIO, and Mailpit with configurable host ports + volumes.
 * Runtime daemon checks live in scripts/check-compose.sh (and local make targets).
 */
describe('Docker Compose local stack contract (LMP-21)', () => {
  const root = join(__dirname, '..');
  const compose = readFileSync(
    join(root, 'infrastructure/docker-compose.yml'),
    'utf8',
  );
  const envExample = readFileSync(join(root, '.env.example'), 'utf8');

  it('declares postgres, minio, and mailpit services', () => {
    for (const service of ['postgres', 'minio', 'mailpit']) {
      expect(compose).toContain(`\n  ${service}:`);
    }
  });

  it('defines a healthcheck for each core service', () => {
    for (const service of ['postgres', 'minio', 'mailpit']) {
      const start = compose.indexOf(`\n  ${service}:`);
      expect(start).toBeGreaterThanOrEqual(0);
      const rest = compose.slice(start + 1);
      let end = rest.length;
      for (const other of ['postgres', 'minio', 'mailpit', 'volumes']) {
        if (other === service) continue;
        const pos = rest.indexOf(`\n  ${other}:`);
        if (pos >= 0 && pos < end) end = pos;
      }
      const block = rest.slice(0, end);
      expect(block).toContain('healthcheck:');
      expect(block).toContain('ports:');
      expect(block).toContain('volumes:');
    }
  });

  it('exposes Blueprint §27.2 default host ports via env substitution', () => {
    expect(compose).toContain('POSTGRES_PORT:-5432');
    expect(compose).toContain('MINIO_API_PORT:-9000');
    expect(compose).toContain('MINIO_CONSOLE_PORT:-9001');
    expect(compose).toContain('MAILPIT_UI_PORT:-8025');
    expect(compose).toContain('MAILPIT_SMTP_PORT:-1025');
  });

  it('persists service data in named volumes', () => {
    expect(compose).toContain('little_minds_postgres_data:');
    expect(compose).toContain('little_minds_minio_data:');
    expect(compose).toContain('little_minds_mailpit_data:');
  });

  it('documents safe local-only credentials and Nest bootstrap vars in .env.example', () => {
    expect(envExample).toContain('APP_ENV=development');
    expect(envExample).toContain('NODE_ENV=development');
    expect(envExample).toContain('PORT=3000');
    expect(envExample).toContain('PUBLIC_API_BASE_URL=');
    expect(envExample).toContain('POSTGRES_USER=postgres');
    expect(envExample).toContain('POSTGRES_PASSWORD=postgres');
    expect(envExample).toContain('DATABASE_URL=postgresql://');
    expect(envExample).toContain('MINIO_ROOT_USER=minioadmin');
    expect(envExample).toContain('MAILPIT_UI_PORT=8025');
  });
});
