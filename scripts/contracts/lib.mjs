import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');
export const OPENAPI_PATH = join(ROOT, 'contracts', 'openapi.yaml');
export const VERSION_PATH = join(ROOT, 'contracts', 'VERSION');
export const COMPAT_PATH = join(
  ROOT,
  'contracts',
  'compatibility',
  'required-contract.json',
);
export const GENERATED_TS_DIR = join(ROOT, 'contracts', 'generated', 'typescript');
export const GENERATED_DART_DIR = join(ROOT, 'contracts', 'generated', 'dart');

export function readVersion() {
  return readFileSync(VERSION_PATH, 'utf8').trim();
}

export function readOpenApiDocument() {
  const raw = readFileSync(OPENAPI_PATH, 'utf8');
  return parseYaml(raw);
}

export function readCompatibility() {
  return JSON.parse(readFileSync(COMPAT_PATH, 'utf8'));
}
