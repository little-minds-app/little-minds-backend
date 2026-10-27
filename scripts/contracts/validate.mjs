#!/usr/bin/env node
/**
 * Validate contracts/openapi.yaml as a resolvable OpenAPI 3 document
 * and enforce info.version === contracts/VERSION.
 */
import SwaggerParser from '@apidevtools/swagger-parser';
import { OPENAPI_PATH, readOpenApiDocument, readVersion } from './lib.mjs';

async function main() {
  const version = readVersion();
  const doc = readOpenApiDocument();

  if (!doc.openapi || !String(doc.openapi).startsWith('3.')) {
    throw new Error(`Expected OpenAPI 3.x, got ${String(doc.openapi)}`);
  }

  if (doc.info?.version !== version) {
    throw new Error(
      `OpenAPI info.version (${doc.info?.version}) must match contracts/VERSION (${version})`,
    );
  }

  const api = await SwaggerParser.validate(OPENAPI_PATH);
  const pathCount = Object.keys(api.paths ?? {}).length;
  console.log(
    `PASS contracts:validate — OpenAPI ${api.openapi} "${api.info.title}" v${api.info.version} (${pathCount} path(s))`,
  );
}

main().catch((err) => {
  console.error(`FAIL contracts:validate — ${err.message}`);
  process.exit(1);
});
