import { readFileSync } from 'node:fs';
import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import {
  mentorCardSchemaPath,
  mentorCardSchemaVersionPath,
  resolveContentRoot,
} from './mentor-card.paths';
import { validateMentorCardSafeCopy } from './mentor-card.safe-copy';
import {
  MENTOR_CARD_SCHEMA_VERSION,
  type MentorCardV1,
  type MentorCardValidationIssue,
  type MentorCardValidationResult,
} from './mentor-card.types';

let cachedValidate: ValidateFunction | undefined;
let cachedSchemaVersion: string | undefined;

function loadSchemaDocument(contentRoot?: string): {
  schema: object;
  versionFile: string;
} {
  const root = contentRoot ?? resolveContentRoot();
  const schemaRaw = readFileSync(mentorCardSchemaPath(root), 'utf8');
  const versionFile = readFileSync(mentorCardSchemaVersionPath(root), 'utf8').trim();
  return { schema: JSON.parse(schemaRaw) as object, versionFile };
}

export function getMentorCardSchemaVersion(contentRoot?: string): string {
  if (!cachedSchemaVersion) {
    cachedSchemaVersion = loadSchemaDocument(contentRoot).versionFile;
  }
  return cachedSchemaVersion;
}

function getAjvValidator(contentRoot?: string): ValidateFunction {
  if (cachedValidate) {
    return cachedValidate;
  }
  const { schema, versionFile } = loadSchemaDocument(contentRoot);
  if (versionFile !== MENTOR_CARD_SCHEMA_VERSION) {
    throw new Error(
      `Mentor card VERSION (${versionFile}) must match MENTOR_CARD_SCHEMA_VERSION (${MENTOR_CARD_SCHEMA_VERSION})`,
    );
  }
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateSchema: true,
  });
  addFormats(ajv);
  cachedValidate = ajv.compile(schema);
  cachedSchemaVersion = versionFile;
  return cachedValidate;
}

/** Test-only: clear Ajv cache when swapping fixtures roots. */
export function resetMentorCardValidatorCache(): void {
  cachedValidate = undefined;
  cachedSchemaVersion = undefined;
}

function mapAjvErrors(
  errors: ErrorObject[] | null | undefined,
): MentorCardValidationIssue[] {
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

function validateAgeRange(card: MentorCardV1): MentorCardValidationIssue[] {
  const issues: MentorCardValidationIssue[] = [];
  if (card.age_min_months > card.age_max_months) {
    issues.push({
      code: 'age.range_order',
      path: 'age_min_months',
      message: 'age_min_months must be <= age_max_months',
    });
  }
  return issues;
}

function validateScriptConsistency(
  card: MentorCardV1,
): MentorCardValidationIssue[] {
  const issues: MentorCardValidationIssue[] = [];
  const pairs: Array<[string[], string[], string]> = [
    [card.what_to_say.before, card.parent_script_before, 'before'],
    [card.what_to_say.during, card.parent_prompts_during, 'during'],
    [card.what_to_say.after, card.parent_prompts_after, 'after'],
  ];
  for (const [section, alias, label] of pairs) {
    if (JSON.stringify(section) !== JSON.stringify(alias)) {
      issues.push({
        code: 'copy.script_alias_mismatch',
        path: `what_to_say.${label}`,
        message: `what_to_say.${label} must match Blueprint alias array for ${label}`,
      });
    }
  }
  return issues;
}

/**
 * Full mentor-card validation: schema version gate + JSON Schema + age + safe copy.
 */
export function validateMentorCard(
  payload: unknown,
  options?: { contentRoot?: string },
): MentorCardValidationResult {
  const issues: MentorCardValidationIssue[] = [];

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      ok: false,
      issues: [
        {
          code: 'schema.type',
          path: '',
          message: 'Mentor card payload must be a JSON object',
        },
      ],
    };
  }

  const record = payload as Record<string, unknown>;
  const schemaVersion = record.schema_version;

  if (schemaVersion !== MENTOR_CARD_SCHEMA_VERSION) {
    issues.push({
      code: 'schema.version_incompatible',
      path: 'schema_version',
      message: `Unsupported schema_version ${String(schemaVersion)}; expected ${MENTOR_CARD_SCHEMA_VERSION}`,
    });
    return { ok: false, issues };
  }

  const validate = getAjvValidator(options?.contentRoot);
  const schemaOk = validate(payload);
  if (!schemaOk) {
    return { ok: false, issues: mapAjvErrors(validate.errors) };
  }

  const card = payload as MentorCardV1;
  issues.push(...validateAgeRange(card));
  issues.push(...validateScriptConsistency(card));
  issues.push(...validateMentorCardSafeCopy(card));

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, card };
}

/**
 * Hard age eligibility filter (Blueprint §4.5).
 */
export function isMentorCardAgeApplicable(
  card: Pick<MentorCardV1, 'age_min_months' | 'age_max_months'>,
  ageMonths: number,
): boolean {
  if (!Number.isInteger(ageMonths) || ageMonths < 24 || ageMonths > 71) {
    return false;
  }
  return ageMonths >= card.age_min_months && ageMonths <= card.age_max_months;
}
