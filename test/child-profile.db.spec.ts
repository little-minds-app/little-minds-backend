import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { ChildProfileService } from '../src/modules/child-profile/child-profile.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('LMP-39 child profile ownership against PostgreSQL', () => {
  const db = new PrismaClient();
  const parentA = randomUUID();
  const parentB = randomUUID();
  const profiles = new ChildProfileService({ get db() { return db; } } as PrismaService);

  beforeAll(async () => {
    await db.$connect();
    await db.parentAccount.createMany({
      data: [{ id: parentA, lifecycle: 'active' }, { id: parentB, lifecycle: 'active' }],
    });
  });

  afterAll(async () => {
    await db.childProfile.deleteMany({ where: { parentId: { in: [parentA, parentB] } } });
    await db.parentAccount.deleteMany({ where: { id: { in: [parentA, parentB] } } });
    await db.$disconnect();
  });

  it('persists approximate age without exact DOB and isolates one parent from another', async () => {
    const created = await profiles.create(parentA, {
      age_months: 32,
      reference_date: '2026-01-31',
      nickname: 'Fictional child',
      timezone: 'Europe/Istanbul',
    });
    const owned = await profiles.get(parentA, created.child_id, new Date('2026-03-01T12:00:00Z'));
    expect(owned.age_months).toBe(33);
    expect(owned.nickname).toBe('Fictional child');
    await expect(profiles.get(parentB, created.child_id)).rejects.toBeInstanceOf(NotFoundException);
    const stored = await db.childProfile.findUniqueOrThrow({ where: { id: created.child_id } });
    expect(stored.parentId).toBe(parentA);
    expect(stored.ageMonthsAtReference).toBe(32);
    expect(stored.ageReferenceDate.toISOString().slice(0, 10)).toBe('2026-01-31');
  });

  it('hides soft-deleted profiles even from their owner', async () => {
    const created = await profiles.create(parentA, {
      age_months: 47, reference_date: '2026-01-01',
    });
    await db.childProfile.update({
      where: { id: created.child_id }, data: { deletedAt: new Date() },
    });
    await expect(profiles.get(parentA, created.child_id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('denies creation for inactive parents', async () => {
    await db.parentAccount.update({
      where: { id: parentB }, data: { lifecycle: 'pending_deletion' },
    });
    await expect(profiles.create(parentB, {
      age_months: 24, reference_date: '2026-01-01',
    })).rejects.toBeInstanceOf(NotFoundException);
  });
});
