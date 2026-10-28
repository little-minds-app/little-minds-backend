import {
  assertParentOwnsChild,
  parentOwnsChild,
} from './parent-ownership';

describe('parent ownership helper (LMP-33)', () => {
  const parentA = '11111111-1111-4111-8111-111111111111';
  const parentB = '22222222-2222-4222-8222-222222222222';
  const childA = '33333333-3333-4333-8333-333333333324';

  function mockDb(row: { id: string } | null) {
    return {
      childProfile: {
        findFirst: jest.fn().mockResolvedValue(row),
      },
    } as never;
  }

  it('returns true when child belongs to parent', async () => {
    await expect(parentOwnsChild(mockDb({ id: childA }), parentA, childA)).resolves.toBe(
      true,
    );
  });

  it('returns false for cross-account child', async () => {
    await expect(parentOwnsChild(mockDb(null), parentB, childA)).resolves.toBe(
      false,
    );
  });

  it('assertParentOwnsChild throws ChildNotOwnedError on deny', async () => {
    await expect(
      assertParentOwnsChild(mockDb(null), parentB, childA),
    ).rejects.toMatchObject({ name: 'ChildNotOwnedError' });
  });
});
