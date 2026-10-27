import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');

/**
 * Optional override for negative / fixture runs (LMP-27).
 * Point at a directory that mirrors contracts/ (openapi.yaml, VERSION, compatibility/).
 * Happy-path CI leaves this unset and uses repo contracts/.
 */
function resolveContractsRoot() {
  const override = process.env.LM_CONTRACTS_ROOT?.trim();
  if (!override) {
    return join(ROOT, 'contracts');
  }
  return isAbsolute(override) ? override : resolve(ROOT, override);
}

export const CONTRACTS_ROOT = resolveContractsRoot();
export const OPENAPI_PATH = join(CONTRACTS_ROOT, 'openapi.yaml');
export const VERSION_PATH = join(CONTRACTS_ROOT, 'VERSION');
export const COMPAT_PATH = join(
  CONTRACTS_ROOT,
  'compatibility',
  'required-contract.json',
);
export const GENERATED_TS_DIR = join(CONTRACTS_ROOT, 'generated', 'typescript');
export const GENERATED_DART_DIR = join(CONTRACTS_ROOT, 'generated', 'dart');

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
