import { readFileSync } from 'node:fs';
import Ajv, { type ValidateFunction } from 'ajv';
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
  type ServerConsentRecord,
} from './activity-contract.types';
import { collectSessionConsentAuthorizationIssues } from './activity-event.consent';
import {
  collectForbiddenClientIdentityIssues,
  collectPrivacyIssues,
} from './activity-event.privacy';
import {
  mapAjvErrorsSafe,
  schemaVersionIncompatibleIssue,
} from './activity-validation-sanitize';

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

export type ValidateActivitySessionOptions = {
  schemaRoot?: string;
  /**
   * When provided, session.consent.consent_scope is authorized against server records.
   * session.consent.decision is never treated as a grant.
   */
  serverConsentRecords?: readonly ServerConsentRecord[];
};

/**
 * Validate an ActivitySessionV1 wire document (schema version + Ajv + privacy).
 */
export function validateActivitySession(
  payload: unknown,
  options?: ValidateActivitySessionOptions,
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
    issues.push(schemaVersionIncompatibleIssue());
    return { ok: false, issues };
  }

  const validate = getAjvValidator(options?.schemaRoot);
  const schemaOk = validate(payload);
  if (!schemaOk) {
    issues.push(...mapAjvErrorsSafe(validate.errors));
  }

  issues.push(...collectPrivacyIssues(payload));

  if (schemaOk) {
    const session = payload as ActivitySessionV1;
    issues.push(...validateTemporalOrder(session));
    if (options?.serverConsentRecords) {
      issues.push(
        ...collectSessionConsentAuthorizationIssues(
          session,
          options.serverConsentRecords,
        ),
      );
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, session: payload as ActivitySessionV1 };
}
