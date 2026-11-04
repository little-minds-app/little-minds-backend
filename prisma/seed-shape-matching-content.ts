/**
 * LMP-134 — publish authoritative Shape Matching content_version_id via Prisma catalog rows.
 * Day-1 stand-in: ActivityVariant.id (see prisma/MAPPING.md) until LMP-69 release manifests ship.
 *
 * LMP-69 dependency: runtime environment release manifests are not implemented. Synthetic
 * `synthetic_local_publish` rows are for local/CI only unless explicitly overridden.
 */
import {
  PrismaClient,
  ReviewStatus,
  type Prisma,
} from '@prisma/client';
import { SEED_IDS, SHAPE_MATCHING_PUBLICATION } from './seed-data';

/** Marker in activity_variants.configuration_json — identifies seed-owned publication. */
export const SHAPE_MATCHING_SYNTHETIC_PUBLICATION = 'lmp-134-seed-v1';

export const SHAPE_MATCHING_SYNTHETIC_REVIEW_TYPE = 'synthetic_local_publish';

export type ShapeMatchingSeedEnv = {
  APP_ENV?: string;
  NODE_ENV?: string;
  LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH?: string;
};

export type ShapeMatchingSeedPolicy = {
  allowSyntheticPublication: boolean;
  /** Human-readable gate reason for logs/tests. */
  gate: 'local_dev_or_ci' | 'staging_production_blocked' | 'explicit_override';
};

/**
 * Fail-closed: staging/production must not upsert synthetic published catalog rows
 * unless LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH=true (non-production emergency only).
 */
function readSeedEnv(env?: ShapeMatchingSeedEnv): ShapeMatchingSeedEnv {
  return {
    APP_ENV: env?.APP_ENV ?? process.env.APP_ENV,
    NODE_ENV: env?.NODE_ENV ?? process.env.NODE_ENV,
    LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH:
      env?.LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH ??
      process.env.LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH,
  };
}

export function resolveShapeMatchingSeedPolicy(
  env?: ShapeMatchingSeedEnv,
): ShapeMatchingSeedPolicy {
  const resolved = readSeedEnv(env);
  const appEnv = resolved.APP_ENV ?? 'development';
  if (appEnv === 'staging' || appEnv === 'production') {
    if (resolved.LM_ALLOW_SYNTHETIC_CONTENT_PUBLISH === 'true') {
      return { allowSyntheticPublication: true, gate: 'explicit_override' };
    }
    return {
      allowSyntheticPublication: false,
      gate: 'staging_production_blocked',
    };
  }
  return { allowSyntheticPublication: true, gate: 'local_dev_or_ci' };
}

export type ExistingVariantPublication = {
  reviewStatus: ReviewStatus;
  configurationJson: unknown;
};

/**
 * When true, seed replay must not mutate review_status or publication metadata.
 * Honors archived/rejected (unpublish) and non-synthetic published rows.
 */
export function shouldPreserveExistingPublication(
  existing: ExistingVariantPublication | null | undefined,
): boolean {
  if (!existing) {
    return false;
  }
  if (
    existing.reviewStatus === ReviewStatus.archived ||
    existing.reviewStatus === ReviewStatus.rejected
  ) {
    return true;
  }
  if (existing.reviewStatus === ReviewStatus.published) {
    const config = existing.configurationJson as Record<string, unknown> | null;
    if (config?.publication !== SHAPE_MATCHING_SYNTHETIC_PUBLICATION) {
      return true;
    }
  }
  return false;
}

export type ShapeMatchingSeedResult = {
  contentVersionId: string;
  skipped?: 'policy' | 'unpublished_state';
};

