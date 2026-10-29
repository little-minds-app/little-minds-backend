import { AccountLinkOutcome, ParentAccountLifecycle } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { throwIdentityCollision } from '../session/auth.errors';
import { AccountLinkingService } from './account-linking.service';
import { LINK_AUDIT_SUBJECT_PREFIX } from './account-linking.constants';

type IdentityRow = {
  id: string;
  parentId: string;
  provider: string;
  providerSubject: string;
  unlinkedAt: Date | null;
  linkedAt: Date;
  verifiedContact: string | null;
  verifiedAt: Date | null;
};

type AuditRow = {
  id: string;
  parentId: string;
  sessionId: string | null;
  provider: string;
  providerSubjectHash: string;
  outcome: AccountLinkOutcome;
  identityId: string | null;
};

function subjectHash(provider: string, subject: string): string {
  return createHash('sha256')
    .update(`${LINK_AUDIT_SUBJECT_PREFIX}${provider}|${subject}`)
    .digest('hex');
}

/**
 * In-memory tx stub covering collision A–E paths without PostgreSQL.
 * Advisory lock is a no-op; uniqueness is enforced in-memory.
 */
function makeTx(state: {
  parents: Map<string, { lifecycle: ParentAccountLifecycle; deletedAt: Date | null }>;
  identities: IdentityRow[];
  audits: AuditRow[];
}) {
  return {
    $executeRaw: async () => 1,
    $queryRaw: async () => [{ now: new Date() }],
    parentAccount: {
      findUnique: async ({ where: { id } }: { where: { id: string } }) => {
        const p = state.parents.get(id);
        if (!p) return null;
        return { id, lifecycle: p.lifecycle, deletedAt: p.deletedAt };
      },
    },
    parentIdentity: {
      findFirst: async ({
        where,
      }: {
        where: { provider: string; providerSubject: string };
      }) =>
        state.identities.find(
          (r) =>
            r.provider === where.provider &&
            r.providerSubject === where.providerSubject,
        ) ?? null,
      create: async ({ data }: { data: IdentityRow }) => {
        if (
          state.identities.some(
            (r) =>
              r.provider === data.provider &&
              r.providerSubject === data.providerSubject,
          )
        ) {
          const err = Object.assign(new Error('unique'), { code: 'P2002' });
          throw err;
        }
        state.identities.push({ ...data, unlinkedAt: null });
        return data;
      },
    },
    accountLinkAudit: {
      create: async ({ data }: { data: AuditRow }) => {
        state.audits.push(data);
        return data;
      },
    },
  };
}

