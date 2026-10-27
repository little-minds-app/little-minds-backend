import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';
import { HealthService } from '../src/modules/health/health.service';

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

  it('scopes paths to health only (no invented product APIs)', () => {
    const compat = JSON.parse(readFileSync(COMPAT_PATH, 'utf8')) as {
      allowedPaths: string[];
    };
    expect(Object.keys(doc.paths).sort()).toEqual(
      [...compat.allowedPaths].sort(),
    );
  });

  it('describes GET /health HealthStatus matching Nest HealthService', () => {
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

    const sample = new HealthService().getLiveness();
    expect(Object.keys(sample).sort()).toEqual(schema.required.sort());
    expect(sample.status).toBe('ok');
    expect(sample.service).toBe('little-minds-backend');
  });

  it('Ajv-validates a live HealthService payload against HealthStatus schema', () => {
    const schema = doc.components.schemas.HealthStatus;
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const payload = new HealthService().getLiveness();
    expect(validate(payload)).toBe(true);
  });

  it('ships generated TypeScript and Dart client entrypoints', () => {
    const ts = join(ROOT, 'contracts/generated/typescript/schema.ts');
    const dartApi = join(ROOT, 'contracts/generated/dart/lib/api.dart');
    expect(readFileSync(ts, 'utf8')).toContain('HealthStatus');
    expect(readFileSync(dartApi, 'utf8')).toMatch(/Health|health/i);
  });
});
