import { readFileSync } from 'node:fs';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import {
  activityDefsSchemaPath,
  activityEventSchemaPath,
  activitySchemaVersionPath,
  resolveActivitySchemaRoot,
} from './activity-contract.paths';
import {
  ACTIVITY_EVENT_TYPES,
  ACTIVITY_SCHEMA_VERSION,
  DURATION_BEARING_EVENT_TYPES,
  PARENT_ONLY_EVENT_TYPES,
  type ActivityEventType,
  type ActivityEventV1,
  type ActivityEventValidationResult,
  type ActivityValidationIssue,
  type DurationBearingEventType,
  type ParentOnlyEventType,
  type ServerConsentRecord,
} from './activity-contract.types';
import { collectConsentAuthorizationIssues } from './activity-event.consent';
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
    readFileSync(activityEventSchemaPath(root), 'utf8'),
  );
  cachedValidate = ajv.compile(schema);
  cachedSchemaVersion = versionFile;
  return cachedValidate;
}

export function getActivityEventSchemaVersion(schemaRoot?: string): string {
  if (!cachedSchemaVersion) {
    cachedSchemaVersion = loadVersion(schemaRoot);
  }
  return cachedSchemaVersion;
}

/** Test-only: clear Ajv cache when swapping fixtures roots. */
export function resetActivityEventValidatorCache(): void {
  cachedValidate = undefined;
  cachedSchemaVersion = undefined;
}

function isDurationBearing(
  eventType: string,
): eventType is DurationBearingEventType {
  return (DURATION_BEARING_EVENT_TYPES as readonly string[]).includes(
    eventType,
  );
}

function isParentOnly(eventType: string): eventType is ParentOnlyEventType {
  return (PARENT_ONLY_EVENT_TYPES as readonly string[]).includes(eventType);
}

function validateActorConsistency(
  event: ActivityEventV1,
): ActivityValidationIssue[] {
  const issues: ActivityValidationIssue[] = [];
  const { actor_scope, source } = event.provenance;

  if (isParentOnly(event.event_type)) {
    if (actor_scope !== 'parent') {
      issues.push({
        code: 'provenance.actor_scope',
        path: 'provenance.actor_scope',
        message: 'Parent-only event requires actor_scope parent',
      });
    }
    if (event.play_session_id !== undefined) {
      issues.push({
        code: 'session.parent_must_omit_play_session',
        path: 'play_session_id',
        message: 'Parent-only events must omit play_session_id',
      });
    }
  } else if (actor_scope !== 'child_play') {
    issues.push({
      code: 'provenance.actor_scope',
      path: 'provenance.actor_scope',
      message: 'Child-play event requires actor_scope child_play',
    });
  }

  if (
    event.event_type === 'mission_feedback_submitted' &&
    source !== 'caregiver_report'
  ) {
    issues.push({
      code: 'provenance.source',
      path: 'provenance.source',
      message: 'mission_feedback_submitted requires source caregiver_report',
    });
  }

  if (isDurationBearing(event.event_type)) {
    if (
      event.monotonic_duration_seconds === undefined ||
      event.monotonic_duration_seconds === null
    ) {
      issues.push({
        code: 'duration.required',
        path: 'monotonic_duration_seconds',
        message:
          'Duration-bearing event requires monotonic_duration_seconds',
      });
    }
  }

  return issues;
}

export type ValidateActivityEventOptions = {
  schemaRoot?: string;
  /**
   * When provided, consent_scope is checked against server-attested records (TC-EV-015).
   * Records must use source server_consent_store | sync_scope_grant.
   */
  serverConsentRecords?: readonly ServerConsentRecord[];
  /**
   * Client decision is accepted for logging/tests only — never authorizes.
   * Passing decision:"granted" without a server grant still fails authorization.
   */
  clientConsentDecision?: string;
};

/**
 * Validate an ActivityEventV1 wire document.
 */
export function validateActivityEvent(
  payload: unknown,
  options?: ValidateActivityEventOptions,
): ActivityEventValidationResult {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      ok: false,
      issues: [
        {
          code: 'schema.type',
          path: '',
          message: 'Activity event payload must be a JSON object',
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
    const event = payload as ActivityEventV1;
    issues.push(...validateActorConsistency(event));

    if (options?.serverConsentRecords) {
      issues.push(
        ...collectConsentAuthorizationIssues(
          event.consent_scope,
          options.serverConsentRecords,
          {
            clientDeclaredDecision: options.clientConsentDecision,
            path: 'consent_scope',
          },
        ),
      );
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, event: payload as ActivityEventV1 };
}

export function isKnownActivityEventType(
  value: string,
): value is ActivityEventType {
  return (ACTIVITY_EVENT_TYPES as readonly string[]).includes(value);
}
