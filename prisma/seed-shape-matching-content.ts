/**
 * LMP-134 — publish authoritative Shape Matching content_version_id via Prisma catalog rows.
 * Day-1 stand-in: ActivityVariant.id (see prisma/MAPPING.md) until LMP-69 release manifests ship.
 */
import {
  PrismaClient,
  ReviewStatus,
  type Prisma,
} from '@prisma/client';
import { SEED_IDS, SHAPE_MATCHING_PUBLICATION } from './seed-data';

export async function seedShapeMatchingPublishedContent(
  client: PrismaClient,
): Promise<{ contentVersionId: string }> {
  const ids = SEED_IDS.shapeMatching;

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
      reviewStatus: ReviewStatus.published,
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
      status: ReviewStatus.published,
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
    publication: 'lmp-134-seed-v1',
  };

  await client.activityVariant.upsert({
    where: { id: ids.contentVersionId },
    update: {
      activityId: ids.activityDefinition,
      version: SHAPE_MATCHING_PUBLICATION.variantVersion,
      locale: 'tr-TR',
      reviewStatus: ReviewStatus.published,
      configurationJson,
    },
    create: {
      id: ids.contentVersionId,
      activityId: ids.activityDefinition,
      version: SHAPE_MATCHING_PUBLICATION.variantVersion,
      locale: 'tr-TR',
      reviewStatus: ReviewStatus.published,
      configurationJson,
    },
  });

  await client.contentReview.upsert({
    where: { id: ids.contentReview },
    update: {
      entityType: 'activity_variant',
      entityId: ids.contentVersionId,
      version: '1',
      reviewType: 'synthetic_local_publish',
      reviewerId: 'synthetic-reviewer-lmp134',
      decision: 'approved',
      notes: 'LMP-134 local/staging publication; not LMP-69 environment manifest.',
    },
    create: {
      id: ids.contentReview,
      entityType: 'activity_variant',
      entityId: ids.contentVersionId,
      version: '1',
      reviewType: 'synthetic_local_publish',
      reviewerId: 'synthetic-reviewer-lmp134',
      decision: 'approved',
      notes: 'LMP-134 local/staging publication; not LMP-69 environment manifest.',
    },
  });

  return { contentVersionId: ids.contentVersionId };
}
