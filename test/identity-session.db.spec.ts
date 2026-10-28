/**
 * Real PostgreSQL session lifecycle tests (LMP-33 QA).
 * Runs in CI prisma-checks job when DATABASE_URL is set; skipped locally otherwise.
 */
import { ConfigService } from '@nestjs/config';
import { ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import type { AppEnv } from '../src/config/env.validation';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAccessService } from '../src/modules/identity/session/jwt-access.service';
import { SessionIssuerService } from '../src/modules/identity/session/session-issuer.service';
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
});
