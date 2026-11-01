import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChildProfileService } from './child-profile.service';

describe('LMP-39 parent-owned child profiles', () => {
  const findFirst = jest.fn();
  const create = jest.fn();
  const parentFind = jest.fn();
  const prisma = { db: {
    childProfile: { findFirst, create },
    parentAccount: { findFirst: parentFind },
  } };
  const service = new ChildProfileService(prisma as never);
  beforeEach(() => jest.resetAllMocks());

  it('filters by authenticated parent and non-deleted child', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.get('parent-A', 'child-B')).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'child-B', parentId: 'parent-A', deletedAt: null, parent: { lifecycle: 'active' } },
    }));
  });

  it('never exposes a soft-deleted or another-parent profile', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.get('parent-B', 'child-A')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('uses the child timezone when resolving age-month rollover', async () => {
    findFirst.mockResolvedValue({
      id: 'child-A', parentId: 'parent-A', nicknameOptional: null,
      ageMonthsAtReference: 24, ageReferenceDate: new Date('2026-01-31T00:00:00Z'),
      preferredLocale: 'tr-TR', timezone: 'Pacific/Honolulu',
    });
    const result = await service.get('parent-A', 'child-A', new Date('2026-03-01T03:00:00Z'));
    expect(result.age_months).toBe(25); // Honolulu is still Feb 28.
  });

  it('rejects invalid ages before database writes', async () => {
    await expect(service.create('parent-A', {
      age_months: 24.5, reference_date: '2026-01-01',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('requires active parent when creating a profile', async () => {
    parentFind.mockResolvedValue(null);
    await expect(service.create('parent-A', {
      age_months: 24, reference_date: '2026-01-01',
    })).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });
});
