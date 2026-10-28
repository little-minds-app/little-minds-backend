import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

/**
 * Internal ownership helper (ADR-019 §6.1) — not an HTTP route.
 * Returns true when the child exists, is not soft-deleted, and belongs to parent.
 */
export async function parentOwnsChild(
  db: PrismaClient | Prisma.TransactionClient,
  parentId: string,
  childId: string,
): Promise<boolean> {
  const child = await db.childProfile.findFirst({
    where: {
      id: childId,
      parentId,
      deletedAt: null,
    },
    select: { id: true },
  });
  return child !== null;
}

/**
 * Assert ownership; callers map false → HTTP 404 (anti-enumeration).
 */
export async function assertParentOwnsChild(
  db: PrismaClient | Prisma.TransactionClient,
  parentId: string,
  childId: string,
): Promise<void> {
  const owned = await parentOwnsChild(db, parentId, childId);
  if (!owned) {
    const err = new Error('child_not_owned');
    err.name = 'ChildNotOwnedError';
    throw err;
  }
}
