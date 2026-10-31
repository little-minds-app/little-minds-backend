import { ConfigService } from '@nestjs/config';
import { ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import type { AppEnv } from '../src/config/env.validation';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAccessService } from '../src/modules/identity/session/jwt-access.service';
import { SessionIssuerService } from '../src/modules/identity/session/session-issuer.service';
import { WebParentSessionService } from '../src/modules/identity/session/web-parent-session.service';
import { TEST_JWT_PRIVATE_PEM, TEST_JWT_PUBLIC_PEM, TEST_REFRESH_PEPPER } from './fixtures/auth/keys';
import { SEED_IDS } from '../prisma/seed';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
describeDb('Opaque web sessions across independent service instances (LMP-38)', () => {
  const prisma = new PrismaClient();
  const otherPrisma = new PrismaClient();
  let issuer: SessionIssuerService;
  let web1: WebParentSessionService;
  let web2: WebParentSessionService;
  beforeAll(async () => {
    await prisma.$connect();
    await otherPrisma.$connect();
    await prisma.parentAccount.upsert({
      where: { id: SEED_IDS.parent },
      create: { id: SEED_IDS.parent, locale: 'tr-TR', timezone: 'Europe/Istanbul', lifecycle: ParentAccountLifecycle.active },
      update: { deletedAt: null, lifecycle: ParentAccountLifecycle.active },
    });
    const database = { get db() { return prisma; } } as unknown as PrismaService;
    const config = { get: (key: keyof AppEnv) => ({
      APP_ENV: 'development', JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
      JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM, JWT_KEY_ID: 'db-test',
      REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
    } as Partial<AppEnv>)[key] } as unknown as ConfigService<AppEnv, true>;
    const jwt = new JwtAccessService(config);
    await jwt.onModuleInit();
    issuer = new SessionIssuerService(database, jwt, config);
    web1 = new WebParentSessionService(database, config);
    const otherDatabase = { get db() { return otherPrisma; } } as unknown as PrismaService;
    web2 = new WebParentSessionService(otherDatabase, config);
  });
  afterAll(async () => { await prisma.$disconnect(); await otherPrisma.$disconnect(); });

  it('multiple service instances authorize concurrently without rotating refresh', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const session = await web1.create(SEED_IDS.parent, minted.session_id);
      expect(session.handle).toMatch(/^[A-Za-z0-9_-]{43}$/);
      const parent = await Promise.all([
        web1.requireActive(session.handle), web2.requireActive(session.handle),
        web1.requireActive(session.handle), web2.requireActive(session.handle),
      ]);
      expect(parent.map((p) => p.parent_id)).toEqual(Array(4).fill(SEED_IDS.parent));
      const row = await prisma.parentSession.findUniqueOrThrow({ where: { id: minted.session_id } });
      expect(row.refreshTokenHash).toBeNull();
      expect(row.refreshGeneration).toBe(0);
      await expect(issuer.refresh(minted.refresh_token)).rejects.toBeTruthy();
      const again = await web2.requireActive(session.handle);
      expect(again.parent_id).toBe(SEED_IDS.parent);
      await web2.logout(session.handle);
      await expect(web1.requireActive(session.handle)).rejects.toBeTruthy();
      await web1.logout(session.handle); // idempotent
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('rejects non-web session conversion and malformed handles', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'ios' });
    try {
      await expect(web1.create(SEED_IDS.parent, minted.session_id)).rejects.toBeTruthy();
      await expect(web1.requireActive('not-an-opaque-cookie')).rejects.toBeTruthy();
      const stillNative = await issuer.refresh(minted.refresh_token);
      expect(stillNative.session_id).toBe(minted.session_id);
    } finally {
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });
  it('accepts exactly one exchange under concurrent requests and preserves original handle', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const results = await Promise.allSettled([
        web1.create(SEED_IDS.parent, minted.session_id),
        web2.create(SEED_IDS.parent, minted.session_id),
      ]);
      const ok = results.filter((r): r is PromiseFulfilledResult<{ handle: string; expires_at: string }> => r.status === 'fulfilled');
      expect(ok).toHaveLength(1);
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
      expect(await prisma.webParentSession.count({ where: { parentSessionId: minted.session_id } })).toBe(1);
      expect((await web2.requireActive(ok[0].value.handle)).parent_id).toBe(SEED_IDS.parent);
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('rejects expired and revoked sessions across distinct connections', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const web = await web1.create(SEED_IDS.parent, minted.session_id);
      await prisma.parentSession.update({
        where: { id: minted.session_id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await expect(web2.requireActive(web.handle)).rejects.toBeTruthy();
      await prisma.parentSession.update({
        where: { id: minted.session_id },
        data: { expiresAt: new Date(Date.now() + 60_000), revokedAt: new Date() },
      });
      await expect(web1.requireActive(web.handle)).rejects.toBeTruthy();
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('does not create a web session after parent session revocation', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      await prisma.parentSession.update({
        where: { id: minted.session_id },
        data: { revokedAt: new Date() },
      });
      await expect(web2.create(SEED_IDS.parent, minted.session_id)).rejects.toBeTruthy();
      expect(await prisma.webParentSession.count({ where: { parentSessionId: minted.session_id } })).toBe(0);
    } finally {
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('prevents exchange after expiry even when refresh token is otherwise present', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      await prisma.parentSession.update({
        where: { id: minted.session_id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await expect(web1.create(SEED_IDS.parent, minted.session_id)).rejects.toBeTruthy();
      expect(await prisma.webParentSession.count({ where: { parentSessionId: minted.session_id } })).toBe(0);
    } finally {
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('never authorizes a session after concurrent exchange and parent revocation settle', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const [converted] = await Promise.allSettled([
        web1.create(SEED_IDS.parent, minted.session_id),
        otherPrisma.parentSession.update({
          where: { id: minted.session_id },
          data: { revokedAt: new Date() },
        }),
      ]);
      if (converted.status === 'fulfilled') {
        await expect(web2.requireActive(converted.value.handle)).rejects.toBeTruthy();
      }
      expect((await prisma.parentSession.findUniqueOrThrow({
        where: { id: minted.session_id },
      })).revokedAt).not.toBeNull();
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('expires idle handles at 30 minutes, but active requests extend only the idle clock', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const web = await web1.create(SEED_IDS.parent, minted.session_id);
      const original = await prisma.webParentSession.findUniqueOrThrow({ where: { parentSessionId: minted.session_id } });
      await prisma.webParentSession.update({
        where: { id: original.id },
        data: { lastUsedAt: new Date(Date.now() - 29 * 60_000) },
      });
      await expect(web2.requireActive(web.handle)).resolves.toMatchObject({ parent_id: SEED_IDS.parent });
      const passive = await prisma.webParentSession.findUniqueOrThrow({ where: { id: original.id } });
      expect(passive.lastUsedAt!.getTime()).toBeLessThan(Date.now() - 28 * 60_000);
      await expect(web2.requireActive(web.handle, true)).resolves.toMatchObject({ parent_id: SEED_IDS.parent });
      const touched = await prisma.webParentSession.findUniqueOrThrow({ where: { id: original.id } });
      expect(touched.lastUsedAt!.getTime()).toBeGreaterThan(Date.now() - 60_000);
      expect(touched.expiresAt.toISOString()).toBe(original.expiresAt.toISOString());
      await prisma.webParentSession.update({
        where: { id: original.id },
        data: { lastUsedAt: new Date(Date.now() - 31 * 60_000) },
      });
      await expect(web1.requireActive(web.handle)).rejects.toBeTruthy();
      await expect(web2.requireActive(web.handle)).rejects.toBeTruthy();
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('passive polling cannot extend expired idle session', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const web = await web1.create(SEED_IDS.parent, minted.session_id);
      const idleAt = new Date(Date.now() - 31 * 60_000);
      await prisma.webParentSession.update({
        where: { parentSessionId: minted.session_id },
        data: { lastUsedAt: idleAt },
      });
      await expect(web1.requireActive(web.handle)).rejects.toBeTruthy();
      await expect(web2.requireActive(web.handle, true)).rejects.toBeTruthy();
      const persisted = await prisma.webParentSession.findUniqueOrThrow({ where: { parentSessionId: minted.session_id } });
      expect(persisted.lastUsedAt!.getTime()).toBe(idleAt.getTime());
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

  it('concurrent logout and activity never resurrect the session', async () => {
    const minted = await issuer.mintSession({ parentId: SEED_IDS.parent, clientSurface: 'web' });
    try {
      const web = await web1.create(SEED_IDS.parent, minted.session_id);
      await Promise.allSettled([web1.requireActive(web.handle, true), web2.logout(web.handle)]);
      await expect(web1.requireActive(web.handle, true)).rejects.toBeTruthy();
      await expect(web2.requireActive(web.handle)).rejects.toBeTruthy();
      const stored = await prisma.webParentSession.findUniqueOrThrow({ where: { parentSessionId: minted.session_id } });
      expect(stored.revokedAt).not.toBeNull();
    } finally {
      await prisma.webParentSession.deleteMany({ where: { parentSessionId: minted.session_id } });
      await prisma.parentSession.deleteMany({ where: { id: minted.session_id } });
    }
  });

});
