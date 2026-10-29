/**
 * Real PostgreSQL: GSM resolveOrCreate shares identity:provider:subject lock
 * with LMP-36 link — concurrent create yields one parent; unlinked fail-closed.
 */
import { ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
  PHONE_PROVIDER,
} from '../src/modules/identity/otp/otp.constants';
import { identitySubjectLockKey } from '../src/modules/identity/resolve/identity-subject-lock';
import { IdentityResolveService } from '../src/modules/identity/resolve/identity-resolve.service';
import { AccountLinkingService } from '../src/modules/identity/linking/account-linking.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb('Phone identity lock vs link (LMP-36 P1 GSM concurrency)', () => {
  const prisma = new PrismaClient();
  const resolve = new IdentityResolveService();
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
      {} as never,
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
      await prisma.privacyNoticeAcknowledgment.deleteMany({
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

  it('lock key family matches identity:provider:subject', () => {
    const a = identitySubjectLockKey(PHONE_PROVIDER, 'subj-x');
    const b = identitySubjectLockKey(PHONE_PROVIDER, 'subj-x');
    const c = identitySubjectLockKey(PHONE_PROVIDER, 'subj-y');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('concurrent resolveOrCreate for same phone subject → one parent', async () => {
    const subject = `phone-lock-${randomUUID()}`;
    const notice = {
      noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
      noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      noticePresentedAt: new Date(),
      presentationSurface: 'phone_verify',
    };

    const results = await Promise.all([
      prisma.$transaction(async (tx) => {
        const now = new Date();
        return resolve.resolveOrCreateParentTx(tx, {
          provider: PHONE_PROVIDER,
          providerSubject: subject,
          noticeVersion: notice.noticeVersion,
          noticeLocale: notice.noticeLocale,
          noticePresentedAt: notice.noticePresentedAt,
          presentationSurface: notice.presentationSurface,
          now,
          otpStyleErrors: true,
        });
      }),
      prisma.$transaction(async (tx) => {
        const now = new Date();
        return resolve.resolveOrCreateParentTx(tx, {
          provider: PHONE_PROVIDER,
          providerSubject: subject,
          noticeVersion: notice.noticeVersion,
          noticeLocale: notice.noticeLocale,
          noticePresentedAt: notice.noticePresentedAt,
          presentationSurface: notice.presentationSurface,
          now,
          otpStyleErrors: true,
        });
      }),
    ]);

    expect(results[0]).toBe(results[1]);
    createdParentIds.push(results[0]);

    const rows = await prisma.parentIdentity.findMany({
      where: {
        provider: PHONE_PROVIDER,
        providerSubject: subject,
        unlinkedAt: null,
      },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].parentId).toBe(results[0]);
  });

  it('concurrent GSM resolve vs link → one winner identity owner', async () => {
    const subject = `phone-race-link-${randomUUID()}`;
    const linkerParent = randomUUID();
    await prisma.parentAccount.create({
      data: {
        id: linkerParent,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
    });
    createdParentIds.push(linkerParent);

    const outcomes = await Promise.allSettled([
      prisma.$transaction(async (tx) => {
        const now = new Date();
        return resolve.resolveOrCreateParentTx(tx, {
          provider: PHONE_PROVIDER,
          providerSubject: subject,
          noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
          noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
          noticePresentedAt: now,
          presentationSurface: 'phone_verify',
          now,
          otpStyleErrors: true,
        });
      }),
      prisma.$transaction(async (tx) =>
        linking.linkVerifiedSubjectTx(tx, {
          parentId: linkerParent,
          sessionId: randomUUID(),
          proof: {
            provider: 'phone',
            providerSubject: subject,
            verifiedContact: null,
          },
        }),
      ),
    ]);

    const resolveOk = outcomes[0].status === 'fulfilled' ? outcomes[0].value : null;
    const linkOut =
      outcomes[1].status === 'fulfilled' ? outcomes[1].value : null;

    const rows = await prisma.parentIdentity.findMany({
      where: {
        provider: PHONE_PROVIDER,
        providerSubject: subject,
        unlinkedAt: null,
      },
    });
    expect(rows).toHaveLength(1);
    if (resolveOk) createdParentIds.push(resolveOk);

    // Exactly one active owner: either resolve created and link collided, or link won.
    if (linkOut && linkOut.kind === 'ok') {
      expect(rows[0].parentId).toBe(linkerParent);
    } else {
      expect(resolveOk).toBeTruthy();
      expect(rows[0].parentId).toBe(resolveOk);
      if (linkOut) {
        expect(linkOut.kind).toBe('collision');
      }
    }
  });

  it('unlinked historical phone subject → resolve fail-closed (no silent relink)', async () => {
    const subject = `phone-unlinked-${randomUUID()}`;
    const oldParent = randomUUID();
    await prisma.parentAccount.create({
      data: {
        id: oldParent,
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        lifecycle: ParentAccountLifecycle.active,
      },
    });
    createdParentIds.push(oldParent);
    await prisma.parentIdentity.create({
      data: {
        id: randomUUID(),
        parentId: oldParent,
        provider: PHONE_PROVIDER,
        providerSubject: subject,
        linkedAt: new Date('2026-01-01T00:00:00Z'),
        unlinkedAt: new Date('2026-02-01T00:00:00Z'),
        verifiedAt: new Date('2026-01-01T00:00:00Z'),
      },
    });

    await expect(
      prisma.$transaction(async (tx) => {
        const now = new Date();
        return resolve.resolveOrCreateParentTx(tx, {
          provider: PHONE_PROVIDER,
          providerSubject: subject,
          noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
          noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
          noticePresentedAt: now,
          presentationSurface: 'phone_verify',
          now,
          otpStyleErrors: true,
        });
      }),
    ).rejects.toBeTruthy();

    const active = await prisma.parentIdentity.findMany({
      where: {
        provider: PHONE_PROVIDER,
        providerSubject: subject,
        unlinkedAt: null,
      },
    });
    expect(active).toHaveLength(0);
  });
});
