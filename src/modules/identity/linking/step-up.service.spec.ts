import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { StepUpService } from './step-up.service';
import { STEP_UP_PURPOSE_IDENTITY_LINK } from './step-up.constants';

describe('StepUpService consumeIdentityLinkTx (unit)', () => {
  const parentA = '11111111-1111-4111-8111-111111111111';
  const parentB = '22222222-2222-4222-8222-222222222222';
  const sessionA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const sessionB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  type Row = {
    tokenHash: string;
    parentId: string;
    sessionId: string;
    purpose: string;
    expiresAt: Date;
    consumedAt: Date | null;
  };

  function makeTx(rows: Row[]) {
    return {
      $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
        const sql = strings.join('?');
        if (sql.includes('clock_timestamp')) {
          return [{ now: new Date() }];
        }
        if (sql.includes('UPDATE auth_step_up_challenges')) {
          const tokenHash = values[1] as string;
          const parentId = values[2] as string;
          const sessionId = values[3] as string;
          const purpose = values[4] as string;
          const now = values[0] as Date;
          const hit = rows.find(
            (r) =>
              r.tokenHash === tokenHash &&
              r.parentId === parentId &&
              r.sessionId === sessionId &&
              r.purpose === purpose &&
              r.consumedAt == null &&
              r.expiresAt > now,
          );
          if (!hit) return [];
          hit.consumedAt = now;
          return [{ id: 'ok' }];
        }
        return [];
      },
    };
  }

  const service = new StepUpService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  it('positive: consumes matching parent+session+purpose once', async () => {
    const plaintext = 'lms1.' + 'a'.repeat(40);
    const rows: Row[] = [
      {
        tokenHash: StepUpService.hashToken(plaintext),
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      },
    ];
    await service.consumeIdentityLinkTx(makeTx(rows) as never, {
      stepUpToken: plaintext,
      parentId: parentA,
      sessionId: sessionA,
    });
    expect(rows[0].consumedAt).not.toBeNull();
  });

  it('replay: second consume fails', async () => {
    const plaintext = 'lms1.' + 'b'.repeat(40);
    const rows: Row[] = [
      {
        tokenHash: StepUpService.hashToken(plaintext),
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      },
    ];
    const tx = makeTx(rows);
    await service.consumeIdentityLinkTx(tx as never, {
      stepUpToken: plaintext,
      parentId: parentA,
      sessionId: sessionA,
    });
    await expect(
      service.consumeIdentityLinkTx(tx as never, {
        stepUpToken: plaintext,
        parentId: parentA,
        sessionId: sessionA,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('cross-parent: other parent cannot consume', async () => {
    const plaintext = 'lms1.' + 'c'.repeat(40);
    const rows: Row[] = [
      {
        tokenHash: StepUpService.hashToken(plaintext),
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      },
    ];
    await expect(
      service.consumeIdentityLinkTx(makeTx(rows) as never, {
        stepUpToken: plaintext,
        parentId: parentB,
        sessionId: sessionA,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(rows[0].consumedAt).toBeNull();
  });

  it('cross-session: different session cannot consume', async () => {
    const plaintext = 'lms1.' + 'd'.repeat(40);
    const rows: Row[] = [
      {
        tokenHash: StepUpService.hashToken(plaintext),
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      },
    ];
    await expect(
      service.consumeIdentityLinkTx(makeTx(rows) as never, {
        stepUpToken: plaintext,
        parentId: parentA,
        sessionId: sessionB,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('stale: expired token fails', async () => {
    const plaintext = 'lms1.' + 'e'.repeat(40);
    const rows: Row[] = [
      {
        tokenHash: StepUpService.hashToken(plaintext),
        parentId: parentA,
        sessionId: sessionA,
        purpose: STEP_UP_PURPOSE_IDENTITY_LINK,
        expiresAt: new Date(Date.now() - 1_000),
        consumedAt: null,
      },
    ];
    await expect(
      service.consumeIdentityLinkTx(makeTx(rows) as never, {
        stepUpToken: plaintext,
        parentId: parentA,
        sessionId: sessionA,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('missing/short token → invalid_token', async () => {
    try {
      await service.consumeIdentityLinkTx(makeTx([]) as never, {
        stepUpToken: 'short',
        parentId: parentA,
        sessionId: sessionA,
      });
      fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });
});
