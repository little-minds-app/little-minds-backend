/**
 * LMP-39: real PostgreSQL + real ParentAuthGuard/JWT integration evidence.
 * Runs only in the existing database CI job, with fictional parent fixtures.
 */
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import type { AppEnv } from '../src/config/env.validation';
import { ChildProfileController } from '../src/modules/child-profile/child-profile.controller';
import { ChildProfileService } from '../src/modules/child-profile/child-profile.service';
import { ParentAuthGuard } from '../src/modules/identity/auth/parent-auth.guard';
import { JwtAccessService } from '../src/modules/identity/session/jwt-access.service';
import { SessionIssuerService } from '../src/modules/identity/session/session-issuer.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { TEST_JWT_PRIVATE_PEM, TEST_JWT_PUBLIC_PEM, TEST_REFRESH_PEPPER } from './fixtures/auth/keys';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('LMP-39 real-session HTTP access and parent-row concurrency', () => {
  const db = new PrismaClient();
  const parentA = randomUUID();
  const parentB = randomUUID();
  const prisma = { get db() { return db; } } as PrismaService;
  const config = { get: (key: keyof AppEnv) => ({
    APP_ENV: 'development', JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
    JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
    JWT_KEY_ID: 'lmp39-db', REFRESH_TOKEN_PEPPER: TEST_REFRESH_PEPPER,
  } as Partial<AppEnv>)[key] } as ConfigService<AppEnv, true>;
  const jwt = new JwtAccessService(config);
  const sessions = new SessionIssuerService(prisma, jwt, config);
  const profiles = new ChildProfileService(prisma);
  let app: INestApplication<App>;

  beforeAll(async () => {
    await db.$connect();
    await jwt.onModuleInit();
    await db.parentAccount.createMany({
      data: [{ id: parentA, lifecycle: 'active' }, { id: parentB, lifecycle: 'active' }],
    });
    const moduleRef = await Test.createTestingModule({
      controllers: [ChildProfileController],
      providers: [
        { provide: ChildProfileService, useValue: profiles },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtAccessService, useValue: jwt },
        { provide: SessionIssuerService, useValue: sessions },
        ParentAuthGuard,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await db.parentSession.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.childProfile.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.parentAccount.deleteMany({ where: { id: { in: [parentA, parentB] } } });
    await db.$disconnect();
  });

  it('real signed bearer enforces cross-parent 404, revoked session 401 and invalid JWT 401', async () => {
    const a = await sessions.mintSession({ parentId: parentA });
    const b = await sessions.mintSession({ parentId: parentB });
    const created = await request(app.getHttpServer()).post('/v1/children')
      .set('Authorization', 'Bearer ' + a.access_token)
      .send({ age_months: 32, reference_date: '2026-01-31' }).expect(201);
    const url = '/v1/children/' + created.body.child_id;
    await request(app.getHttpServer()).get(url)
      .set('Authorization', 'Bearer ' + a.access_token).expect(200);
    await request(app.getHttpServer()).get(url)
      .set('Authorization', 'Bearer ' + b.access_token).expect(404);
    await request(app.getHttpServer()).get(url)
      .set('Authorization', 'Bearer invalid-signature').expect(401);
    await request(app.getHttpServer()).get(url).expect(401);
    await db.parentSession.update({ where: { id: a.session_id }, data: { revokedAt: new Date(), revokedReason: 'logout' } });
    await request(app.getHttpServer()).get(url)
      .set('Authorization', 'Bearer ' + a.access_token).expect(401);
  });

  it('parent status update wins lock before create, so no child is inserted', async () => {
    // Hold the parent lock while beginning the competing create. The create
    // must wait, then observe pending_deletion after the status update commits.
    let unlock!: () => void;
    let locked!: () => void;
    const release = new Promise<void>((resolve) => { unlock = resolve; });
    const acquired = new Promise<void>((resolve) => { locked = resolve; });
    const update = db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM parent_accounts WHERE id = ${parentB}::uuid FOR UPDATE`;
      locked();
      await release;
      await tx.parentAccount.update({
        where: { id: parentB }, data: { lifecycle: 'pending_deletion' },
      });
    });
    await acquired;
    const competing = profiles.create(parentB, { age_months: 30, reference_date: '2026-01-01' });
    unlock();
    await update;
    await expect(competing).rejects.toBeInstanceOf(NotFoundException);
    expect(await db.childProfile.count({ where: { parentId: parentB } })).toBe(0);
  });
});
