import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { AuthRateLimitService } from '../src/modules/identity/session/auth-rate-limit.service';
import { SessionIssuerService } from '../src/modules/identity/session/session-issuer.service';
import { ParentAccountLifecycle } from '@prisma/client';

const PARENT_ID = '11111111-1111-4111-8111-111111111111';

/**
 * Minimal memory Prisma covering ParentAuthGuard + link route validation.
 * Proof verification / collision A–E are covered by unit + Postgres DB specs.
 */
function createMemoryPrisma(): PrismaService {
  const sessions = new Map<
    string,
    {
      id: string;
      parentId: string;
      revokedAt: Date | null;
      expiresAt: Date;
      refreshTokenHash: string | null;
      refreshGeneration: number;
      tokenFamilyId: string;
      refreshTokenHashHistory: unknown;
    }
  >();
  const parents = new Map([
    [
      PARENT_ID,
      {
        id: PARENT_ID,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
        deletedAt: null as Date | null,
      },
    ],
  ]);

  const db: Record<string, unknown> = {
    parentAccount: {
      findUnique: async ({ where: { id } }: { where: { id: string } }) =>
        parents.get(id) ?? null,
    },
    parentSession: {
      count: async () =>
        [...sessions.values()].filter((s) => s.revokedAt == null).length,
      create: async ({
        data,
      }: {
        data: {
          id: string;
          parentId: string;
          tokenFamilyId: string;
          refreshTokenHash: string;
          refreshTokenHashHistory: unknown;
          refreshGeneration: number;
          expiresAt: Date;
        };
      }) => {
        const row = {
          ...data,
          revokedAt: null as Date | null,
          deviceId: null,
          clientSurface: null,
          userAgentSummary: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastRefreshedAt: null,
        };
        sessions.set(row.id, row);
        return row;
      },
      findUnique: async ({ where: { id } }: { where: { id: string } }) =>
        sessions.get(id) ?? null,
      findFirst: async ({
        where,
      }: {
        where: { id?: string; refreshTokenHash?: string };
      }) => {
        if (where.id) return sessions.get(where.id) ?? null;
        if (where.refreshTokenHash) {
          return (
            [...sessions.values()].find(
              (s) => s.refreshTokenHash === where.refreshTokenHash,
            ) ?? null
          );
        }
        return null;
      },
      update: async () => null,
      updateMany: async () => ({ count: 0 }),
    },
    parentSessionRefreshHashLookup: {
      create: async () => null,
      findUnique: async () => null,
      deleteMany: async () => ({ count: 0 }),
      upsert: async () => null,
    },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(db),
    $queryRaw: async () => [{ now: new Date() }],
    $executeRaw: async () => 1,
  };

  return {
    get db() {
      return db;
    },
    onModuleInit: async () => undefined,
    onModuleDestroy: async () => undefined,
  } as unknown as PrismaService;
}

describe('Account linking HTTP (LMP-36)', () => {
  let app: INestApplication<App>;
  let rateLimit: AuthRateLimitService;
  let sessions: SessionIssuerService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createMemoryPrisma())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    rateLimit = app.get(AuthRateLimitService);
    sessions = app.get(SessionIssuerService);

    // Mint via SessionIssuer (no /dev/session dependency — CI disables bootstrap).
    const minted = await sessions.mintSession({
      parentId: PARENT_ID,
      clientSurface: 'test',
    });
    accessToken = minted.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    rateLimit.resetForTests();
  });

  it('rejects unauthenticated link with 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/identities/link')
      .send({
        provider: 'apple',
        id_token: 'x'.repeat(40),
        nonce: 'n'.repeat(16),
      });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_token');
  });

  it('rejects unknown provider with 400 when authenticated', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/identities/link')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ provider: 'facebook' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_request');
  });

  it('rejects apple link missing proof fields with 400 when authenticated', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/identities/link')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ provider: 'apple' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_request');
  });
});
