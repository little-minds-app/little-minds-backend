import { ConfigService } from '@nestjs/config';
import { ParentAccountLifecycle } from '@prisma/client';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_REFRESH_PEPPER,
} from '../../../../test/fixtures/auth/keys';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAccessService } from './jwt-access.service';
import { SessionIssuerService } from './session-issuer.service';
import { hashRefreshToken } from './refresh-token';
import { MAX_ACTIVE_SESSIONS_PER_PARENT } from './session.constants';

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

function memoryDb() {
  const sessions = new Map<string, SessionRow>();
  const parents = new Map([
    [
      '11111111-1111-4111-8111-111111111111',
      {
        id: '11111111-1111-4111-8111-111111111111',
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
      create: async ({ data }: { data: Partial<SessionRow> & { id: string } }) => {
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
      findFirst: async ({
        where,
      }: {
        where: Record<string, unknown>;
      }) => {
        for (const row of sessions.values()) {
          if (where.refreshTokenHash && row.refreshTokenHash !== where.refreshTokenHash) {
            continue;
          }
          if (where.id && row.id !== where.id) continue;
          if (where.parentId && row.parentId !== where.parentId) continue;
          return row;
        }
        return null;
      },
      findMany: async ({
        where,
      }: {
        where: Record<string, unknown>;
        orderBy?: unknown;
        take?: number;
      }) => {
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
        const row = sessions.get(id);
        if (!row) throw new Error('missing');
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

  return { db, sessions, parents };
}

describe('SessionIssuerService (LMP-33)', () => {
  async function build() {
    const mem = memoryDb();
    const prisma = {
      get db() {
        return mem.db;
      },
    } as unknown as PrismaService;

    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
          JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
          JWT_KEY_ID: 'test',
          REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;

    const jwt = new JwtAccessService(config);
    await jwt.onModuleInit();
    const issuer = new SessionIssuerService(prisma, jwt, config);
    return { issuer, mem, jwt };
  }

  it('mints and refreshes with single-winner rotation', async () => {
    const { issuer } = await build();
    const pair = await issuer.mintSession({
      parentId: '11111111-1111-4111-8111-111111111111',
    });
    expect(pair.expires_in).toBe(900);
    expect(pair.token_type).toBe('Bearer');

    const rotated = await issuer.refresh(pair.refresh_token);
    expect(rotated.session_id).toBe(pair.session_id);
    expect(rotated.refresh_token).not.toBe(pair.refresh_token);

    await expect(issuer.refresh(pair.refresh_token)).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'refresh_reuse' }),
    });
  });

  it('rejects mint when active session cap is full', async () => {
    const { issuer, mem } = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const now = new Date();
    for (let i = 0; i < MAX_ACTIVE_SESSIONS_PER_PARENT; i += 1) {
      const id = `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa${i.toString().padStart(2, '0')}`;
      mem.sessions.set(id, {
        id,
        parentId,
        tokenFamilyId: id,
        refreshTokenHash: hashRefreshToken(`seed-${i}`, TEST_REFRESH_PEPPER),
        refreshTokenHashHistory: [],
        refreshGeneration: 0,
        expiresAt: new Date(now.getTime() + 86_400_000),
        revokedAt: null,
        revokedReason: null,
        deviceId: null,
        clientSurface: null,
        userAgentSummary: null,
        createdAt: now,
        updatedAt: now,
        lastRefreshedAt: null,
      });
    }
    await expect(issuer.mintSession({ parentId })).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'session_limit_exceeded' }),
    });
  });

  it('logout-all returns revoked count and blocks access session check', async () => {
    const { issuer } = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const a = await issuer.mintSession({ parentId });
    const b = await issuer.mintSession({ parentId });
    const count = await issuer.logoutAll(parentId);
    expect(count).toBe(2);
    await expect(
      issuer.requireActiveSession(a.session_id, parentId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'revoked_session' }),
    });
    await expect(issuer.refresh(b.refresh_token)).rejects.toBeTruthy();
  });

  it('concurrent refresh: only one winner; loser gets invalid_token', async () => {
    const { issuer } = await build();
    const pair = await issuer.mintSession({
      parentId: '11111111-1111-4111-8111-111111111111',
    });
    const results = await Promise.allSettled([
      issuer.refresh(pair.refresh_token),
      issuer.refresh(pair.refresh_token),
    ]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });
});
