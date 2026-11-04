import { PrismaClient, Prisma } from '@prisma/client';
import {
  SEED_IDS,
  SYNTHETIC_AGE_MONTHS,
  seedSyntheticFixtures,
} from '../prisma/seed';

const databaseUrl = process.env.DATABASE_URL;

const describeDb = databaseUrl ? describe : describe.skip;

describeDb('Prisma migrate + seed integrity (LMP-22)', () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.childProfile.deleteMany({
      where: { parentId: SEED_IDS.parent, nicknameOptional: 'invalid-age' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects to PostgreSQL', async () => {
    await expect(prisma.$queryRaw`SELECT 1 AS ok`).resolves.toBeDefined();
  });

  it('seeds exactly the five synthetic age profiles under one parent', async () => {
    const result = await seedSyntheticFixtures(prisma);
    expect(result.ages).toEqual([24, 32, 47, 59, 71]);
    expect(result.parentId).toBe(SEED_IDS.parent);

    const children = await prisma.childProfile.findMany({
      where: { parentId: SEED_IDS.parent, deletedAt: null },
      orderBy: { ageMonthsAtReference: 'asc' },
    });

    expect(children).toHaveLength(SYNTHETIC_AGE_MONTHS.length);
    expect(children.map((c) => c.ageMonthsAtReference)).toEqual([
      ...SYNTHETIC_AGE_MONTHS,
    ]);
    expect(children.map((c) => c.id).sort()).toEqual(
      Object.values(SEED_IDS.children).slice().sort(),
    );
  });

  it('is idempotent when seed runs twice', async () => {
    await seedSyntheticFixtures(prisma);
    await seedSyntheticFixtures(prisma);
    const count = await prisma.childProfile.count({
      where: { parentId: SEED_IDS.parent, deletedAt: null },
    });
    expect(count).toBe(5);
  });

  it('rejects out-of-range child age months (DB check)', async () => {
    let thrown: unknown;
    try {
      await prisma.childProfile.create({
        data: {
          parentId: SEED_IDS.parent,
          nicknameOptional: 'invalid-age',
          ageMonthsAtReference: 72,
          ageReferenceDate: new Date('2026-01-15T00:00:00.000Z'),
          preferredLocale: 'tr-TR',
        },
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeDefined();
    expect(
      thrown instanceof Prisma.PrismaClientKnownRequestError ||
        thrown instanceof Prisma.PrismaClientUnknownRequestError,
    ).toBe(true);
    expect(String(thrown)).toMatch(/age_months|check constraint|P2010/i);
  });

  it('seeds published Shape Matching content_version_id (LMP-134)', async () => {
    const variant = await prisma.activityVariant.findUnique({
      where: { id: SEED_IDS.shapeMatching.contentVersionId },
      include: { activity: { include: { mechanic: true } } },
    });
    expect(variant?.reviewStatus).toBe('published');
    expect(variant?.activity.status).toBe('published');
    expect(variant?.activity.mechanic.code).toBe('shape_matching');
  });

  it('keeps parent ownership FK for seeded children', async () => {
    const orphans = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM child_profiles c
      LEFT JOIN parent_accounts p ON p.id = c.parent_id
      WHERE p.id IS NULL
    `;
    expect(Number(orphans[0]?.count ?? -1)).toBe(0);
  });
});
