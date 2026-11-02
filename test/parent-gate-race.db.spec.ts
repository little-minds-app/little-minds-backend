/** Real PostgreSQL concurrency: reset and verify cannot leave a grant from an old PIN. */
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { ParentGatePinService } from '../src/modules/identity/parent-gate-pin.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { StepUpService } from '../src/modules/identity/linking/step-up.service';
import type { AppEnv } from '../src/config/env.validation';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('LMP-42 PIN reset and verify real PostgreSQL race', () => {
  // Two physical clients, not a mocked sequential transaction.
  const primary = new PrismaClient();
  const concurrent = new PrismaClient();
  const parentId = randomUUID();
  const sessionId = randomUUID();
  const proof = { consumeParentGateTx: async () => undefined } as unknown as StepUpService;
  const config = { get: () => 'lmp42-db-concurrency-test-pepper-32-chars' } as unknown as ConfigService<AppEnv, true>;
  const a = new ParentGatePinService({ get db() { return primary; } } as PrismaService, config, proof);
  const b = new ParentGatePinService({ get db() { return concurrent; } } as PrismaService, config, proof);

  beforeAll(async () => {
    await Promise.all([primary.$connect(), concurrent.$connect()]);
    await primary.parentAccount.create({ data: { id: parentId, lifecycle: 'active' } });
    await primary.parentSession.create({ data: {
      id: sessionId, parentId, tokenFamilyId: randomUUID(),
      expiresAt: new Date(Date.now() + 3_600_000),
    } });
    await a.setWithProof(parentId, sessionId, 'fresh-setup-proof', '123456', '123456', false);
  });

  afterAll(async () => {
    await primary.parentAccount.deleteMany({ where: { id: parentId } });
    await Promise.all([primary.$disconnect(), concurrent.$disconnect()]);
  });

  it('old PIN cannot leave an authorized grant when verify races with reset', async () => {
    const attempts = await Promise.allSettled([
      a.setWithProof(parentId, sessionId, 'fresh-reset-proof', '654321', '654321', true),
      b.verifyAndIssue(parentId, sessionId, '123456'),
    ]);
    expect(attempts[0].status).toBe('fulfilled');
    // Either reset wins and old PIN fails, or verify wins and reset deletes its grant.
    expect(await primary.parentGateGrant.count({ where: { parentId } })).toBe(0);
    await expect(a.verifyAndIssue(parentId, sessionId, '123456')).rejects.toThrow();
    const replacement = await a.verifyAndIssue(parentId, sessionId, '654321');
    await expect(a.requireGrant(parentId, sessionId, replacement.gate_token)).resolves.toBeUndefined();
  });
  it('reset commits before waiting verifier can obtain the row lock', async () => {
    let release!: () => void;
    let locked!: () => void;
    const hold = new Promise<void>((resolve) => { release = resolve; });
    const acquired = new Promise<void>((resolve) => { locked = resolve; });
    const blocker = primary.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM parent_accounts WHERE id = ${parentId}::uuid FOR UPDATE`;
      locked();
      await hold;
    });
    await acquired;
    try {
      // While lock is held, both operations must be waiting, not succeeding.
      const reset = b.setWithProof(parentId, sessionId, 'reset-proof-2', '111111', '111111', true);
      const verify = a.verifyAndIssue(parentId, sessionId, '654321');
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(await primary.parentGateGrant.count({ where: { parentId } })).toBe(1);
      release();
      await blocker;
      const results = await Promise.allSettled([reset, verify]);
      expect(results[0].status).toBe('fulfilled');
      // Whether verify was queued before or after reset, no old grant survives reset.
      expect(await primary.parentGateGrant.count({ where: { parentId } })).toBe(0);
      await expect(a.verifyAndIssue(parentId, sessionId, '654321')).rejects.toThrow();
      const replacement = await a.verifyAndIssue(parentId, sessionId, '111111');
      await expect(a.requireGrant(parentId, sessionId, replacement.gate_token)).resolves.toBeUndefined();
    } finally {
      release();
      await blocker;
    }
  });
});
