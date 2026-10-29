/**
 * Real PostgreSQL step-up challenge consume: positive, replay, cross-parent.
 */
import { ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { StepUpService } from '../src/modules/identity/linking/step-up.service';
import {
  STEP_UP_PURPOSE_IDENTITY_LINK,
  STEP_UP_TTL_SECONDS,
} from '../src/modules/identity/linking/step-up.constants';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb('Auth step-up challenges against PostgreSQL (LMP-36 P1)', () => {
  const prisma = new PrismaClient();
  let stepUp: StepUpService;
  const parentIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();
    const prismaService = {
      get db() {
        return prisma;
      },
    } as unknown as PrismaService;
    stepUp = new StepUpService(
      prismaService,
      {
        consumeStepUpIp: () => undefined,
        consumeStepUpParent: () => undefined,
      } as never,
      {
        requireActiveSession: async () => undefined,
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  afterAll(async () => {
    if (parentIds.length > 0) {
      await prisma.authStepUpChallenge.deleteMany({
        where: { parentId: { in: parentIds } },
      });
      await prisma.parentAccount.deleteMany({
        where: { id: { in: parentIds } },
      });
    }
    await prisma.$disconnect();
  });

  async function seedParent(): Promise<string> {
    const id = randomUUID();
    await prisma.parentAccount.create({
      data: {
        id,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
    });
    parentIds.push(id);
    return id;
  }

  it('migrated auth_step_up_challenges exists', async () => {
    const tables = await prisma.$queryRaw<Array<{ relname: string }>>`
      SELECT relname FROM pg_class
      WHERE relname = 'auth_step_up_challenges' AND relkind = 'r'
    `;
    expect(tables).toHaveLength(1);
  });

  it('consume succeeds once; replay and cross-parent fail', async () => {
    const parentA = await seedParent();
    const parentB = await seedParent();
    const sessionA = randomUUID();
    const plaintext = `lms1.${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`;
    const tokenHash = StepUpService.hashToken(plaintext);
    const expiresAt = new Date(Date.now() + STEP_UP_TTL_SECONDS * 1000);

    await prisma.authStepUpChallenge.create({
      data: {
        id: randomUUID(),
        tokenHash,
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        provider: 'phone',
        expiresAt,
      },
    });

    await prisma.$transaction((tx) =>
      stepUp.consumeIdentityLinkTx(tx, {
        stepUpToken: plaintext,
        parentId: parentA,
        sessionId: sessionA,
      }),
    );

    await expect(
      prisma.$transaction((tx) =>
        stepUp.consumeIdentityLinkTx(tx, {
          stepUpToken: plaintext,
          parentId: parentA,
          sessionId: sessionA,
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // Fresh token for cross-parent negative
    const plain2 = `lms1.${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`;
    await prisma.authStepUpChallenge.create({
      data: {
        id: randomUUID(),
        tokenHash: StepUpService.hashToken(plain2),
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        provider: 'apple',
        expiresAt,
      },
    });
    await expect(
      prisma.$transaction((tx) =>
        stepUp.consumeIdentityLinkTx(tx, {
          stepUpToken: plain2,
          parentId: parentB,
          sessionId: sessionA,
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
