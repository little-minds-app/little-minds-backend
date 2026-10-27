#!/usr/bin/env node
/**
 * Fail on breaking removals (unless major VERSION >= allowBreakingRemovalsFromMajor)
 * and on paths outside the LMP-23 allowlist (prevents invented product APIs).
 */
import {
  readCompatibility,
  readOpenApiDocument,
  readVersion,
} from './lib.mjs';

function majorOf(semver) {
  const match = /^(\d+)\./.exec(semver);
  if (!match) {
    throw new Error(`Invalid semver in contracts/VERSION: ${semver}`);
  }
  return Number(match[1]);
}

function resolveSchema(doc, refOrSchema) {
  if (refOrSchema && typeof refOrSchema === 'object' && !refOrSchema.$ref) {
    return refOrSchema;
  }
  const ref = refOrSchema?.$ref ?? refOrSchema;
  if (typeof ref !== 'string' || !ref.startsWith('#/components/schemas/')) {
    throw new Error(`Unsupported schema ref: ${JSON.stringify(refOrSchema)}`);
  }
  const name = ref.slice('#/components/schemas/'.length);
  const schema = doc.components?.schemas?.[name];
  if (!schema) {
    throw new Error(`Missing schema component: ${name}`);
  }
  return schema;
}

function main() {
  const version = readVersion();
  const major = majorOf(version);
  const baseline = readCompatibility();
  const doc = readOpenApiDocument();
  const errors = [];

  const actualPaths = Object.keys(doc.paths ?? {}).sort();
  const allowed = new Set(baseline.allowedPaths);

  for (const path of actualPaths) {
    if (!allowed.has(path)) {
      errors.push(
        `Path outside LMP-23 allowlist (do not invent product APIs): ${path}`,
      );
    }
  }

  const allowBreak = major >= baseline.allowBreakingRemovalsFromMajor;

  for (const op of baseline.requiredOperations) {
    const item = doc.paths?.[op.path];
    if (!item) {
      if (!allowBreak) {
        errors.push(`Missing required path: ${op.path}`);
      }
      continue;
    }
    const operation = item[op.method];
    if (!operation) {
      if (!allowBreak) {
        errors.push(`Missing required operation: ${op.method.toUpperCase()} ${op.path}`);
      }
      continue;
    }
    if (operation.operationId !== op.operationId) {
      errors.push(
        `operationId mismatch for ${op.method.toUpperCase()} ${op.path}: expected ${op.operationId}, got ${operation.operationId}`,
      );
    }
    const response = operation.responses?.[op.responseStatus];
    if (!response) {
      if (!allowBreak) {
        errors.push(
          `Missing response ${op.responseStatus} on ${op.method.toUpperCase()} ${op.path}`,
        );
      }
      continue;
    }
    const media = response.content?.['application/json'];
    if (!media?.schema) {
      errors.push(
        `Missing application/json schema on ${op.method.toUpperCase()} ${op.path} ${op.responseStatus}`,
      );
      continue;
    }
    const schema = resolveSchema(doc, media.schema);
    const required = new Set(schema.required ?? []);
    for (const prop of op.requiredProperties) {
      if (!required.has(prop) && !allowBreak) {
        errors.push(
          `Breaking: required property "${prop}" missing on ${op.path} response schema`,
        );
      }
      if (!schema.properties?.[prop]) {
        errors.push(
          `Missing property "${prop}" on ${op.path} response schema`,
        );
      }
    }
  }

  for (const [name, expected] of Object.entries(baseline.requiredSchemas)) {
    const schema = doc.components?.schemas?.[name];
    if (!schema) {
      if (!allowBreak) {
        errors.push(`Missing required schema: ${name}`);
      }
      continue;
    }
    const required = new Set(schema.required ?? []);
    for (const prop of expected.required) {
      if (!required.has(prop) && !allowBreak) {
        errors.push(`Breaking: schema ${name} missing required "${prop}"`);
      }
    }
    for (const [prop, constraint] of Object.entries(expected.properties)) {
      const actual = schema.properties?.[prop];
      if (!actual) {
        errors.push(`Schema ${name} missing property "${prop}"`);
        continue;
      }
      if (constraint.enum) {
        const actualEnum = actual.enum ?? [];
        for (const value of constraint.enum) {
          if (!actualEnum.includes(value)) {
            errors.push(
              `Schema ${name}.${prop} enum missing value "${value}"`,
            );
          }
        }
      }
      if (constraint.type && actual.type !== constraint.type) {
        errors.push(
          `Schema ${name}.${prop} type expected ${constraint.type}, got ${actual.type}`,
        );
      }
      if (constraint.format && actual.format !== constraint.format) {
        errors.push(
          `Schema ${name}.${prop} format expected ${constraint.format}, got ${actual.format}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error('FAIL contracts:compat');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `PASS contracts:compat — version ${version} (major=${major}); ${actualPaths.length} allowed path(s)`,
  );
}

try {
  main();
} catch (err) {
  console.error(`FAIL contracts:compat — ${err.message}`);
  process.exit(1);
}
