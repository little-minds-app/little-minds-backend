/**
 * LMP-27 — negative proofs that intentional contract breakage fails the same
 * entrypoints CI uses (validate / compat / generated drift).
 *
 * Fixtures under test/fixtures/openapi-negative/* are selected via
 * LM_CONTRACTS_ROOT so the published contracts/ tree on main stays at 0.1.0.
 * Drift cases use temp directories only (no mutation of the shared working tree).
 */
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = join(__dirname, '..');
const FIXTURES = join(ROOT, 'test', 'fixtures', 'openapi-negative');
const COMMITTED_GENERATED_TS = join(
  ROOT,
  'contracts',
  'generated',
  'typescript',
  'schema.ts',
);

function runContractScript(
  script: 'contracts:validate' | 'contracts:compat' | 'contracts:generate',
  contractsRoot: string,
) {
  return spawnSync('npm', ['run', script], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      LM_CONTRACTS_ROOT: contractsRoot,
    },
  });
}

function makeTempContractsRoot(patchedOpenapi: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'lmp27-contracts-'));
  writeFileSync(join(dir, 'openapi.yaml'), patchedOpenapi, 'utf8');
  cpSync(join(ROOT, 'contracts', 'VERSION'), join(dir, 'VERSION'));
  cpSync(
    join(ROOT, 'contracts', 'compatibility'),
    join(dir, 'compatibility'),
    { recursive: true },
  );
  cpSync(join(ROOT, 'contracts', 'generated'), join(dir, 'generated'), {
    recursive: true,
  });
  return dir;
}

describe('OpenAPI negative contract gates (LMP-27)', () => {
  it('fails validate when info.version disagrees with VERSION', () => {
    const result = runContractScript(
      'contracts:validate',
      join(FIXTURES, 'version-mismatch'),
    );
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(
      /FAIL contracts:validate|must match contracts\/VERSION/i,
    );
  });

  it('fails compat when an invented product path is added', () => {
    const result = runContractScript(
      'contracts:compat',
      join(FIXTURES, 'invented-path'),
    );
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(
      /outside LMP-23 allowlist|invent product/i,
    );
  });

  it('fails compat when a required HealthStatus field is removed (0.x)', () => {
    const result = runContractScript(
      'contracts:compat',
      join(FIXTURES, 'breaking-required'),
    );
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(
      /Breaking:|missing required/i,
    );
  });

  it('fails the contracts:check git-diff drift gate when generated content differs', () => {
    // Mirrors `git diff --exit-code -- contracts/generated` in check-contracts.sh
    // without touching the working tree.
    const dir = mkdtempSync(join(tmpdir(), 'lmp27-drift-'));
    try {
      const clean = join(dir, 'clean.ts');
      const dirty = join(dir, 'dirty.ts');
      const body = readFileSync(COMMITTED_GENERATED_TS, 'utf8');
      writeFileSync(clean, body, 'utf8');
      writeFileSync(
        dirty,
        `${body}\n// LMP-27 intentional drift marker\n`,
        'utf8',
      );

      const same = spawnSync(
        'git',
        ['diff', '--no-index', '--exit-code', clean, clean],
        { cwd: ROOT, encoding: 'utf8' },
      );
      expect(same.status).toBe(0);

      const drifted = spawnSync(
        'git',
        ['diff', '--no-index', '--exit-code', clean, dirty],
        { cwd: ROOT, encoding: 'utf8' },
      );
      expect(drifted.status).not.toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('detects regenerate drift when OpenAPI moves ahead of committed generated clients', () => {
    // Full contracts:check regenerates then git-diffs committed generated/.
    // Prove: after an OpenAPI-only change, regenerate produces drift vs committed.
    const openapi = readFileSync(
      join(ROOT, 'contracts', 'openapi.yaml'),
      'utf8',
    );
    const patched = openapi.replace(
      'description: Liveness indicator',
      'description: Liveness indicator (LMP-27 intentional OpenAPI drift)',
    );
    expect(patched).not.toBe(openapi);

    const dir = makeTempContractsRoot(patched);
    try {
      const before = readFileSync(
        join(dir, 'generated', 'typescript', 'schema.ts'),
        'utf8',
      );
      const gen = runContractScript('contracts:generate', dir);
      expect(gen.status).toBe(0);
      const after = readFileSync(
        join(dir, 'generated', 'typescript', 'schema.ts'),
        'utf8',
      );
      expect(after).not.toBe(before);

      const drift = spawnSync(
        'git',
        [
          'diff',
          '--no-index',
          '--exit-code',
          COMMITTED_GENERATED_TS,
          join(dir, 'generated', 'typescript', 'schema.ts'),
        ],
        { cwd: ROOT, encoding: 'utf8' },
      );
      expect(drift.status).not.toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
