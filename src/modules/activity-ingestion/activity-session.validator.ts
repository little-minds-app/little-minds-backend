import { readFileSync } from 'node:fs';
import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import {
  activityDefsSchemaPath,
  activitySchemaVersionPath,
  activitySessionSchemaPath,
  resolveActivitySchemaRoot,
} from './activity-contract.paths';
import {
  ACTIVITY_SCHEMA_VERSION,
  type ActivitySessionV1,
  type ActivitySessionValidationResult,
  type ActivityValidationIssue,
} from './activity-contract.types';
import {
  collectForbiddenClientIdentityIssues,
  collectPrivacyIssues,
} from './activity-event.privacy';

let cachedValidate: ValidateFunction | undefined;
let cachedSchemaVersion: string | undefined;

function loadVersion(schemaRoot?: string): string {
  return readFileSync(
    activitySchemaVersionPath(schemaRoot ?? resolveActivitySchemaRoot()),
    'utf8',
  ).trim();
}

function getAjvValidator(schemaRoot?: string): ValidateFunction {
  if (cachedValidate) {
    return cachedValidate;
  }
  const root = schemaRoot ?? resolveActivitySchemaRoot();
  const versionFile = loadVersion(root);
  if (versionFile !== ACTIVITY_SCHEMA_VERSION) {
    throw new Error(
      `Activity schema VERSION (${versionFile}) must match ACTIVITY_SCHEMA_VERSION (${ACTIVITY_SCHEMA_VERSION})`,
    );
  }

  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateSchema: true,
  });
  addFormats(ajv);

  const defs = JSON.parse(readFileSync(activityDefsSchemaPath(root), 'utf8'));
  ajv.addSchema(defs);
  const schema = JSON.parse(
    readFileSync(activitySessionSchemaPath(root), 'utf8'),
  );
  cachedValidate = ajv.compile(schema);
  cachedSchemaVersion = versionFile;
  return cachedValidate;
}

export function getActivitySchemaVersion(schemaRoot?: string): string {
  if (!cachedSchemaVersion) {
    cachedSchemaVersion = loadVersion(schemaRoot);
  }
  return cachedSchemaVersion;
}

/** Test-only: clear Ajv cache when swapping fixtures roots. */
export function resetActivitySessionValidatorCache(): void {
  cachedValidate = undefined;
  cachedSchemaVersion = undefined;
}

function mapAjvErrors(
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
  return errors.map((err) => ({
    code: `schema.${err.keyword}`,
    path: err.instancePath || err.schemaPath,
    message: err.message ?? 'Schema validation failed',
  }));
}

function validateTemporalOrder(
  session: ActivitySessionV1,
): ActivityValidationIssue[] {
  const issues: ActivityValidationIssue[] = [];
  if (session.ended_at) {
    const start = Date.parse(session.started_at);
    const end = Date.parse(session.ended_at);
    if (Number.isFinite(start) && Number.isFinite(end) && end < start) {
      issues.push({
        code: 'session.ended_before_started',
        path: 'ended_at',
        message: 'ended_at must be >= started_at',
      });
    }
  }
  return issues;
}

/**
 * Validate an ActivitySessionV1 wire document (schema version + Ajv + privacy).
 */
export function validateActivitySession(
  payload: unknown,
  options?: { schemaRoot?: string },
): ActivitySessionValidationResult {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      ok: false,
      issues: [
        {
          code: 'schema.type',
          path: '',
          message: 'Activity session payload must be a JSON object',
        },
      ],
    };
  }

  const record = payload as Record<string, unknown>;
  const issues: ActivityValidationIssue[] = [];

  issues.push(...collectForbiddenClientIdentityIssues(record));

  if (record.schema_version !== ACTIVITY_SCHEMA_VERSION) {
    issues.push({
      code: 'schema.version_incompatible',
      path: 'schema_version',
      message: `Unsupported schema_version ${String(record.schema_version)}; expected ${ACTIVITY_SCHEMA_VERSION}`,
    });
    return { ok: false, issues };
  }

  const validate = getAjvValidator(options?.schemaRoot);
  const schemaOk = validate(payload);
  if (!schemaOk) {
    issues.push(...mapAjvErrors(validate.errors));
  }

  issues.push(...collectPrivacyIssues(payload));

  if (schemaOk) {
    issues.push(...validateTemporalOrder(payload as ActivitySessionV1));
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, session: payload as ActivitySessionV1 };
}
