/**
 * Real PostgreSQL session lifecycle tests (LMP-33 QA).
 * Runs in CI prisma-checks job when DATABASE_URL is set; skipped locally otherwise.
 */
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import type { AppEnv } from '../src/config/env.validation';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAccessService } from '../src/modules/identity/session/jwt-access.service';
import { SessionIssuerService, scopedDeviceId } from '../src/modules/identity/session/session-issuer.service';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';
import { SEED_IDS } from '../prisma/seed';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb('Identity sessions against PostgreSQL (LMP-33)', () => {
  const prisma = new PrismaClient();
  let issuer: SessionIssuerService;
  let jwt: JwtAccessService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM ??= TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM ??= TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER ??= TEST_REFRESH_PEPPER;

    await prisma.$connect();
    await prisma.parentAccount.upsert({
      where: { id: SEED_IDS.parent },
      create: {
        id: SEED_IDS.parent,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
      update: {
        deletedAt: null,
        lifecycle: ParentAccountLifecycle.active,
      },
    });

    const prismaService = {
      get db() {
        return prisma;
      },
    } as unknown as PrismaService;

    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
          JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
          JWT_KEY_ID: 'db-test',
          REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;

    jwt = new JwtAccessService(config);
    await jwt.onModuleInit();
    issuer = new SessionIssuerService(prismaService, jwt, config);
  });

  afterAll(async () => {
    await prisma.parentSession.deleteMany({
      where: { parentId: SEED_IDS.parent },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.parentSession.deleteMany({
      where: { parentId: SEED_IDS.parent },
    });
  });

  it('migrated parent_sessions + lookup tables exist', async () => {
    const tables = await prisma.$queryRaw<Array<{ relname: string }>>`
      SELECT relname FROM pg_class
      WHERE relname IN ('parent_sessions', 'parent_session_refresh_hash_lookups')
        AND relkind = 'r'
    `;
    expect(tables.map((t) => t.relname).sort()).toEqual([
      'parent_session_refresh_hash_lookups',
      'parent_sessions',
    ]);
  });

  it('mints, rotates, detects reuse, and logout-all against Postgres', async () => {
    const pair = await issuer.mintSession({
      parentId: SEED_IDS.parent,
      clientSurface: 'ios',
    });
    expect(pair.session_id).toMatch(
      /^[0-9a-f-]{36}$/i,
    );

    const rotated = await issuer.refresh(pair.refresh_token);
    expect(rotated.session_id).toBe(pair.session_id);

    const lookupCount = await prisma.parentSessionRefreshHashLookup.count({
      where: { sessionId: pair.session_id },
    });
    expect(lookupCount).toBeGreaterThanOrEqual(1);

    await expect(issuer.refresh(pair.refresh_token)).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'refresh_reuse' }),
    });

    const revoked = await prisma.parentSession.findUnique({
      where: { id: pair.session_id },
    });
    expect(revoked?.revokedAt).not.toBeNull();
    expect(revoked?.revokedReason).toBe('refresh_reuse');

    const a = await issuer.mintSession({ parentId: SEED_IDS.parent });
    const b = await issuer.mintSession({ parentId: SEED_IDS.parent });
    const count = await issuer.logoutAll(SEED_IDS.parent);
    expect(count).toBeGreaterThanOrEqual(2);
    await expect(
      issuer.requireActiveSession(a.session_id, SEED_IDS.parent),
    ).rejects.toBeTruthy();
    await expect(issuer.refresh(b.refresh_token)).rejects.toBeTruthy();
  });

  it('binds two independent installations to one parent in PostgreSQL', async () => {
    const deviceIds = [randomUUID(), randomUUID()];
    try {
      const sessions = await Promise.all(
        deviceIds.map((deviceId) =>
          issuer.mintSession({
            parentId: SEED_IDS.parent,
            deviceId,
            clientSurface: 'ios',
          }),
        ),
      );
      expect(new Set(sessions.map((session) => session.session_id)).size).toBe(2);
      const rows = await prisma.device.findMany({
        where: { id: { in: deviceIds } },
      });
      expect(rows).toHaveLength(0);
      const scopedIds = deviceIds.map((id) => scopedDeviceId(id, SEED_IDS.parent));
      const scopedRows = await prisma.device.findMany({ where: { id: { in: scopedIds } } });
      expect(scopedRows).toHaveLength(2);
      expect(scopedRows.every((row) => row.parentId === SEED_IDS.parent)).toBe(true);
      const minted = await prisma.parentSession.findMany({
        where: { id: { in: sessions.map((session) => session.session_id) } },
      });
      expect(new Set(minted.map((session) => session.deviceId))).toEqual(
        new Set(scopedIds),
      );
    } finally {
      await prisma.parentSession.deleteMany({
        where: { deviceId: { in: deviceIds.map((id) => scopedDeviceId(id, SEED_IDS.parent)) } },
      });
      await prisma.device.deleteMany({ where: { id: { in: deviceIds.map((id) => scopedDeviceId(id, SEED_IDS.parent)) } } });
    }
  });

  it('serializes concurrent first-time registration of one device', async () => {
    const deviceId = randomUUID();
    try {
      const sessions = await Promise.all([
        issuer.mintSession({ parentId: SEED_IDS.parent, deviceId, clientSurface: 'ios' }),
        issuer.mintSession({ parentId: SEED_IDS.parent, deviceId, clientSurface: 'ios' }),
      ]);
      expect(sessions).toHaveLength(2);
      expect(sessions[0].session_id).not.toBe(sessions[1].session_id);
      expect(await prisma.device.count({ where: { id: scopedDeviceId(deviceId, SEED_IDS.parent) } })).toBe(1);
      expect(await prisma.parentSession.count({
        where: { id: { in: sessions.map((session) => session.session_id) }, deviceId: scopedDeviceId(deviceId, SEED_IDS.parent) },
      })).toBe(2);
    } finally {
      await prisma.parentSession.deleteMany({ where: { deviceId: scopedDeviceId(deviceId, SEED_IDS.parent) } });
      await prisma.device.deleteMany({ where: { id: scopedDeviceId(deviceId, SEED_IDS.parent) } });
    }
  });

  it('allows a second parent on the same installation with distinct device ownership', async () => {
    const deviceId = randomUUID();
    const otherParentId = randomUUID();
    const aId = scopedDeviceId(deviceId, SEED_IDS.parent);
    const bId = scopedDeviceId(deviceId, otherParentId);
    try {
      await prisma.parentAccount.create({
        data: {
          id: otherParentId,
          locale: 'tr-TR',
          timezone: 'Europe/Istanbul',
          lifecycle: ParentAccountLifecycle.active,
        },
      });
      const a = await issuer.mintSession({
        parentId: SEED_IDS.parent, deviceId, clientSurface: 'ios',
      });
      await issuer.logout({ sessionId: a.session_id, parentId: SEED_IDS.parent });
      const b = await issuer.mintSession({
        parentId: otherParentId, deviceId, clientSurface: 'ios',
      });
      expect(a.session_id).not.toBe(b.session_id);
      const devices = await prisma.device.findMany({
        where: { id: { in: [aId, bId] } },
      });
      expect(devices).toHaveLength(2);
      expect(devices.find((row) => row.id === aId)?.parentId).toBe(SEED_IDS.parent);
      expect(devices.find((row) => row.id === bId)?.parentId).toBe(otherParentId);
      await expect(issuer.requireActiveSession(a.session_id, SEED_IDS.parent)).rejects.toBeTruthy();
      await expect(issuer.requireActiveSession(b.session_id, SEED_IDS.parent)).rejects.toBeTruthy();
      expect((await issuer.requireActiveSession(b.session_id, otherParentId)).deviceId).toBe(bId);
    } finally {
      await prisma.parentSession.deleteMany({ where: { deviceId: { in: [aId, bId] } } });
      await prisma.device.deleteMany({ where: { id: { in: [aId, bId] } } });
      await prisma.parentAccount.deleteMany({ where: { id: otherParentId } });
    }
  });

  it('rejects expired session refresh atomically', async () => {
    const pair = await issuer.mintSession({ parentId: SEED_IDS.parent });
    await prisma.parentSession.update({
      where: { id: pair.session_id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    await expect(issuer.refresh(pair.refresh_token)).rejects.toMatchObject({
      response: expect.objectContaining({ error: 'expired_token' }),
    });
  });

  it('rejects refresh after lock wait that crosses absolute expiry (Postgres)', async () => {
    const pair = await issuer.mintSession({ parentId: SEED_IDS.parent });
    const before = await prisma.parentSession.findUniqueOrThrow({
      where: { id: pair.session_id },
    });
    expect(before.refreshGeneration).toBe(0);
    expect(before.refreshTokenHash).toBeTruthy();

    // Expire ~1.5s from now so a contended lock wait crosses the boundary.
    const expiresAt = new Date(Date.now() + 1_500);
    await prisma.parentSession.update({
      where: { id: pair.session_id },
      data: { expiresAt },
    });

    // Interactive $transaction pins one pooled connection for the whole hold —
    // raw BEGIN/ROLLBACK across awaits is not connection-safe with Prisma.
    const locker = new PrismaClient();
    await locker.$connect();
    try {
      let signalLockHeld!: () => void;
      const lockHeld = new Promise<void>((resolve) => {
        signalLockHeld = resolve;
      });
      let releaseLock!: () => void;
      const lockRelease = new Promise<void>((resolve) => {
        releaseLock = resolve;
      });

      const holdPromise = locker.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT id FROM parent_sessions
            WHERE id = ${pair.session_id}::uuid
            FOR UPDATE
          `;
          signalLockHeld();
          await lockRelease;
        },
        { maxWait: 5_000, timeout: 15_000 },
      );

      await lockHeld;
      const refreshPromise = issuer.refresh(pair.refresh_token);

      // Hold the row lock past absolute expiry, then release.
      await new Promise((resolve) => setTimeout(resolve, 2_200));
      releaseLock();
      await holdPromise;

      await expect(refreshPromise).rejects.toMatchObject({
        response: expect.objectContaining({ error: 'expired_token' }),
      });
    } finally {
      await locker.$disconnect();
    }

    const after = await prisma.parentSession.findUniqueOrThrow({
      where: { id: pair.session_id },
    });
    expect(after.refreshGeneration).toBe(before.refreshGeneration);
    expect(after.refreshTokenHash).toBe(before.refreshTokenHash);
    expect(after.lastRefreshedAt).toBeNull();
  }, 20_000);
});
