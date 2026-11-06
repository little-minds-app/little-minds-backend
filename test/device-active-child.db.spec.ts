/** LMP-134 device active-child bind/read against PostgreSQL. */
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { SEED_IDS } from '../prisma/seed';
import { scopedDeviceId } from '../src/modules/identity/session/session-issuer.service';
import { DeviceActiveChildService } from '../src/modules/device/device-active-child.service';
import type { PrismaService } from '../src/modules/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('LMP-134 device active-child / PostgreSQL', () => {
  const db = new PrismaClient();
  const installationId = randomUUID();
  const parentId = SEED_IDS.parent;
  const childId = SEED_IDS.children[32];
  const otherChildId = SEED_IDS.children[24];
  const childC = SEED_IDS.children[47];
  const scopedId = scopedDeviceId(installationId, parentId);
  const service = new DeviceActiveChildService({
    get db() {
      return db;
    },
  } as PrismaService);

  beforeAll(async () => {
    await db.$connect();
    await db.device.create({
      data: {
        id: scopedId,
        parentId,
        platform: 'ios',
      },
    });
  });

  afterAll(async () => {
    await db.device.deleteMany({ where: { id: scopedId } });
    await db.$disconnect();
  });

  it('reads null child and revision 0 before bind', async () => {
    const binding = await service.get(parentId, installationId);
    expect(binding.device_id).toBe(scopedId);
    expect(binding.installation_id).toBe(installationId);
    expect(binding.child_id).toBeNull();
    expect(binding.binding_revision).toBe(0);
  });

  it('binds owned child and increments revision', async () => {
    const bound = await service.set(parentId, installationId, childId, 0);
    expect(bound.child_id).toBe(childId);
    expect(bound.binding_revision).toBe(1);
    const read = await service.get(parentId, installationId);
    expect(read.child_id).toBe(childId);
    expect(read.binding_revision).toBe(1);
  });

  it('rejects stale expected_binding_revision after a newer bind', async () => {
    await service.set(parentId, installationId, otherChildId, 1);
    await expect(
      service.set(parentId, installationId, childId, 0),
    ).rejects.toMatchObject({ status: 409 });
    const read = await service.get(parentId, installationId);
    expect(read.child_id).toBe(otherChildId);
    expect(read.binding_revision).toBe(2);
  });

  it('rejects foreign child ownership uniformly', async () => {
    const current = await service.get(parentId, installationId);
    const otherParent = randomUUID();
    await db.parentAccount.create({
      data: {
        id: otherParent,
        lifecycle: 'active',
      },
    });
    const foreignChild = randomUUID();
    await db.childProfile.create({
      data: {
        id: foreignChild,
        parentId: otherParent,
        ageMonthsAtReference: 32,
        ageReferenceDate: new Date('2026-01-01'),
        preferredLocale: 'tr-TR',
        timezone: 'Europe/Istanbul',
      },
    });
    await expect(
      service.set(
        parentId,
        installationId,
        foreignChild,
        current.binding_revision,
      ),
    ).rejects.toMatchObject({ status: 404 });
    await db.childProfile.deleteMany({ where: { id: foreignChild } });
    await db.parentAccount.deleteMany({ where: { id: otherParent } });
  });

  it('clears binding with null child_id and CAS revision', async () => {
    const current = await service.get(parentId, installationId);
    const cleared = await service.set(
      parentId,
      installationId,
      null,
      current.binding_revision,
    );
    expect(cleared.child_id).toBeNull();
    expect(cleared.binding_revision).toBe(current.binding_revision + 1);
  });

  it('delayed stale bind loses after concurrent winner (A after B)', async () => {
    const baseline = await service.get(parentId, installationId);
    await service.set(parentId, installationId, childC, baseline.binding_revision);
    await expect(
      service.set(parentId, installationId, childId, baseline.binding_revision),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('two-connection race: one accepted bind and one 409 conflict', async () => {
    const dbA = new PrismaClient();
    const dbB = new PrismaClient();
    const serviceA = new DeviceActiveChildService({
      get db() {
        return dbA;
      },
    } as PrismaService);
    const serviceB = new DeviceActiveChildService({
      get db() {
        return dbB;
      },
    } as PrismaService);
    const raceInstallation = randomUUID();
    const raceScoped = scopedDeviceId(raceInstallation, parentId);

    await db.device.create({
      data: { id: raceScoped, parentId, platform: 'ios' },
    });

    try {
      await dbA.$connect();
      await dbB.$connect();
      const baseline = await serviceA.get(parentId, raceInstallation);
      expect(baseline.binding_revision).toBe(0);

      let releaseRowLock: () => void = () => undefined;
      let rowLockReady: () => void = () => undefined;
      const rowLockReadyPromise = new Promise<void>((resolve) => {
        rowLockReady = resolve;
      });

      const holdRowLock = dbA.$transaction(
        async (tx) => {
          await tx.$executeRaw`
            SELECT id FROM devices
            WHERE id = ${raceScoped}::uuid
            FOR UPDATE
          `;
          rowLockReady();
          await new Promise<void>((resolve) => {
            releaseRowLock = resolve;
          });
        },
        { maxWait: 15_000, timeout: 60_000 },
      );

      await rowLockReadyPromise;

      const racing = Promise.allSettled([
        serviceA.set(parentId, raceInstallation, childId, 0),
        serviceB.set(parentId, raceInstallation, otherChildId, 0),
      ]);

      releaseRowLock();
      await holdRowLock;
      const results = await racing;

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const conflicts = results.filter(
        (r) =>
          r.status === 'rejected' &&
          (r.reason as { status?: number }).status === 409,
      );
      expect(fulfilled.length + conflicts.length).toBe(2);
      expect(fulfilled).toHaveLength(1);
      expect(conflicts).toHaveLength(1);

      const final = await service.get(parentId, raceInstallation);
      expect(final.binding_revision).toBe(1);
      expect([childId, otherChildId]).toContain(final.child_id);
    } finally {
      await db.device.deleteMany({ where: { id: raceScoped } });
      await dbA.$disconnect();
      await dbB.$disconnect();
    }
  });
});
