/**
 * Real PostgreSQL security tests for LMP-35 remediation:
 * - Google PKCE one-time OAuth transactions (P0)
 * - Provider-bound OIDC nonce consume (P1)
 * - Race-safe first-time identity create (P1)
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParentAccountLifecycle, PrismaClient } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { AppEnv } from '../src/config/env.validation';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
} from '../src/modules/identity/otp/otp.constants';
import { GOOGLE_PROVIDER } from '../src/modules/identity/otp/multi-provider.constants';
import { GooglePkceTransactionService } from '../src/modules/identity/providers/google-pkce-transaction.service';
import { OidcNonceService } from '../src/modules/identity/providers/oidc-nonce.service';
import { IdentityResolveService } from '../src/modules/identity/resolve/identity-resolve.service';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

function mockReq(ip = '127.0.0.1') {
  return {
    socket: { remoteAddress: ip },
    headers: {},
  } as never;
}

function s256Challenge(verifier: string): string {
  return createHash('sha256').update(verifier, 'utf8').digest('base64url');
}

describeDb('Multi-provider auth against PostgreSQL (LMP-35 security)', () => {
  const prisma = new PrismaClient();
  let pkce: GooglePkceTransactionService;
  let nonces: OidcNonceService;
  let resolve: IdentityResolveService;

  const redirectUri = 'http://localhost/oauth/google/callback';
  const clientId = 'test-google-aud';

  beforeAll(async () => {
    await prisma.$connect();

    const prismaService = {
      get db() {
        return prisma;
      },
    } as unknown as PrismaService;

    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          GOOGLE_CLIENT_IDS: [clientId],
          GOOGLE_REDIRECT_URIS: [redirectUri],
          GOOGLE_PKCE_ENABLED: true,
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;

    pkce = new GooglePkceTransactionService(prismaService, config);
    nonces = new OidcNonceService(prismaService);
    resolve = new IdentityResolveService();
  });

  afterAll(async () => {
    await prisma.authOauthTransaction.deleteMany({});
    await prisma.authOidcNonce.deleteMany({});
    await prisma.otpAbuseCounter.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.authOauthTransaction.deleteMany({});
    await prisma.authOidcNonce.deleteMany({});
    await prisma.otpAbuseCounter.deleteMany({});
  });

  it('migrated auth_oauth_transactions + auth_oidc_nonces exist', async () => {
    const tables = await prisma.$queryRaw<Array<{ relname: string }>>`
      SELECT relname FROM pg_class
      WHERE relname IN ('auth_oauth_transactions', 'auth_oidc_nonces')
        AND relkind = 'r'
    `;
    expect(tables.map((t) => t.relname).sort()).toEqual([
      'auth_oauth_transactions',
      'auth_oidc_nonces',
    ]);
  });

  describe('P0 Google PKCE transactions', () => {
    it('start → consume succeeds once; replay / mismatch / missing fail', async () => {
      const verifier = `v${'b'.repeat(42)}`;
      const challenge = s256Challenge(verifier);

      const started = await pkce.start(mockReq('10.0.0.1'), {
        redirectUri,
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
        clientId,
      });
      expect(started.state.length).toBeGreaterThanOrEqual(8);
      expect(started.client_id).toBe(clientId);
      expect(started.expires_in).toBe(600);

      const bound = await pkce.consumeOrThrow({
        state: started.state,
        codeVerifier: verifier,
        redirectUri,
      });
      expect(bound.clientId).toBe(clientId);
      expect(bound.redirectUri).toBe(redirectUri);

      // Replay consumed state.
      await expect(
        pkce.consumeOrThrow({
          state: started.state,
          codeVerifier: verifier,
          redirectUri,
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      // Missing state.
      await expect(
        pkce.consumeOrThrow({
          state: randomBytes(32).toString('base64url'),
          codeVerifier: verifier,
          redirectUri,
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      // Fresh tx then wrong verifier / redirect mismatch.
      const again = await pkce.start(mockReq('10.0.0.2'), {
        redirectUri,
        codeChallenge: challenge,
      });
      await expect(
        pkce.consumeOrThrow({
          state: again.state,
          codeVerifier: `x${'c'.repeat(42)}`,
          redirectUri,
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const third = await pkce.start(mockReq('10.0.0.3'), {
        redirectUri,
        codeChallenge: challenge,
      });
      await expect(
        pkce.consumeOrThrow({
          state: third.state,
          codeVerifier: verifier,
          redirectUri: 'http://evil.example/cb',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      // Mismatch must not consume the row.
      const row = await prisma.authOauthTransaction.findFirst({
        where: {
          stateHash: GooglePkceTransactionService.hashState(third.state),
        },
      });
      expect(row?.consumedAt).toBeNull();
    });

    it('rejects expired PKCE transactions', async () => {
      const verifier = `v${'d'.repeat(42)}`;
      const challenge = s256Challenge(verifier);
      const state = randomBytes(32).toString('base64url');
      const stateHash = GooglePkceTransactionService.hashState(state);
      const past = new Date(Date.now() - 60_000);

      await prisma.authOauthTransaction.create({
        data: {
          id: randomUUID(),
          stateHash,
          provider: GOOGLE_PROVIDER,
          clientId,
          redirectUri,
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
          expiresAt: past,
        },
      });

      await expect(
        pkce.consumeOrThrow({
          state,
          codeVerifier: verifier,
          redirectUri,
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('concurrent consume is single-winner', async () => {
      const verifier = `v${'e'.repeat(42)}`;
      const challenge = s256Challenge(verifier);
      const started = await pkce.start(mockReq('10.0.0.4'), {
        redirectUri,
        codeChallenge: challenge,
      });

      const results = await Promise.allSettled([
        pkce.consumeOrThrow({
          state: started.state,
          codeVerifier: verifier,
          redirectUri,
        }),
        pkce.consumeOrThrow({
          state: started.state,
          codeVerifier: verifier,
          redirectUri,
        }),
        pkce.consumeOrThrow({
          state: started.state,
          codeVerifier: verifier,
          redirectUri,
        }),
      ]);

      const ok = results.filter((r) => r.status === 'fulfilled');
      const fail = results.filter((r) => r.status === 'rejected');
      expect(ok).toHaveLength(1);
      expect(fail).toHaveLength(2);

      const consumed = await prisma.authOauthTransaction.count({
        where: {
          stateHash: GooglePkceTransactionService.hashState(started.state),
          consumedAt: { not: null },
        },
      });
      expect(consumed).toBe(1);
    });
  });

  describe('P1 OIDC nonce provider binding', () => {
    it('consumeAfterVerify is provider-bound and single-use', async () => {
      const apple = await nonces.issue(mockReq('10.1.0.1'), 'apple');
      const google = await nonces.issue(mockReq('10.1.0.2'), 'google');

      // Cross-provider reject; must not burn apple nonce.
      await expect(
        nonces.consumeAfterVerify(apple.nonce, 'google'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const appleRow = await prisma.authOidcNonce.findFirst({
        where: { nonceHash: OidcNonceService.hashNonce(apple.nonce) },
      });
      expect(appleRow?.consumedAt).toBeNull();

      await nonces.consumeAfterVerify(apple.nonce, 'apple');
      await expect(
        nonces.consumeAfterVerify(apple.nonce, 'apple'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      await nonces.consumeAfterVerify(google.nonce, 'google');
    });

    it('concurrent nonce consume is single-winner', async () => {
      const issued = await nonces.issue(mockReq('10.1.0.3'), 'apple');
      const results = await Promise.allSettled([
        nonces.consumeAfterVerify(issued.nonce, 'apple'),
        nonces.consumeAfterVerify(issued.nonce, 'apple'),
        nonces.consumeAfterVerify(issued.nonce, 'apple'),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(2);
    });
  });

  describe('P1 race-safe identity create', () => {
    const subject = `race-sub-${randomUUID()}`;

    afterEach(async () => {
      const ids = await prisma.parentIdentity.findMany({
        where: { provider: 'apple', providerSubject: { startsWith: 'race-sub-' } },
        select: { parentId: true },
      });
      const parentIds = [...new Set(ids.map((i) => i.parentId))];
      if (parentIds.length === 0) {
        return;
      }
      await prisma.privacyNoticeAcknowledgment.deleteMany({
        where: { parentId: { in: parentIds } },
      });
      await prisma.parentIdentity.deleteMany({
        where: { parentId: { in: parentIds } },
      });
      await prisma.parentAccount.deleteMany({
        where: { id: { in: parentIds } },
      });
    });

    it('concurrent first-time creates yield one canonical parent', async () => {
      const now = new Date();
      const input = {
        provider: 'apple',
        providerSubject: subject,
        verifiedContact: null as string | null,
        noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
        noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
        noticePresentedAt: now,
        presentationSurface: 'apple_auth',
        now,
      };

      const results = await Promise.allSettled([
        prisma.$transaction((tx) => resolve.resolveOrCreateParentTx(tx, input)),
        prisma.$transaction((tx) => resolve.resolveOrCreateParentTx(tx, input)),
        prisma.$transaction((tx) => resolve.resolveOrCreateParentTx(tx, input)),
        prisma.$transaction((tx) => resolve.resolveOrCreateParentTx(tx, input)),
      ]);

      const fulfilled = results.filter(
        (r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled',
      );
      expect(fulfilled.length).toBeGreaterThanOrEqual(1);

      // All successes share the same parent id.
      const uniqueParents = new Set(fulfilled.map((r) => r.value));
      expect(uniqueParents.size).toBe(1);

      const identities = await prisma.parentIdentity.findMany({
        where: { provider: 'apple', providerSubject: subject },
      });
      expect(identities).toHaveLength(1);

      const parents = await prisma.parentAccount.findMany({
        where: { id: identities[0].parentId },
      });
      expect(parents).toHaveLength(1);
      expect(parents[0].lifecycle).toBe(ParentAccountLifecycle.active);

      const notices = await prisma.privacyNoticeAcknowledgment.count({
        where: { parentId: identities[0].parentId },
      });
      expect(notices).toBe(1);
    });

    it('unlinked historical subject maps to uniform auth failure (no relink)', async () => {
      const parentId = randomUUID();
      const unlinkedSubject = `race-sub-unlinked-${randomUUID()}`;
      await prisma.parentAccount.create({
        data: {
          id: parentId,
          locale: 'tr-TR',
          timezone: 'Europe/Istanbul',
          lifecycle: ParentAccountLifecycle.active,
        },
      });
      await prisma.parentIdentity.create({
        data: {
          id: randomUUID(),
          parentId,
          provider: 'apple',
          providerSubject: unlinkedSubject,
          unlinkedAt: new Date(),
        },
      });

      await expect(
        prisma.$transaction((tx) =>
          resolve.resolveOrCreateParentTx(tx, {
            provider: 'apple',
            providerSubject: unlinkedSubject,
            noticeVersion: ACTIVE_PRIVACY_NOTICE_VERSION,
            noticeLocale: ACTIVE_PRIVACY_NOTICE_LOCALE,
            noticePresentedAt: new Date(),
            presentationSurface: 'apple_auth',
            now: new Date(),
          }),
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const count = await prisma.parentIdentity.count({
        where: { provider: 'apple', providerSubject: unlinkedSubject },
      });
      expect(count).toBe(1);
    });
  });
});
