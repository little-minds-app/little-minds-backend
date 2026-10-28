import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { activityFixturesDir } from './activity-contract.paths';
import { ACTIVITY_SCHEMA_VERSION } from './activity-contract.types';
import { validateActivityEvent } from './activity-event.validator';
import { validateActivitySession } from './activity-session.validator';
import {
  issueLooksSafe,
  mapAjvErrorsSafe,
  schemaVersionIncompatibleIssue,
} from './activity-validation-sanitize';

const FIXTURES = activityFixturesDir();

function loadFixture(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8')) as Record<
    string,
    unknown
  >;
}

describe('Validation issue sanitization (LMP-50)', () => {
  it('schema_version mismatch does not echo client-supplied value', () => {
    const poison = '9.9.9-LEAK-secret-token-xyz';
    const event = {
      ...loadFixture('valid-activity-completed.json'),
      schema_version: poison,
    };
    const result = validateActivityEvent(event);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const issue = result.issues.find(
        (i) => i.code === 'schema.version_incompatible',
      );
      expect(issue).toBeDefined();
      expect(issue?.message).not.toContain(poison);
      expect(issue?.message).not.toContain(ACTIVITY_SCHEMA_VERSION);
      expect(issueLooksSafe(issue!, [poison])).toBe(true);
    }

    const session = {
      ...loadFixture('valid-activity-session.json'),
      schema_version: poison,
    };
    const sessionResult = validateActivitySession(session);
    expect(sessionResult.ok).toBe(false);
    if (!sessionResult.ok) {
      const blob = sessionResult.issues.map((i) => i.message).join(' ');
      expect(blob).not.toContain(poison);
    }
  });

  it('Ajv mapping uses stable messages without raw err.message data', () => {
    const issues = mapAjvErrorsSafe([
      {
        keyword: 'pattern',
        instancePath: '/payload/note',
        schemaPath: '#/properties/payload/pattern',
        params: { pattern: 'secret-pattern' },
        message: 'must match pattern "secret-pattern" with value "SENSITIVE"',
      },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('schema.pattern');
    expect(issues[0].path).toBe('payload.note');
    expect(issues[0].message).toBe('Value does not match required pattern');
    expect(issues[0].message).not.toContain('SENSITIVE');
    expect(issues[0].message).not.toContain('secret-pattern');
  });

  it('privacy issues do not echo free-text values or huge keys in messages', () => {
    const secretNote = 'Child said hello and waved privately';
    const event = {
      ...loadFixture('valid-activity-completed.json'),
      payload: {
        completion_status: 'completed',
        notes: secretNote,
      },
    };
    const result = validateActivityEvent(event);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const blob = result.issues.map((i) => `${i.path}|${i.message}`).join('\n');
      expect(blob).not.toContain(secretNote);
      expect(
        result.issues.some((i) => i.code.startsWith('privacy.')),
      ).toBe(true);
    }
  });

  it('schemaVersionIncompatibleIssue is stable', () => {
    const issue = schemaVersionIncompatibleIssue();
    expect(issue.code).toBe('schema.version_incompatible');
    expect(issue.path).toBe('schema_version');
    expect(issue.message).toMatch(/Unsupported schema_version/);
    expect(issue.message).not.toMatch(/\d+\.\d+\.\d+/);
  });
});
