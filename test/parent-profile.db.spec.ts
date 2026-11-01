import { randomUUID } from 'node:crypto';
import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ParentProfileService } from '../src/modules/identity/parent-profile.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
describeDb('LMP-41 parent-owned optional profile data in PostgreSQL', () => {
  const db = new PrismaClient();
  const owner = randomUUID();
  const outsider = randomUUID();
  const profiles = new ParentProfileService({ get db() { return db; } } as PrismaService);
  beforeAll(async () => {
    await db.$connect();
    await db.parentAccount.createMany({ data: [
      { id: owner, lifecycle: 'active' },
      { id: outsider, lifecycle: 'active' },
    ] });
  });
  afterAll(async () => {
    await db.parentProfile.deleteMany({ where: { parentId: { in: [owner, outsider] } } });
    await db.parentAccount.deleteMany({ where: { id: { in: [owner, outsider] } } });
    await db.$disconnect();
  });
  it('never exposes another parent data on read and supports partial and deletion', async () => {
    await profiles.update(owner, { first_name: 'Çağrı', occupation_optional: 'technology' });
    const other = await profiles.get(outsider);
    expect(other.first_name).toBeNull();
    expect(other.occupation_optional).toBeNull();
    const existing = await profiles.get(owner);
    expect(existing.first_name).toBe('Çağrı');
    await profiles.update(owner, { occupation_optional: null });
    expect((await profiles.get(owner)).occupation_optional).toBeNull();
    await profiles.clear(owner);
    expect((await profiles.get(owner)).first_name).toBeNull();
    expect((await db.parentProfile.findUniqueOrThrow({ where: { parentId: owner } })).lastName).toBeNull();
  });
  it('does not write when parent lifecycle is inactive', async () => {
    await db.parentAccount.update({ where: { id: outsider }, data: { lifecycle: 'pending_deletion' } });
    await expect(profiles.update(outsider, { first_name: 'Blocked' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(profiles.get(outsider)).rejects.toBeInstanceOf(NotFoundException);
    expect(await db.parentProfile.count({ where: { parentId: outsider } })).toBe(0);
  });
});
