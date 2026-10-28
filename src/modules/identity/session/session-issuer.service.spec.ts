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
  const hashLookups = new Map<string, { hash: string; sessionId: string }>();
  const parents = new Map<
    string,
    {
      id: string;
      locale: string;
      timezone: string;
      lifecycle: ParentAccountLifecycle;
      deletedAt: Date | null;
    }
  >([
    [
      '11111111-1111-4111-8111-111111111111',
      {
        id: '11111111-1111-4111-8111-111111111111',
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
        deletedAt: null,
      },
    ],
  ]);

  const db: Record<string, unknown> = {};

  const parentSession = {
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
  };

  const parentSessionRefreshHashLookup = {
    upsert: async ({
      where: { hash },
      create,
    }: {
      where: { hash: string };
      create: { hash: string; sessionId: string };
      update: { sessionId: string };
    }) => {
      hashLookups.set(hash, { hash: create.hash, sessionId: create.sessionId });
      return hashLookups.get(hash);
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
      select?: { hash: boolean };
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
        if (typeof where.sessionId === 'string' && row.sessionId !== where.sessionId) {
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

  db.parentAccount = {
    findUnique: async ({ where: { id } }: { where: { id: string } }) =>
      parents.get(id) ?? null,
  };
  db.parentSession = parentSession;
  db.parentSessionRefreshHashLookup = parentSessionRefreshHashLookup;
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

  return { db, sessions, parents, hashLookups };
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

  it('detects reuse via indexed lookup beyond 500 newer sessions', async () => {
    const { issuer, mem } = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const pair = await issuer.mintSession({ parentId });
    const rotated = await issuer.refresh(pair.refresh_token);
    expect(rotated.session_id).toBe(pair.session_id);

    const now = new Date();
    for (let i = 0; i < 520; i += 1) {
      const id = `bbbbbbbb-bbbb-4bbb-8bbb-${i.toString().padStart(12, '0')}`;
      mem.sessions.set(id, {
        id,
        parentId,
        tokenFamilyId: id,
        refreshTokenHash: hashRefreshToken(`noise-${i}`, TEST_REFRESH_PEPPER),
        refreshTokenHashHistory: [
          {
            h: hashRefreshToken(`noise-old-${i}`, TEST_REFRESH_PEPPER),
            g: 0,
            at: now.toISOString(),
          },
        ],
        refreshGeneration: 1,
        expiresAt: new Date(now.getTime() + 86_400_000),
        revokedAt: null,
        revokedReason: null,
        deviceId: null,
        clientSurface: null,
        userAgentSummary: null,
        createdAt: now,
        updatedAt: now,
        lastRefreshedAt: now,
      });
    }

    await expect(issuer.refresh(pair.refresh_token)).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'refresh_reuse' }),
    });
  });

  it('rejects refresh when session expires before conditional update', async () => {
    const { issuer, mem } = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const pair = await issuer.mintSession({ parentId });
    const row = mem.sessions.get(pair.session_id)!;
    row.expiresAt = new Date(Date.now() - 1000);
    mem.sessions.set(pair.session_id, row);
    await expect(issuer.refresh(pair.refresh_token)).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'expired_token' }),
    });
  });

  it('logout by sid is idempotent for already-revoked sessions', async () => {
    const { issuer } = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const pair = await issuer.mintSession({ parentId });
    await issuer.logout({ sessionId: pair.session_id, parentId });
    await expect(
      issuer.logout({ sessionId: pair.session_id, parentId }),
    ).resolves.toBeUndefined();
  });

  it('refreshRateLimitKey is a peppered hash, not a token prefix', async () => {
    const { issuer } = await build();
    const token = `lmrt_${'a'.repeat(48)}`;
    const key = issuer.refreshRateLimitKey(token);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key.includes(token.slice(0, 24))).toBe(false);
    expect(key.startsWith('lmrt_')).toBe(false);
  });

  it('rejects refresh when parent lifecycle is no longer active', async () => {
    const { issuer, mem } = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const pair = await issuer.mintSession({ parentId });
    const parent = mem.parents.get(parentId)!;
    parent.lifecycle = ParentAccountLifecycle.deleted;
    mem.parents.set(parentId, parent);
    await expect(issuer.refresh(pair.refresh_token)).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'invalid_token' }),
    });
  });
});
