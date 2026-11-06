import { ReviewStatus } from '@prisma/client';
import {
  SHAPE_MATCHING_SYNTHETIC_PUBLICATION,
  resolveShapeMatchingSeedPolicy,
  shouldPreserveExistingPublication,
} from '../prisma/seed-shape-matching-content';

describe('seedShapeMatchingPublishedContent policy (LMP-134 P1-01)', () => {
  it('allows synthetic publication in development / CI defaults', () => {
    expect(resolveShapeMatchingSeedPolicy({ APP_ENV: 'development' })).toEqual({
      allowSyntheticPublication: true,
      gate: 'local_dev_or_ci',
    });
    expect(resolveShapeMatchingSeedPolicy({ NODE_ENV: 'test' })).toEqual({
      allowSyntheticPublication: true,
      gate: 'local_dev_or_ci',
    });
  });

  it('fail-closed in staging/production unless explicit override', () => {
    expect(
      resolveShapeMatchingSeedPolicy({ APP_ENV: 'staging', NODE_ENV: 'production' }),
    ).toEqual({
      allowSyntheticPublication: false,
      gate: 'staging_production_blocked',
    });
    expect(
      resolveShapeMatchingSeedPolicy({
        APP_ENV: 'production',
        NODE_ENV: 'production',
        LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH: 'true',
      }),
    ).toEqual({
      allowSyntheticPublication: false,
      gate: 'staging_production_blocked',
    });
  });

  it('preserves archived/rejected and non-synthetic published metadata on replay', () => {
    expect(
      shouldPreserveExistingPublication({
        reviewStatus: ReviewStatus.archived,
        configurationJson: { publication: SHAPE_MATCHING_SYNTHETIC_PUBLICATION },
      }),
    ).toBe(true);
    expect(
      shouldPreserveExistingPublication({
        reviewStatus: ReviewStatus.rejected,
        configurationJson: {},
      }),
    ).toBe(true);
    expect(
      shouldPreserveExistingPublication({
        reviewStatus: ReviewStatus.published,
        configurationJson: { publication: 'lmp-69-release-manifest' },
      }),
    ).toBe(true);
    expect(
      shouldPreserveExistingPublication({
        reviewStatus: ReviewStatus.published,
        configurationJson: { publication: SHAPE_MATCHING_SYNTHETIC_PUBLICATION },
      }),
    ).toBe(false);
  });
});
