/**
 * Real PostgreSQL tests for LMP-36 account linking collision A–E + concurrency.
 */
import { AccountLinkOutcome, ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { AccountLinkingService } from '../src/modules/identity/linking/account-linking.service';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb('Account linking against PostgreSQL (LMP-36)', () => {
  const prisma = new PrismaClient();
  let linking: AccountLinkingService;
  const createdParentIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();
    const prismaService = {
      get db() {
        return prisma;
      },
    } as unknown as PrismaService;
    linking = new AccountLinkingService(
      prismaService,
      {} as never,
      {} as never, // stepUp — linkVerifiedSubjectTx path only in these tests
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  afterAll(async () => {
    if (createdParentIds.length > 0) {
      await prisma.accountLinkAudit.deleteMany({
        where: { parentId: { in: createdParentIds } },
      });
      await prisma.parentIdentity.deleteMany({
        where: { parentId: { in: createdParentIds } },
      });
      await prisma.parentAccount.deleteMany({
        where: { id: { in: createdParentIds } },
      });
    }
    await prisma.$disconnect();
  });

  async function createParent(): Promise<string> {
    const id = randomUUID();
    await prisma.parentAccount.create({
      data: {
        id,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
    });
    createdParentIds.push(id);
    return id;
  }

  it('migrated account_link_audits table exists', async () => {
    const tables = await prisma.$queryRaw<Array<{ relname: string }>>`
      SELECT relname FROM pg_class
      WHERE relname = 'account_link_audits' AND relkind = 'r'
    `;
    expect(tables).toHaveLength(1);
  });

  it('Case A+B — free subject links; re-link same parent is idempotent', async () => {
    const parentId = await createParent();
    const subject = `pg-ab-${randomUUID()}`;
    const sessionId = randomUUID();

    const first = await prisma.$transaction((tx) =>
      linking.linkVerifiedSubjectTx(tx, {
        parentId,
        sessionId,
        proof: {
          provider: 'google',
          providerSubject: subject,
          verifiedContact: null,
        },
      }),
    );
    expect(first.kind).toBe('ok');
    if (first.kind !== 'ok') return;
    expect(first.alreadyLinked).toBe(false);

    const second = await prisma.$transaction((tx) =>
      linking.linkVerifiedSubjectTx(tx, {
        parentId,
        sessionId,
        proof: {
          provider: 'google',
          providerSubject: subject,
          verifiedContact: null,
        },
      }),
    );
    expect(second.kind).toBe('ok');
    if (second.kind !== 'ok') return;
    expect(second.alreadyLinked).toBe(true);
    expect(second.identityId).toBe(first.identityId);

    const audits = await prisma.accountLinkAudit.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
    expect(audits.map((a) => a.outcome)).toEqual([
      AccountLinkOutcome.linked,
      AccountLinkOutcome.already_linked,
    ]);
  });

  it('Case C — different parent collision leaves other family untouched', async () => {
    const owner = await createParent();
    const attacker = await createParent();
    const subject = `pg-c-${randomUUID()}`;

    await prisma.$transaction((tx) =>
      linking.linkVerifiedSubjectTx(tx, {
        parentId: owner,
        sessionId: randomUUID(),
        proof: {
          provider: 'apple',
          providerSubject: subject,
          verifiedContact: null,
        },
      }),
    );

    const collision = await prisma.$transaction((tx) =>
      linking.linkVerifiedSubjectTx(tx, {
        parentId: attacker,
        sessionId: randomUUID(),
        proof: {
          provider: 'apple',
          providerSubject: subject,
          verifiedContact: null,
        },
      }),
    );
    expect(collision).toEqual({
      kind: 'collision',
      outcome: AccountLinkOutcome.collision_other_parent,
    });

    const row = await prisma.parentIdentity.findFirst({
      where: { provider: 'apple', providerSubject: subject },
    });
    expect(row?.parentId).toBe(owner);
    expect(row?.unlinkedAt).toBeNull();

    const attackerAudits = await prisma.accountLinkAudit.findMany({
      where: { parentId: attacker },
    });
    expect(attackerAudits).toHaveLength(1);
    expect(attackerAudits[0].outcome).toBe(
      AccountLinkOutcome.collision_other_parent,
    );
    expect(JSON.stringify(attackerAudits[0])).not.toContain(owner);
  });

  it('Case D — unlinked historical subject cannot silent-relink', async () => {
    const parentId = await createParent();
    const other = await createParent();
    const subject = `pg-d-${randomUUID()}`;
    await prisma.parentIdentity.create({
      data: {
        id: randomUUID(),
        parentId: other,
        provider: 'email',
        providerSubject: subject,
        linkedAt: new Date('2026-01-01T00:00:00Z'),
        unlinkedAt: new Date('2026-02-01T00:00:00Z'),
        verifiedAt: new Date('2026-01-01T00:00:00Z'),
      },
    });

    const out = await prisma.$transaction((tx) =>
      linking.linkVerifiedSubjectTx(tx, {
        parentId,
        sessionId: randomUUID(),
        proof: {
          provider: 'email',
          providerSubject: subject,
          verifiedContact: null,
        },
      }),
    );
    expect(out).toEqual({
      kind: 'collision',
      outcome: AccountLinkOutcome.collision_unlinked,
    });

    const still = await prisma.parentIdentity.findFirst({
      where: { provider: 'email', providerSubject: subject },
    });
    expect(still?.parentId).toBe(other);
    expect(still?.unlinkedAt).not.toBeNull();
  });

  it('Case E — concurrent dual-link yields exactly one winner', async () => {
    const parentX = await createParent();
    const parentY = await createParent();
    const subject = `pg-e-${randomUUID()}`;

    const results = await Promise.all([
      prisma.$transaction((tx) =>
        linking.linkVerifiedSubjectTx(tx, {
          parentId: parentX,
          sessionId: randomUUID(),
          proof: {
            provider: 'phone',
            providerSubject: subject,
            verifiedContact: null,
          },
        }),
      ),
      prisma.$transaction((tx) =>
        linking.linkVerifiedSubjectTx(tx, {
          parentId: parentY,
          sessionId: randomUUID(),
          proof: {
            provider: 'phone',
            providerSubject: subject,
            verifiedContact: null,
          },
        }),
      ),
    ]);

    const oks = results.filter((r) => r.kind === 'ok');
    const collisions = results.filter((r) => r.kind === 'collision');
    expect(oks).toHaveLength(1);
    expect(collisions).toHaveLength(1);

    const rows = await prisma.parentIdentity.findMany({
      where: { provider: 'phone', providerSubject: subject, unlinkedAt: null },
    });
    expect(rows).toHaveLength(1);
    expect([parentX, parentY]).toContain(rows[0].parentId);
  });
});
