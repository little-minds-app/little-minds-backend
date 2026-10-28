import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';
import type { LivenessStatus, ReadinessStatus } from '../src/modules/health/health.service';

const ROOT = join(__dirname, '..');
const OPENAPI_PATH = join(ROOT, 'contracts', 'openapi.yaml');
const VERSION_PATH = join(ROOT, 'contracts', 'VERSION');
const COMPAT_PATH = join(
  ROOT,
  'contracts',
  'compatibility',
  'required-contract.json',
);

type OpenApiDoc = {
  openapi: string;
  info: { version: string; title: string };
  paths: Record<
    string,
    {
      get?: {
        operationId?: string;
        responses?: Record<
          string,
          {
            content?: {
              'application/json'?: { schema?: { $ref?: string } };
            };
          }
        >;
      };
    }
  >;
  components: {
    schemas: {
      HealthStatus: {
        type: string;
        required: string[];
        additionalProperties?: boolean;
        properties: Record<string, Record<string, unknown>>;
      };
      ReadinessStatus: {
        type: string;
        required: string[];
        additionalProperties?: boolean;
        properties: Record<string, Record<string, unknown>>;
      };
    };
  };
};

describe('OpenAPI contract (LMP-23)', () => {
  const version = readFileSync(VERSION_PATH, 'utf8').trim();
  const doc = parseYaml(readFileSync(OPENAPI_PATH, 'utf8')) as OpenApiDoc;

  it('keeps info.version synced with contracts/VERSION', () => {
    expect(doc.info.version).toBe(version);
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('declares OpenAPI 3.x and passes swagger-parser validate script', () => {
    expect(doc.openapi.startsWith('3.')).toBe(true);
    expect(doc.info.title).toContain('Little Minds');
    const result = spawnSync('npm', ['run', 'contracts:validate'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
  });

  it('passes compatibility allowlist / required-field gate', () => {
    const result = spawnSync('npm', ['run', 'contracts:compat'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
  });

  it('scopes paths to health + LMP-33 auth allowlist (no invented product APIs)', () => {
    const compat = JSON.parse(readFileSync(COMPAT_PATH, 'utf8')) as {
      allowedPaths: string[];
    };
    expect(Object.keys(doc.paths).sort()).toEqual(
      [...compat.allowedPaths].sort(),
    );
    expect(compat.allowedPaths).toEqual(
      expect.arrayContaining([
        '/health',
        '/health/ready',
        '/v1/auth/token/refresh',
        '/v1/parent/me',
      ]),
    );
    expect(compat.allowedPaths).not.toContain('/v1/auth/ownership-check');
  });

  it('describes GET /health HealthStatus matching Nest liveness payload', () => {
    const health = doc.paths['/health'];
    expect(health.get?.operationId).toBe('getHealth');
    expect(
      health.get?.responses?.['200']?.content?.['application/json']?.schema
        ?.$ref,
    ).toBe('#/components/schemas/HealthStatus');

    const schema = doc.components.schemas.HealthStatus;
    expect(schema.required.sort()).toEqual(
      ['service', 'status', 'timestamp'].sort(),
    );
    expect(schema.additionalProperties).toBe(false);

    const sample: LivenessStatus = {
      status: 'ok',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
    };
    expect(Object.keys(sample).sort()).toEqual(schema.required.sort());
  });

  it('describes GET /health/ready ReadinessStatus', () => {
    const ready = doc.paths['/health/ready'];
    expect(ready.get?.operationId).toBe('getHealthReady');
    expect(
      ready.get?.responses?.['200']?.content?.['application/json']?.schema
        ?.$ref,
    ).toBe('#/components/schemas/ReadinessStatus');
    expect(
      ready.get?.responses?.['503']?.content?.['application/json']?.schema
        ?.$ref,
    ).toBe('#/components/schemas/ReadinessStatus');

    const schema = doc.components.schemas.ReadinessStatus;
    expect(schema.required.sort()).toEqual(
      ['checks', 'service', 'status', 'timestamp'].sort(),
    );
  });

  it('Ajv-validates liveness and readiness payloads against OpenAPI schemas', () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validateLive = ajv.compile(doc.components.schemas.HealthStatus);
    const validateReady = ajv.compile(doc.components.schemas.ReadinessStatus);

    const live: LivenessStatus = {
      status: 'ok',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
    };
    const ready: ReadinessStatus = {
      status: 'ok',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
      checks: { database: 'skipped' },
    };
    const notReady: ReadinessStatus = {
      status: 'not_ready',
      service: 'little-minds-backend',
      timestamp: new Date().toISOString(),
      checks: { database: 'down' },
    };

    expect(validateLive(live)).toBe(true);
    expect(validateReady(ready)).toBe(true);
    expect(validateReady(notReady)).toBe(true);
  });

  it('ships generated TypeScript and Dart client entrypoints', () => {
    const ts = join(ROOT, 'contracts/generated/typescript/schema.ts');
    const dartApi = join(ROOT, 'contracts/generated/dart/lib/api.dart');
    expect(readFileSync(ts, 'utf8')).toContain('HealthStatus');
    expect(readFileSync(ts, 'utf8')).toContain('ReadinessStatus');
    expect(readFileSync(dartApi, 'utf8')).toMatch(/Health|health/i);
  });
});
