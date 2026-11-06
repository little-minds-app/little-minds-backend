import type { ShapeMatchingSeedPolicy } from '../../prisma/seed-shape-matching-content';
import { resolveShapeMatchingSeedPolicy } from '../../prisma/seed-shape-matching-content';

export type PublicationReadinessRow = {
  app_env: 'development' | 'staging' | 'production';
  synthetic_catalog_seed: boolean;
  /** Staging-only emergency override; never honored in production. */
  unsafe_env_override: boolean;
  client_fixture_as_prod_auth: boolean;
  gate: ShapeMatchingSeedPolicy['gate'];
};

/**
 * LMP-134 publication readiness matrix (backend authoritative).
 * Clients pin fixture UUIDs for local/CI only — not as production auth/catalog truth.
 */
export const SHAPE_MATCHING_PUBLICATION_READINESS: PublicationReadinessRow[] = [
  {
    app_env: 'development',
    synthetic_catalog_seed: true,
    unsafe_env_override: false,
    client_fixture_as_prod_auth: false,
    gate: 'local_dev_or_ci',
  },
  {
    app_env: 'staging',
    synthetic_catalog_seed: false,
    unsafe_env_override: true,
    client_fixture_as_prod_auth: false,
    gate: 'staging_production_blocked',
  },
  {
    app_env: 'production',
    synthetic_catalog_seed: false,
    unsafe_env_override: false,
    client_fixture_as_prod_auth: false,
    gate: 'staging_production_blocked',
  },
];

export function publicationReadinessForAppEnv(
  appEnv: PublicationReadinessRow['app_env'],
  env?: { LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH?: string },
): PublicationReadinessRow {
  const policy = resolveShapeMatchingSeedPolicy({ APP_ENV: appEnv, ...env });
  const row = SHAPE_MATCHING_PUBLICATION_READINESS.find(
    (entry) => entry.app_env === appEnv,
  );
  if (!row) {
    throw new Error(`Unknown APP_ENV: ${appEnv}`);
  }
  return {
    ...row,
    synthetic_catalog_seed: policy.allowSyntheticPublication,
    gate: policy.gate,
    unsafe_env_override:
      appEnv === 'staging' &&
      env?.LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH === 'true' &&
      policy.allowSyntheticPublication,
  };
}
