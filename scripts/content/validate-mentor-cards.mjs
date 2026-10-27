#!/usr/bin/env node
/**
 * Validate content/fixtures/mentor-cards against the v1 JSON Schema + safe-copy rules.
 * Spawns Jest focused suite so CI and local share one implementation.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const result = spawnSync(
  'npx',
  [
    'jest',
    '--runInBand',
    '--coverage=false',
    'src/modules/mentor/mentor-card.validator.spec.ts',
    'src/modules/mentor/mentor-card.safe-copy.spec.ts',
    'src/modules/mentor/mentor-card.review.spec.ts',
  ],
  {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  },
);

if (result.status !== 0) {
  console.error('FAIL content:validate-mentor-cards');
  process.exit(result.status ?? 1);
}

console.log('PASS content:validate-mentor-cards');
