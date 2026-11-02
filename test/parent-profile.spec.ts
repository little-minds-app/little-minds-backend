import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ParentProfileService } from '../src/modules/identity/parent-profile.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('LMP-41 parent profile safety', () => {
  const db = { parentAccount: { findFirst: jest.fn() }, parentProfile: { findUnique: jest.fn() }, $transaction: jest.fn() };
  const service = new ParentProfileService({ get db() { return db; } } as unknown as PrismaService);
  beforeEach(() => jest.resetAllMocks());
  it('permits skipping all profile fields', async () => {
    db.parentAccount.findFirst.mockResolvedValue({ id: 'p' });
    db.parentProfile.findUnique.mockResolvedValue(null);
    expect(await service.get('p')).toEqual({
      first_name: null, last_name: null, age_band_optional: null, gender_optional: null,
      number_of_children_optional: null, occupation_optional: null,
    });
  });
  it('hides non-active parent accounts', async () => {
    db.parentAccount.findFirst.mockResolvedValue(null);
    await expect(service.get('p')).rejects.toBeInstanceOf(NotFoundException);
  });
  it.each([{ random: 'x' }, { first_name: 123 }, { occupation_optional: 'Private employer' },
    { age_band_optional: 'underage' }, { number_of_children_optional: -1 },
    { number_of_children_optional: 31 }, {}, []])('rejects invalid profile data %p', async (input) => {
    await expect(service.update('p', input)).rejects.toBeInstanceOf(BadRequestException);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('fails closed on real-user demographic collection before dedicated legal approval', async () => {
    const restricted = new ParentProfileService(
      { get db() { return db; } } as unknown as PrismaService,
      { get: () => 'production' } as never,
    );
    await expect(restricted.update('p', { first_name: 'Sample' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(restricted.update('p', { occupation_optional: 'technology' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('accepts Unicode names and explicit clearing', async () => {
    const upsert = jest.fn().mockResolvedValue({
      firstName: 'Çağrı', lastName: null, ageBandOptional: null,
      genderOptional: null, numberOfChildrenOptional: null, occupationOptional: null,
    });
    db.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({ $queryRaw: jest.fn().mockResolvedValue([{ id: 'p' }]), parentProfile: { upsert } }));
    await service.update('p', { first_name: ' Çağrı ', occupation_optional: null });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { firstName: 'Çağrı', occupationOptional: null },
    }));
  });
});