export async function seedShapeMatchingPublishedContent(
  client: PrismaClient,
  env?: ShapeMatchingSeedEnv,
): Promise<ShapeMatchingSeedResult> {
  const policy = resolveShapeMatchingSeedPolicy(env);
  const ids = SEED_IDS.shapeMatching;

  if (!policy.allowSyntheticPublication) {
    return { contentVersionId: ids.contentVersionId, skipped: 'policy' };
  }

  const existingVariant = await client.activityVariant.findUnique({
    where: { id: ids.contentVersionId },
    select: { reviewStatus: true, configurationJson: true },
  });
  if (
    existingVariant &&
    (existingVariant.reviewStatus === ReviewStatus.archived ||
      existingVariant.reviewStatus === ReviewStatus.rejected)
  ) {
    return { contentVersionId: ids.contentVersionId, skipped: 'unpublished_state' };
  }

  const preservePublication = shouldPreserveExistingPublication(existingVariant);

  await client.learningDomain.upsert({
    where: { code: SHAPE_MATCHING_PUBLICATION.domainCode },
    update: { labelKey: 'learning.domain.shapes_and_patterns' },
    create: {
      id: ids.learningDomain,
      code: SHAPE_MATCHING_PUBLICATION.domainCode,
      labelKey: 'learning.domain.shapes_and_patterns',
    },
  });

  await client.learningGoal.upsert({
    where: { id: ids.learningGoal },
    update: {
      domainId: ids.learningDomain,
      objectiveKey: SHAPE_MATCHING_PUBLICATION.objectiveKey,
      ...(preservePublication ? {} : { reviewStatus: ReviewStatus.published }),
    },
    create: {
      id: ids.learningGoal,
      domainId: ids.learningDomain,
      objectiveKey: SHAPE_MATCHING_PUBLICATION.objectiveKey,
      reviewStatus: ReviewStatus.published,
    },
  });

  await client.gameMechanic.upsert({
    where: { code: SHAPE_MATCHING_PUBLICATION.mechanicCode },
    update: { engineVersion: '1.0.0' },
    create: {
      id: ids.gameMechanic,
      code: SHAPE_MATCHING_PUBLICATION.mechanicCode,
      engineVersion: '1.0.0',
    },
  });

  await client.activityDefinition.upsert({
    where: { id: ids.activityDefinition },
    update: {
      mechanicId: ids.gameMechanic,
      learningGoalId: ids.learningGoal,
      minAgeMonths: 24,
      maxAgeMonths: 71,
      safetyClass: 'low',
      ...(preservePublication ? {} : { status: ReviewStatus.published }),
    },
    create: {
      id: ids.activityDefinition,
      mechanicId: ids.gameMechanic,
      learningGoalId: ids.learningGoal,
      minAgeMonths: 24,
      maxAgeMonths: 71,
      safetyClass: 'low',
      status: ReviewStatus.published,
    },
  });

  const configurationJson: Prisma.InputJsonValue = {
    hub_activity_id: SHAPE_MATCHING_PUBLICATION.hubActivityId,
    publication: SHAPE_MATCHING_SYNTHETIC_PUBLICATION,
  };

  if (existingVariant) {
    if (!preservePublication) {
      await client.activityVariant.update({
        where: { id: ids.contentVersionId },
        data: {
          activityId: ids.activityDefinition,
          version: SHAPE_MATCHING_PUBLICATION.variantVersion,
          locale: 'tr-TR',
          reviewStatus: ReviewStatus.published,
          configurationJson,
        },
      });
    } else {
      await client.activityVariant.update({
        where: { id: ids.contentVersionId },
        data: {
          activityId: ids.activityDefinition,
          version: SHAPE_MATCHING_PUBLICATION.variantVersion,
          locale: 'tr-TR',
        },
      });
    }
  } else {
    await client.activityVariant.create({
      data: {
        id: ids.contentVersionId,
        activityId: ids.activityDefinition,
        version: SHAPE_MATCHING_PUBLICATION.variantVersion,
        locale: 'tr-TR',
        reviewStatus: ReviewStatus.published,
        configurationJson,
      },
    });
  }

  const existingReview = await client.contentReview.findUnique({
    where: { id: ids.contentReview },
    select: { decision: true, reviewType: true },
  });
  const reviewRevoked =
    !!existingReview && existingReview.decision !== 'approved';

  if (!reviewRevoked && !preservePublication) {
    await client.contentReview.upsert({
      where: { id: ids.contentReview },
      update: {
        entityType: 'activity_variant',
        entityId: ids.contentVersionId,
        version: '1',
        reviewType: SHAPE_MATCHING_SYNTHETIC_REVIEW_TYPE,
        reviewerId: 'synthetic-reviewer-lmp134',
        decision: 'approved',
        notes:
          'LMP-134 local/staging publication; not LMP-69 environment manifest.',
      },
      create: {
        id: ids.contentReview,
        entityType: 'activity_variant',
        entityId: ids.contentVersionId,
        version: '1',
        reviewType: SHAPE_MATCHING_SYNTHETIC_REVIEW_TYPE,
        reviewerId: 'synthetic-reviewer-lmp134',
        decision: 'approved',
        notes:
          'LMP-134 local/staging publication; not LMP-69 environment manifest.',
      },
    });
  }

  return { contentVersionId: ids.contentVersionId };
}