describe('AccountLinkingService collision A–E (unit)', () => {
  const parentA = randomUUID();
  const parentB = randomUUID();
  const sessionId = randomUUID();
  let service: AccountLinkingService;

  beforeEach(() => {
    service = new AccountLinkingService(
      {} as never,
      {} as never,
      {} as never, // stepUp unused in linkVerifiedSubjectTx unit path
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  async function run(
    state: {
      parents: Map<string, { lifecycle: ParentAccountLifecycle; deletedAt: Date | null }>;
      identities: IdentityRow[];
      audits: AuditRow[];
    },
    parentId: string,
    subject: string,
  ) {
    return service.linkVerifiedSubjectTx(makeTx(state) as never, {
      parentId,
      sessionId,
      proof: {
        provider: 'apple',
        providerSubject: subject,
        verifiedContact: null,
      },
    });
  }

  it('Case A — free subject links to authenticated parent', async () => {
    const state = {
      parents: new Map([
        [parentA, { lifecycle: ParentAccountLifecycle.active, deletedAt: null }],
      ]),
      identities: [] as IdentityRow[],
      audits: [] as AuditRow[],
    };
    const subject = `sub-a-${randomUUID()}`;
    const out = await run(state, parentA, subject);
    expect(out.kind).toBe('ok');
    if (out.kind !== 'ok') return;
    expect(out.alreadyLinked).toBe(false);
    expect(state.identities).toHaveLength(1);
    expect(state.identities[0].parentId).toBe(parentA);
    expect(state.audits[0].outcome).toBe(AccountLinkOutcome.linked);
    expect(state.audits[0].providerSubjectHash).toBe(
      subjectHash('apple', subject),
    );
  });

  it('Case B — already linked to same parent is idempotent', async () => {
    const subject = `sub-b-${randomUUID()}`;
    const identityId = randomUUID();
    const linkedAt = new Date('2026-01-01T00:00:00.000Z');
    const state = {
      parents: new Map([
        [parentA, { lifecycle: ParentAccountLifecycle.active, deletedAt: null }],
      ]),
      identities: [
        {
          id: identityId,
          parentId: parentA,
          provider: 'apple',
          providerSubject: subject,
          unlinkedAt: null,
          linkedAt,
          verifiedContact: null,
          verifiedAt: linkedAt,
        },
      ] as IdentityRow[],
      audits: [] as AuditRow[],
    };
    const out = await run(state, parentA, subject);
    expect(out.kind).toBe('ok');
    if (out.kind !== 'ok') return;
    expect(out.alreadyLinked).toBe(true);
    expect(out.identityId).toBe(identityId);
    expect(state.identities).toHaveLength(1);
    expect(state.audits[0].outcome).toBe(AccountLinkOutcome.already_linked);
  });

  it('Case C — active on different parent → collision (no other parent id leak)', async () => {
    const subject = `sub-c-${randomUUID()}`;
    const state = {
      parents: new Map([
        [parentA, { lifecycle: ParentAccountLifecycle.active, deletedAt: null }],
        [parentB, { lifecycle: ParentAccountLifecycle.active, deletedAt: null }],
      ]),
      identities: [
        {
          id: randomUUID(),
          parentId: parentB,
          provider: 'apple',
          providerSubject: subject,
          unlinkedAt: null,
          linkedAt: new Date(),
          verifiedContact: null,
          verifiedAt: new Date(),
        },
      ] as IdentityRow[],
      audits: [] as AuditRow[],
    };
    const out = await run(state, parentA, subject);
    expect(out).toEqual({
      kind: 'collision',
      outcome: AccountLinkOutcome.collision_other_parent,
    });
    expect(state.identities).toHaveLength(1);
    expect(state.audits[0].outcome).toBe(
      AccountLinkOutcome.collision_other_parent,
    );
    expect(JSON.stringify(state.audits[0])).not.toContain(parentB);
  });

  it('Case D — historical unlinked row → collision (no silent relink)', async () => {
    const subject = `sub-d-${randomUUID()}`;
    const state = {
      parents: new Map([
        [parentA, { lifecycle: ParentAccountLifecycle.active, deletedAt: null }],
      ]),
      identities: [
        {
          id: randomUUID(),
          parentId: parentB,
          provider: 'apple',
          providerSubject: subject,
          unlinkedAt: new Date('2026-02-01T00:00:00.000Z'),
          linkedAt: new Date('2026-01-01T00:00:00.000Z'),
          verifiedContact: null,
          verifiedAt: new Date(),
        },
      ] as IdentityRow[],
      audits: [] as AuditRow[],
    };
    const out = await run(state, parentA, subject);
    expect(out).toEqual({
      kind: 'collision',
      outcome: AccountLinkOutcome.collision_unlinked,
    });
    expect(state.audits[0].outcome).toBe(
      AccountLinkOutcome.collision_unlinked,
    );
  });

  it('Case E — unique race maps to collision_race', async () => {
    const subject = `sub-e-${randomUUID()}`;
    const state = {
      parents: new Map([
        [parentA, { lifecycle: ParentAccountLifecycle.active, deletedAt: null }],
      ]),
      identities: [] as IdentityRow[],
      audits: [] as AuditRow[],
    };
    const tx = makeTx(state);
    // Pretend a concurrent insert lands between findFirst and create.
    tx.parentIdentity.findFirst = async () => null;
    tx.parentIdentity.create = async () => {
      const err = Object.assign(new Error('unique'), { code: 'P2002' });
      throw err;
    };
    const out = await service.linkVerifiedSubjectTx(tx as never, {
      parentId: parentA,
      sessionId,
      proof: {
        provider: 'google',
        providerSubject: subject,
        verifiedContact: null,
      },
    });
    expect(out).toEqual({
      kind: 'collision',
      outcome: AccountLinkOutcome.collision_race,
    });
  });

  it('throwIdentityCollision uses 409 without other-parent disclosure', () => {
    try {
      throwIdentityCollision();
      fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const http = err as HttpException;
      expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(http.getResponse()).toEqual({
        error: 'identity_collision',
        message: 'This sign-in method cannot be linked',
      });
    }
  });
});

