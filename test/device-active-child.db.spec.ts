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

  it('reads null child before bind', async () => {
    const binding = await service.get(parentId, installationId);
    expect(binding.device_id).toBe(scopedId);
    expect(binding.installation_id).toBe(installationId);
    expect(binding.child_id).toBeNull();
  });

  it('binds owned child and reads back', async () => {
    const bound = await service.set(parentId, installationId, childId);
    expect(bound.child_id).toBe(childId);
    const read = await service.get(parentId, installationId);
    expect(read.child_id).toBe(childId);
  });

  it('rejects foreign child ownership uniformly', async () => {
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
      service.set(parentId, installationId, foreignChild),
    ).rejects.toMatchObject({ status: 404 });
    await db.childProfile.deleteMany({ where: { id: foreignChild } });
    await db.parentAccount.deleteMany({ where: { id: otherParent } });
  });

  it('clears binding with null child_id', async () => {
    await service.set(parentId, installationId, otherChildId);
    const cleared = await service.set(parentId, installationId, null);
    expect(cleared.child_id).toBeNull();
  });
});
