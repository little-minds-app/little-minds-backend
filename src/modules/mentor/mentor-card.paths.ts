import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolve content/ relative to process cwd (repo root in CI/local) or nest from dist/.
 */
export function resolveContentRoot(cwd: string = process.cwd()): string {
  const candidates = [
    join(cwd, 'content'),
    join(cwd, '..', 'content'),
    join(cwd, '..', '..', 'content'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return join(cwd, 'content');
}

export function mentorCardSchemaPath(contentRoot?: string): string {
  return join(
    contentRoot ?? resolveContentRoot(),
    'schemas',
    'mentor-card',
    'v1.schema.json',
  );
}

export function mentorCardSchemaVersionPath(contentRoot?: string): string {
  return join(
    contentRoot ?? resolveContentRoot(),
    'schemas',
    'mentor-card',
    'VERSION',
  );
}

export function mentorCardFixturesDir(contentRoot?: string): string {
  return join(contentRoot ?? resolveContentRoot(), 'fixtures', 'mentor-cards');
}
