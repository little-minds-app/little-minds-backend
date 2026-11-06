import {
  publicationReadinessForAppEnv,
  SHAPE_MATCHING_PUBLICATION_READINESS,
} from '../src/content/shape-matching-publication-readiness';

describe('Shape Matching publication readiness matrix (LMP-134 §2)', () => {
  it('documents all APP_ENV rows', () => {
    expect(SHAPE_MATCHING_PUBLICATION_READINESS.map((row) => row.app_env)).toEqual(
      ['development', 'staging', 'production'],
    );
  });

  it('allows synthetic seed only in development by default', () => {
    expect(publicationReadinessForAppEnv('development').synthetic_catalog_seed).toBe(
      true,
    );
    expect(publicationReadinessForAppEnv('staging').synthetic_catalog_seed).toBe(
      false,
    );
    expect(
      publicationReadinessForAppEnv('production').synthetic_catalog_seed,
    ).toBe(false);
  });

  it('never enables production via unsafe override', () => {
    expect(
      publicationReadinessForAppEnv('production', {
        LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH: 'true',
      }).synthetic_catalog_seed,
    ).toBe(false);
    expect(
      publicationReadinessForAppEnv('staging', {
        LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH: 'true',
      }).synthetic_catalog_seed,
    ).toBe(true);
  });

  it('never treats client fixture as production auth', () => {
    for (const row of SHAPE_MATCHING_PUBLICATION_READINESS) {
      expect(row.client_fixture_as_prod_auth).toBe(false);
    }
  });
});
