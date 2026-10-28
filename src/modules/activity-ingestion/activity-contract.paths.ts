import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolve contracts/schemas/activity relative to cwd (repo root) or nest from dist/.
 */
export function resolveActivitySchemaRoot(cwd: string = process.cwd()): string {
  const candidates = [
    join(cwd, 'contracts', 'schemas', 'activity'),
    join(cwd, '..', 'contracts', 'schemas', 'activity'),
    join(cwd, '..', '..', 'contracts', 'schemas', 'activity'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return join(cwd, 'contracts', 'schemas', 'activity');
}

export function activitySchemaVersionPath(schemaRoot?: string): string {
  return join(schemaRoot ?? resolveActivitySchemaRoot(), 'VERSION');
}

export function activitySessionSchemaPath(schemaRoot?: string): string {
  return join(
    schemaRoot ?? resolveActivitySchemaRoot(),
    'activity-session-v1.schema.json',
  );
}

export function activityEventSchemaPath(schemaRoot?: string): string {
  return join(
    schemaRoot ?? resolveActivitySchemaRoot(),
    'activity-event-v1.schema.json',
  );
}

export function activityDefsSchemaPath(schemaRoot?: string): string {
  return join(schemaRoot ?? resolveActivitySchemaRoot(), 'defs.schema.json');
}

export function activityFixturesDir(cwd: string = process.cwd()): string {
  const candidates = [
    join(cwd, 'contracts', 'fixtures', 'activity'),
    join(cwd, '..', 'contracts', 'fixtures', 'activity'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return join(cwd, 'contracts', 'fixtures', 'activity');
}
