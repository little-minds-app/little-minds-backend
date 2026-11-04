/**
 * Deterministic synthetic seed fixtures (LMP-22 / Blueprint §26.2).
 * Fictional ages 24, 32, 47, 59, 71 months. No real PII / child data.
 */
import { PrismaClient, ConsentStatus, ParentAccountLifecycle } from '@prisma/client';
import {
  SEED_AGE_REFERENCE_DATE,
  SEED_IDS,
  SHAPE_MATCHING_PUBLICATION,
  SYNTHETIC_AGE_MONTHS,
  syntheticNickname,
} from './seed-data';
import { seedShapeMatchingPublishedContent } from './seed-shape-matching-content';

export {
  SEED_AGE_REFERENCE_DATE,
  SEED_IDS,
  SHAPE_MATCHING_PUBLICATION,
  SYNTHETIC_AGE_MONTHS,
  syntheticNickname,
} from './seed-data';

const prisma = new PrismaClient();

export async function seedSyntheticFixtures(
  client: PrismaClient = prisma,
): Promise<{ parentId: string; childIds: string[]; ages: number[] }> {
  const parent = await client.parentAccount.upsert({
    where: { id: SEED_IDS.parent },
    update: {
      locale: 'tr-TR',
      timezone: 'Europe/Istanbul',
      lifecycle: ParentAccountLifecycle.active,
      deletedAt: null,
      authSubject: 'synthetic-auth-subject-local-only',
    },
    create: {
      id: SEED_IDS.parent,
      authSubject: 'synthetic-auth-subject-local-only',
      locale: 'tr-TR',
      timezone: 'Europe/Istanbul',
      lifecycle: ParentAccountLifecycle.active,
    },
  });

  await client.parentIdentity.upsert({
    where: {
      provider_providerSubject: {
        provider: 'synthetic_local',
        providerSubject: 'seed-parent-001',
      },
    },
    update: {
      parentId: parent.id,
      verifiedContact: 'synthetic.parent@example.test',
      unlinkedAt: null,
    },
    create: {
      id: SEED_IDS.parentIdentity,
      parentId: parent.id,
      provider: 'synthetic_local',
      providerSubject: 'seed-parent-001',
      verifiedContact: 'synthetic.parent@example.test',
      verifiedAt: new Date('2026-01-01T12:00:00.000Z'),
      linkedAt: new Date('2026-01-01T12:00:00.000Z'),
    },
  });

  await client.parentProfile.upsert({
    where: { parentId: parent.id },
    update: {
      firstName: 'Synthetic',
      lastName: 'Parent',
      ageBandOptional: '35–44',
      genderOptional: 'prefer_not_to_say',
      numberOfChildrenOptional: SYNTHETIC_AGE_MONTHS.length,
      occupationOptional: 'prefer_not_to_say',
      collectionNoticeVersion: 'synthetic-notice-v1',
    },
    create: {
      parentId: parent.id,
      firstName: 'Synthetic',
      lastName: 'Parent',
      ageBandOptional: '35–44',
      genderOptional: 'prefer_not_to_say',
      numberOfChildrenOptional: SYNTHETIC_AGE_MONTHS.length,
      occupationOptional: 'prefer_not_to_say',
      collectionNoticeVersion: 'synthetic-notice-v1',
    },
  });

  await client.privacyNoticeAcknowledgment.upsert({
    where: { id: SEED_IDS.notice },
    update: {
      parentId: parent.id,
      noticeVersion: 'synthetic-notice-v1',
      locale: 'tr-TR',
      surface: 'local_seed',
    },
    create: {
      id: SEED_IDS.notice,
      parentId: parent.id,
      noticeVersion: 'synthetic-notice-v1',
      locale: 'tr-TR',
      presentedAt: new Date('2026-01-01T12:00:00.000Z'),
      acknowledgedAt: new Date('2026-01-01T12:01:00.000Z'),
      surface: 'local_seed',
    },
  });

  await client.processingPreference.upsert({
    where: { id: SEED_IDS.processingAnalytics },
    update: {
      parentId: parent.id,
      purpose: 'optional_analytics',
      status: ConsentStatus.withdrawn,
      legalBasis: 'consent',
      policyVersion: 'synthetic-policy-v1',
      source: 'local_seed',
      changedAt: new Date('2026-01-01T12:02:00.000Z'),
    },
    create: {
      id: SEED_IDS.processingAnalytics,
      parentId: parent.id,
      purpose: 'optional_analytics',
      status: ConsentStatus.withdrawn,
      legalBasis: 'consent',
      policyVersion: 'synthetic-policy-v1',
      changedAt: new Date('2026-01-01T12:02:00.000Z'),
      source: 'local_seed',
    },
  });

  await client.consentRecord.upsert({
    where: { id: SEED_IDS.consentEssential },
    update: {
      parentId: parent.id,
      purpose: 'essential_service',
      policyVersion: 'synthetic-policy-v1',
      status: ConsentStatus.granted,
      source: 'local_seed',
      revokedAt: null,
    },
    create: {
      id: SEED_IDS.consentEssential,
      parentId: parent.id,
      purpose: 'essential_service',
      policyVersion: 'synthetic-policy-v1',
      status: ConsentStatus.granted,
      recordedAt: new Date('2026-01-01T12:01:30.000Z'),
      source: 'local_seed',
    },
  });

  await client.consentRecord.upsert({
    where: { id: SEED_IDS.consentPlayEventsParent },
    update: {
      parentId: parent.id,
      purpose: 'essential_play_events',
      policyVersion: SHAPE_MATCHING_PUBLICATION.policyVersion,
      status: ConsentStatus.granted,
      source: 'server_consent_store',
      revokedAt: null,
    },
    create: {
      id: SEED_IDS.consentPlayEventsParent,
      parentId: parent.id,
      purpose: 'essential_play_events',
      policyVersion: SHAPE_MATCHING_PUBLICATION.policyVersion,
      status: ConsentStatus.granted,
      recordedAt: new Date('2026-01-01T12:03:00.000Z'),
      source: 'server_consent_store',
    },
  });

  const childIds: string[] = [];
  for (const age of SYNTHETIC_AGE_MONTHS) {
    const id = SEED_IDS.children[age];
    await client.childProfile.upsert({
      where: { id },
      update: {
        parentId: parent.id,
        nicknameOptional: syntheticNickname(age),
        ageMonthsAtReference: age,
        ageReferenceDate: SEED_AGE_REFERENCE_DATE,
        preferredLocale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        deletedAt: null,
        accessibilityPreferencesJson: { reducedMotion: false, seed: true },
      },
      create: {
        id,
        parentId: parent.id,
        nicknameOptional: syntheticNickname(age),
        ageMonthsAtReference: age,
        ageReferenceDate: SEED_AGE_REFERENCE_DATE,
        preferredLocale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        accessibilityPreferencesJson: { reducedMotion: false, seed: true },
      },
    });
    childIds.push(id);

    await client.screenTimePolicy.upsert({
      where: {
        childId_version: { childId: id, version: 1 },
      },
      update: {
        dailyCapSeconds: 900,
        sessionCapSeconds: 300,
        breakIntervalSeconds: 60,
        timezone: 'Europe/Istanbul',
        updatedByParentId: parent.id,
      },
      create: {
        childId: id,
        dailyCapSeconds: 900,
        sessionCapSeconds: 300,
        breakIntervalSeconds: 60,
        timezone: 'Europe/Istanbul',
        version: 1,
        updatedByParentId: parent.id,
      },
    });
  }

  await seedShapeMatchingPublishedContent(client);

  return {
    parentId: parent.id,
    childIds,
    ages: [...SYNTHETIC_AGE_MONTHS],
  };
}

async function main(): Promise<void> {
  const result = await seedSyntheticFixtures();
  console.log(
    JSON.stringify({
      ok: true,
      parentId: result.parentId,
      childCount: result.childIds.length,
      ages: result.ages,
    }),
  );
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
