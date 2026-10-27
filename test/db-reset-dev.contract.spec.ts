import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = join(__dirname, '..');
const script = join(root, 'scripts', 'db-reset-dev.sh');

function runReset(env: NodeJS.ProcessEnv): {
  status: number | null;
  stderr: string;
  stdout: string;
} {
  const result = spawnSync('bash', [script], {
    cwd: root,
    env: {
      ...process.env,
      ...env,
      LM_DB_RESET_CHECK_ONLY: '1',
    },
    encoding: 'utf8',
  });
  return {
    status: result.status,
    stderr: result.stderr || '',
    stdout: result.stdout || '',
  };
}

describe('db-reset-dev.sh contract (no destructive steps)', () => {
  it('refuses remote DATABASE_URL even with confirmation', () => {
    const result = runReset({
      DATABASE_URL:
        'postgresql://postgres:postgres@db.prod.example.com:5432/little_minds',
      LM_CONFIRM_DB_RESET: '1',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/Refusing reset/i);
  });

  it('refuses localhost without explicit confirmation', () => {
    const result = runReset({
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/little_minds?schema=public',
      LM_CONFIRM_DB_RESET: '',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/LM_CONFIRM_DB_RESET=1/);
  });

  it('refuses remote URL that only mentions localhost in the query', () => {
    const result = runReset({
      DATABASE_URL:
        'postgresql://u:p@remote.example.com:5432/little_minds?hint=localhost',
      LM_CONFIRM_DB_RESET: '1',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/Refusing reset/i);
  });

  it('passes check-only for CI-style local URL with confirmation', () => {
    const result = runReset({
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/little_minds?schema=public',
      LM_CONFIRM_DB_RESET: '1',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/LM_DB_RESET_CHECK_ONLY=1/);
  });
});
