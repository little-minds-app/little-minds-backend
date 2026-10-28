import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { AuthRateLimitService } from '../src/modules/identity/session/auth-rate-limit.service';
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
      findUnique: async ({ where: { id } }: { where: { id: string } }) =>
        sessions.get(id) ?? null,
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        let rows = [...sessions.values()];
        if (where.parentId) {
          rows = rows.filter((r) => r.parentId === where.parentId);
        }
        if (where.revokedAt === null) {
          rows = rows.filter((r) => r.revokedAt == null);
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
          if (
            where.expiresAt &&
            typeof where.expiresAt === 'object' &&
            'gt' in (where.expiresAt as object) &&
            !(row.expiresAt > (where.expiresAt as { gt: Date }).gt)
          ) {
            continue;
          }
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

  const hashLookups = new Map<string, { hash: string; sessionId: string }>();
  db.parentSessionRefreshHashLookup = {
    upsert: async ({
      create,
    }: {
      where: { hash: string };
      create: { hash: string; sessionId: string };
      update: { sessionId: string };
    }) => {
      hashLookups.set(create.hash, create);
      return create;
    },
    findUnique: async ({
      where: { hash },
      include,
    }: {
      where: { hash: string };
      include?: { session: boolean };
    }) => {
      const hit = hashLookups.get(hash);
      if (!hit) return null;
      if (include?.session) {
        return { ...hit, session: sessions.get(hit.sessionId) ?? null };
      }
      return hit;
    },
    findMany: async ({
      where: { sessionId },
    }: {
      where: { sessionId: string };
    }) =>
      [...hashLookups.values()]
        .filter((row) => row.sessionId === sessionId)
        .map((row) => ({ hash: row.hash })),
    deleteMany: async ({
      where,
    }: {
      where: { sessionId?: string | { in: string[] }; hash?: { in: string[] } };
    }) => {
      let count = 0;
      for (const [hash, row] of [...hashLookups.entries()]) {
        if (where.hash?.in && !where.hash.in.includes(hash)) continue;
        if (
          typeof where.sessionId === 'string' &&
          row.sessionId !== where.sessionId
        ) {
          continue;
        }
        if (
          where.sessionId &&
          typeof where.sessionId === 'object' &&
          'in' in where.sessionId &&
          !where.sessionId.in.includes(row.sessionId)
        ) {
          continue;
        }
        hashLookups.delete(hash);
        count += 1;
      }
      return { count };
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
    if (sql.includes('parent_sessions') && sql.includes('FOR UPDATE')) {
      const id = String(values[0] ?? '');
      return sessions.has(id) ? [{ id }] : [];
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
  let rateLimit: AuthRateLimitService;

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
    // clientIp uses transport peer only.
    await app.init();
    rateLimit = app.get(AuthRateLimitService);
  });

  beforeEach(() => {
    rateLimit.resetForTests();
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

  it('ignores forged X-Forwarded-For for bootstrap (peer remains loopback in harness)', async () => {
    // Spoofed XFF must not change peer-based loopback decision. Supertest peers
    // are loopback, so bootstrap still succeeds even if XFF claims a public IP.
    await request(app.getHttpServer())
      .post('/v1/auth/dev/session')
      .set('X-Forwarded-For', '203.0.113.9')
      .send({ parent_id: PARENT_ID })
      .expect(200);
  });

  it('logout with bearer after revoke is idempotent 204', async () => {
    const pair = await bootstrapSession();
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${pair.access_token}`)
      .expect(204);
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${pair.access_token}`)
      .expect(204);
    await request(app.getHttpServer())
      .get('/v1/parent/me')
      .set('Authorization', `Bearer ${pair.access_token}`)
      .expect(401);
  });

  it('rejects unauthenticated parent/me', async () => {
    await request(app.getHttpServer()).get('/v1/parent/me').expect(401);
  });
});
