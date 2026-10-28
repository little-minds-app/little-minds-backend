import type { ErrorObject } from 'ajv';
import type { ActivityValidationIssue } from './activity-contract.types';

/** Max length for issue.path (prevents attacker-controlled key bloat). */
const MAX_SAFE_PATH_LENGTH = 128;

const AJV_KEYWORD_MESSAGES: Record<string, string> = {
  required: 'Missing required property',
  additionalProperties: 'Unknown property is not allowed',
  type: 'Invalid value type',
  enum: 'Value is not an allowed enum member',
  const: 'Value does not match required constant',
  pattern: 'Value does not match required pattern',
  minimum: 'Numeric value below minimum',
  maximum: 'Numeric value above maximum',
  minLength: 'String shorter than minimum length',
  maxLength: 'String longer than maximum length',
  minItems: 'Array shorter than minimum items',
  maxItems: 'Array longer than maximum items',
  format: 'Value does not match required format',
  if: 'Conditional schema branch failed',
  then: 'Conditional schema then-branch failed',
  else: 'Conditional schema else-branch failed',
  not: 'Value matched a forbidden schema',
  oneOf: 'Value must match exactly one schema',
  anyOf: 'Value must match at least one schema',
  allOf: 'Value failed an allOf schema branch',
};

/**
 * Sanitize a JSON-pointer-ish path for issue reporting.
 * Never includes payload values — only structural path segments.
 */
export function sanitizeIssuePath(raw: string): string {
  if (!raw) {
    return '';
  }
  // Prefer instance paths; drop schema URI fragments that may be verbose.
  let path = raw.startsWith('#') ? '' : raw;
  path = path.replace(/^\//, '').replace(/\//g, '.');
  if (path.length > MAX_SAFE_PATH_LENGTH) {
    return `${path.slice(0, MAX_SAFE_PATH_LENGTH)}…`;
  }
  return path;
}

/**
 * Map Ajv errors to stable codes + safe messages (no data/value echo).
 */
export function mapAjvErrorsSafe(
  errors: ErrorObject[] | null | undefined,
): ActivityValidationIssue[] {
  if (!errors?.length) {
    return [
      {
        code: 'schema.invalid',
        path: '',
        message: 'Payload failed JSON Schema validation',
      },
    ];
  }

  return errors.map((err) => {
    const keyword = err.keyword || 'invalid';
    const path = sanitizeIssuePath(err.instancePath || '');
    return {
      code: `schema.${keyword}`,
      path,
      message: AJV_KEYWORD_MESSAGES[keyword] ?? 'Schema validation failed',
    };
  });
}

/**
 * Stable schema_version mismatch issue — does NOT echo the client-supplied value.
 */
export function schemaVersionIncompatibleIssue(
  path = 'schema_version',
): ActivityValidationIssue {
  return {
    code: 'schema.version_incompatible',
    path,
    message: 'Unsupported schema_version; expected the active contract revision',
  };
}

/**
 * Assert an issue message/path does not contain untrusted payload snippets.
 * Used by regression tests (and available for future logging guards).
 */
export function issueLooksSafe(
  issue: ActivityValidationIssue,
  forbiddenSubstrings: readonly string[],
): boolean {
  const blob = `${issue.code}\n${issue.path}\n${issue.message}`;
  return !forbiddenSubstrings.some((s) => s.length > 0 && blob.includes(s));
}
