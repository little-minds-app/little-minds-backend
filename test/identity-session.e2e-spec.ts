import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { ParentAccountLifecycle } from '@prisma/client';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';

const PARENT_ID = '11111111-1111-4111-8111-111111111111';

type SessionRow = {
  id: string;
  parentId: string;
  tokenFamilyId: string;
  refreshTokenHash: string | null;
  refreshTokenHashHistory: unknown;
  refreshGeneration: number;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedReason: string | null;
  deviceId: string | null;
  clientSurface: string | null;
  userAgentSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastRefreshedAt: Date | null;
};

function createMemoryPrisma(): PrismaService {
  const sessions = new Map<string, SessionRow>();
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
  const children = new Map([
    [
      '33333333-3333-4333-8333-333333333324',
      {
        id: '33333333-3333-4333-8333-333333333324',
        parentId: PARENT_ID,
        deletedAt: null as Date | null,
      },
    ],
    [
      '33333333-3333-4333-8333-333333333399',
      {
        id: '33333333-3333-4333-8333-333333333399',
        parentId: '22222222-2222-4222-8222-222222222222',
        deletedAt: null as Date | null,
      },
    ],
  ]);

  const db: Record<string, unknown> = {
    parentAccount: {
      findUnique: async ({ where: { id } }: { where: { id: string } }) =>
        parents.get(id) ?? null,
    },
    childProfile: {
      findFirst: async ({
        where,
      }: {
        where: { id: string; parentId: string; deletedAt: null };
      }) => {
        const row = children.get(where.id);
        if (!row || row.parentId !== where.parentId || row.deletedAt) {
          return null;
        }
        return { id: row.id };
      },
    },
    parentSession: {
      count: async ({
        where,
      }: {
        where: { parentId: string; revokedAt: null; expiresAt: { gt: Date } };
      }) =>
        [...sessions.values()].filter(
          (s) =>
            s.parentId === where.parentId &&
            s.revokedAt == null &&
            s.expiresAt > where.expiresAt.gt,
        ).length,
      create: async ({
        data,
      }: {
        data: Partial<SessionRow> & { id: string };
      }) => {
        const now = new Date();
        const row: SessionRow = {
          refreshTokenHashHistory: [],
          refreshGeneration: 0,
          revokedAt: null,
          revokedReason: null,
          deviceId: null,
          clientSurface: null,
          userAgentSummary: null,
          lastRefreshedAt: null,
          createdAt: now,
          updatedAt: now,
          expiresAt: now,
          parentId: '',
          tokenFamilyId: '',
          refreshTokenHash: null,
          ...data,
          id: data.id,
        };
        sessions.set(row.id, row);
        return row;
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        for (const row of sessions.values()) {
          if (
            where.refreshTokenHash &&
            row.refreshTokenHash !== where.refreshTokenHash
          ) {
            continue;
          }
          if (where.id && row.id !== where.id) continue;
          if (where.parentId && row.parentId !== where.parentId) continue;
          return row;
        }
        return null;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        let rows = [...sessions.values()];
        if (where.parentId) {
          rows = rows.filter((r) => r.parentId === where.parentId);
        }
        if (where.revokedAt === null) {
          rows = rows.filter((r) => r.revokedAt == null);
        }
        if (
          where.refreshGeneration &&
          typeof where.refreshGeneration === 'object' &&
          'gt' in (where.refreshGeneration as object)
        ) {
          const gt = (where.refreshGeneration as { gt: number }).gt;
          rows = rows.filter((r) => r.refreshGeneration > gt);
        }
        return rows;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        let count = 0;
        for (const [id, row] of sessions) {
          if (where.id && row.id !== where.id) continue;
          if (
            where.refreshTokenHash &&
            row.refreshTokenHash !== where.refreshTokenHash
          ) {
            continue;
          }
          if (where.revokedAt === null && row.revokedAt != null) continue;
          if (where.parentId && row.parentId !== where.parentId) continue;
          const next = { ...row } as SessionRow;
          if ('refreshTokenHash' in data) {
            next.refreshTokenHash = data.refreshTokenHash as string | null;
          }
          if ('refreshTokenHashHistory' in data) {
            next.refreshTokenHashHistory = data.refreshTokenHashHistory;
          }
          if (
            data.refreshGeneration &&
            typeof data.refreshGeneration === 'object' &&
            'increment' in (data.refreshGeneration as object)
          ) {
            next.refreshGeneration += (
              data.refreshGeneration as { increment: number }
            ).increment;
          } else if ('refreshGeneration' in data) {
            next.refreshGeneration = data.refreshGeneration as number;
          }
          if ('lastRefreshedAt' in data) {
            next.lastRefreshedAt = data.lastRefreshedAt as Date;
          }
          if ('revokedAt' in data) {
            next.revokedAt = data.revokedAt as Date | null;
          }
          if ('revokedReason' in data) {
            next.revokedReason = data.revokedReason as string | null;
          }
          sessions.set(id, next);
          count += 1;
        }
        return { count };
      },
      update: async ({
        where: { id },
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const row = sessions.get(id)!;
        const next = { ...row, ...data } as SessionRow;
        sessions.set(id, next);
        return next;
      },
    },
  };

  db.$transaction = async <T>(fn: (tx: typeof db) => Promise<T>): Promise<T> =>
    fn(db);
  db.$queryRaw = async (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Array<{ id: string }>> => {
    const sql = strings.join('?');
    if (sql.includes('parent_accounts') && sql.includes('FOR UPDATE')) {
      const id = String(values[0] ?? '');
      return parents.has(id) ? [{ id }] : [];
    }
    return [];
  };

  return {
    isConfigured: true,
    get db() {
      return db;
    },
    ping: async () => true,
    onModuleInit: async () => undefined,
    onModuleDestroy: async () => undefined,
  } as unknown as PrismaService;
}

describe('Identity sessions (e2e LMP-33)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.APP_ENV = 'development';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:3000';
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM = TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM = TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER = TEST_REFRESH_PEPPER;
    process.env.AUTH_DEV_BOOTSTRAP_ENABLED = 'true';
    process.env.AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST = PARENT_ID;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createMemoryPrisma())
      .compile();

    app = moduleFixture.createNestApplication();
    // Express may not set req.ip in all harnesses — trust proxy off is fine;
    // clientIp falls back to socket address.
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function bootstrapSession() {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/dev/session')
      .send({ parent_id: PARENT_ID, client_surface: 'ios' })
      .expect(200);
    return res.body as {
      access_token: string;
      refresh_token: string;
      session_id: string;
      parent_id: string;
    };
  }

  it('boots gated bootstrap and returns parent/me', async () => {
    const pair = await bootstrapSession();
    expect(pair.parent_id).toBe(PARENT_ID);
    const me = await request(app.getHttpServer())
      .get('/v1/parent/me')
      .set('Authorization', `Bearer ${pair.access_token}`)
      .expect(200);
    expect(me.body).toMatchObject({
      parent_id: PARENT_ID,
      lifecycle: 'active',
    });
  });

  it('refreshes, rejects reuse, logout returns 204', async () => {
    const pair = await bootstrapSession();
    const refreshed = await request(app.getHttpServer())
      .post('/v1/auth/token/refresh')
      .send({ refresh_token: pair.refresh_token })
      .expect(200);
    await request(app.getHttpServer())
      .post('/v1/auth/token/refresh')
      .send({ refresh_token: pair.refresh_token })
      .expect(401);
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .send({ refresh_token: refreshed.body.refresh_token })
      .expect(204);
    await request(app.getHttpServer())
      .get('/v1/parent/me')
      .set('Authorization', `Bearer ${refreshed.body.access_token}`)
      .expect(401);
  });

  it('logout-all returns 200 with count', async () => {
    const a = await bootstrapSession();
    await bootstrapSession();
    const res = await request(app.getHttpServer())
      .post('/v1/auth/logout-all')
      .set('Authorization', `Bearer ${a.access_token}`)
      .expect(200);
    expect(res.body.revoked_session_count).toBeGreaterThanOrEqual(1);
  });

  it('denies bootstrap for non-allowlisted parent', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/dev/session')
      .send({ parent_id: '22222222-2222-4222-8222-222222222222' })
      .expect(404);
  });

  it('rejects unauthenticated parent/me', async () => {
    await request(app.getHttpServer()).get('/v1/parent/me').expect(401);
  });
});
