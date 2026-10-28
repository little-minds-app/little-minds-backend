import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ParentAccountLifecycle,
  ParentSessionRevokeReason,
  type ParentSession,
  type Prisma,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  MAX_ACTIVE_SESSIONS_PER_PARENT,
  SESSION_ABSOLUTE_TTL_MS,
} from './session.constants';
import { JwtAccessService } from './jwt-access.service';
import {
  appendHashHistory,
  generateRefreshToken,
  hashRefreshToken,
  parseHashHistory,
} from './refresh-token';
import {
  throwForbidden,
  throwUnauthorized,
} from './auth.errors';

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: typeof ACCESS_TOKEN_TTL_SECONDS;
  session_id: string;
  parent_id: string;
};

export type MintSessionInput = {
  parentId: string;
  deviceId?: string | null;
  clientSurface?: string | null;
  userAgentSummary?: string | null;
};

type TxClient = Prisma.TransactionClient;

@Injectable()
export class SessionIssuerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtAccessService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private pepper(): string {
    const pepper = this.config.get('REFRESH_TOKEN_PEPPER', { infer: true });
    if (!pepper || pepper.length < 16) {
      throw new Error(
        'Environment validation failed: REFRESH_TOKEN_PEPPER must be set (≥16 chars)',
      );
    }
    return pepper;
  }

  /** Peppered hash for rate-limit buckets — never store/log the raw token fragment. */
  refreshRateLimitKey(refreshToken: string): string {
    return hashRefreshToken(refreshToken, this.pepper());
  }

  async mintSession(input: MintSessionInput): Promise<TokenPair> {
    const db = this.prisma.db;
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken, this.pepper());
    const sessionId = randomUUID();
    const tokenFamilyId = randomUUID();

    await db.$transaction(async (tx) => {
      // Serialize mint per parent so the 20-session cap is concurrency-safe.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM parent_accounts
        WHERE id = ${input.parentId}::uuid
        FOR UPDATE
      `;
      if (locked.length === 0) {
        throwUnauthorized('invalid_token', 'Parent account is not active');
      }

      const parent = await tx.parentAccount.findUnique({
        where: { id: input.parentId },
      });
      if (
        !parent ||
        parent.deletedAt ||
        parent.lifecycle !== ParentAccountLifecycle.active
      ) {
        throwUnauthorized('invalid_token', 'Parent account is not active');
      }

      const now = new Date();
      const activeCount = await tx.parentSession.count({
        where: {
          parentId: input.parentId,
          revokedAt: null,
          expiresAt: { gt: now },
        },
      });
      if (activeCount >= MAX_ACTIVE_SESSIONS_PER_PARENT) {
        throwForbidden(
          'session_limit_exceeded',
          'Maximum active sessions reached',
        );
      }

      await tx.parentSession.create({
        data: {
          id: sessionId,
          parentId: input.parentId,
          tokenFamilyId,
          refreshTokenHash,
          refreshTokenHashHistory: [],
          refreshGeneration: 0,
          expiresAt: new Date(now.getTime() + SESSION_ABSOLUTE_TTL_MS),
          deviceId: input.deviceId ?? null,
          clientSurface: input.clientSurface ?? null,
          userAgentSummary: input.userAgentSummary ?? null,
        },
      });
    });

    const accessToken = await this.jwt.signAccessToken({
      parentId: input.parentId,
      sessionId,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      session_id: sessionId,
      parent_id: input.parentId,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const pepper = this.pepper();
    const presentedHash = hashRefreshToken(refreshToken, pepper);
    const db = this.prisma.db;
    const newRefresh = generateRefreshToken();
    const newHash = hashRefreshToken(newRefresh, pepper);

    // Return codes instead of throwing inside the txn — Nest HttpExceptions
    // would otherwise roll back reuse revocation (LMP-33 CI / Prisma).
    type RefreshOutcome =
      | { kind: 'rotated'; sessionId: string; parentId: string }
      | { kind: 'reuse' }
      | { kind: 'invalid' }
      | { kind: 'revoked' }
      | { kind: 'expired' };

    const outcome = await db.$transaction(async (tx): Promise<RefreshOutcome> => {
      const current = await tx.parentSession.findFirst({
        where: { refreshTokenHash: presentedHash },
      });

      if (!current) {
        const reused = await this.findHistoryMatchTx(tx, presentedHash);
        if (reused) {
          await this.revokeSessionTx(
            tx,
            reused.id,
            ParentSessionRevokeReason.refresh_reuse,
          );
          return { kind: 'reuse' };
        }
        return { kind: 'invalid' };
      }

      // Lock the session row before expiry / parent / rotation checks.
      await tx.$queryRaw`
        SELECT id FROM parent_sessions
        WHERE id = ${current.id}::uuid
        FOR UPDATE
      `;

      // Wall-clock after lock wait — not transaction-start NOW(), and not a
      // pre-lock Date captured before FOR UPDATE (LMP-33 re-review).
      const [{ now: dbNow }] = await tx.$queryRaw<Array<{ now: Date }>>`
        SELECT clock_timestamp() AS now
      `;
      const now = dbNow instanceof Date ? dbNow : new Date(dbNow);

      const locked = await tx.parentSession.findUnique({
        where: { id: current.id },
      });
      if (!locked || locked.refreshTokenHash !== presentedHash) {
        return { kind: 'invalid' };
      }
      if (locked.revokedAt) {
        return { kind: 'revoked' };
      }
      if (locked.expiresAt.getTime() <= now.getTime()) {
        return { kind: 'expired' };
      }

      const parent = await tx.parentAccount.findUnique({
        where: { id: locked.parentId },
      });
      if (
        !parent ||
        parent.deletedAt ||
        parent.lifecycle !== ParentAccountLifecycle.active
      ) {
        return { kind: 'invalid' };
      }

      const history = parseHashHistory(locked.refreshTokenHashHistory);
      const nextHistory = appendHashHistory(history, {
        h: presentedHash,
        g: locked.refreshGeneration,
        at: now.toISOString(),
      });

      // Conditional UPDATE is the single-winner gate (ADR-019 §4.2).
      // Expiry is enforced atomically in the WHERE clause with post-lock time.
      const updated = await tx.parentSession.updateMany({
        where: {
          id: locked.id,
          refreshTokenHash: presentedHash,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          refreshTokenHash: newHash,
          refreshTokenHashHistory:
            nextHistory as unknown as Prisma.InputJsonValue,
          refreshGeneration: { increment: 1 },
          lastRefreshedAt: now,
        },
      });

      if (updated.count !== 1) {
        return { kind: 'invalid' };
      }

      await tx.parentSessionRefreshHashLookup.upsert({
        where: { hash: presentedHash },
        create: { hash: presentedHash, sessionId: locked.id },
        update: { sessionId: locked.id },
      });

      // Keep lookup table aligned with bounded history (max 8).
      const keep = new Set(nextHistory.map((entry) => entry.h));
      const prior = await tx.parentSessionRefreshHashLookup.findMany({
        where: { sessionId: locked.id },
        select: { hash: true },
      });
      const stale = prior
        .map((row) => row.hash)
        .filter((hash) => !keep.has(hash));
      if (stale.length > 0) {
        await tx.parentSessionRefreshHashLookup.deleteMany({
          where: { hash: { in: stale } },
        });
      }

      return {
        kind: 'rotated',
        sessionId: locked.id,
        parentId: locked.parentId,
      };
    });

    if (outcome.kind === 'reuse') {
      throwUnauthorized('refresh_reuse', 'Refresh token reuse detected');
    }
    if (outcome.kind === 'revoked') {
      throwUnauthorized('revoked_session', 'Session has been revoked');
    }
    if (outcome.kind === 'expired') {
      throwUnauthorized('expired_token', 'Session has expired');
    }
    if (outcome.kind === 'invalid') {
      throwUnauthorized('invalid_token', 'Invalid refresh token');
    }

    const accessToken = await this.jwt.signAccessToken({
      parentId: outcome.parentId,
      sessionId: outcome.sessionId,
    });

    return {
      access_token: accessToken,
      refresh_token: newRefresh,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      session_id: outcome.sessionId,
      parent_id: outcome.parentId,
    };
  }

  async logout(opts: {
    refreshToken?: string;
    sessionId?: string;
    parentId?: string;
  }): Promise<void> {
    if (opts.refreshToken) {
      const hash = hashRefreshToken(opts.refreshToken, this.pepper());
      const session = await this.prisma.db.parentSession.findFirst({
        where: { refreshTokenHash: hash },
      });
      if (session) {
        await this.revokeSession(session.id, ParentSessionRevokeReason.logout);
      }
      return;
    }
    if (opts.sessionId && opts.parentId) {
      const session = await this.prisma.db.parentSession.findFirst({
        where: { id: opts.sessionId, parentId: opts.parentId },
      });
      if (session && !session.revokedAt) {
        await this.revokeSession(session.id, ParentSessionRevokeReason.logout);
      }
      // Idempotent 204 when already revoked / missing for owned id path handled by caller
    }
  }

  async logoutAll(parentId: string): Promise<number> {
    const now = new Date();
    return this.prisma.db.$transaction(async (tx) => {
      const active = await tx.parentSession.findMany({
        where: { parentId, revokedAt: null },
        select: { id: true },
      });
      if (active.length === 0) {
        return 0;
      }
      const ids = active.map((row) => row.id);
      await tx.parentSessionRefreshHashLookup.deleteMany({
        where: { sessionId: { in: ids } },
      });
      const result = await tx.parentSession.updateMany({
        where: { parentId, revokedAt: null },
        data: {
          revokedAt: now,
          revokedReason: ParentSessionRevokeReason.logout_all,
          refreshTokenHash: null,
          refreshTokenHashHistory: [] as unknown as Prisma.InputJsonValue,
        },
      });
      return result.count;
    });
  }

  async revokeOwnedSession(
    parentId: string,
    sessionId: string,
  ): Promise<'revoked' | 'missing'> {
    const session = await this.prisma.db.parentSession.findFirst({
      where: { id: sessionId, parentId },
    });
    if (!session) {
      return 'missing';
    }
    if (!session.revokedAt) {
      await this.revokeSession(session.id, ParentSessionRevokeReason.logout);
    }
    return 'revoked';
  }

  async listSessions(parentId: string): Promise<
    Array<{
      session_id: string;
      created_at: string;
      last_refreshed_at: string | null;
      expires_at: string;
      revoked: boolean;
      client_surface: string | null;
      device_id: string | null;
      user_agent_summary: string | null;
    }>
  > {
    const rows = await this.prisma.db.parentSession.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => ({
      session_id: row.id,
      created_at: row.createdAt.toISOString(),
      last_refreshed_at: row.lastRefreshedAt?.toISOString() ?? null,
      expires_at: row.expiresAt.toISOString(),
      revoked: row.revokedAt !== null,
      client_surface: row.clientSurface,
      device_id: row.deviceId,
      user_agent_summary: row.userAgentSummary,
    }));
  }

  async requireActiveSession(
    sessionId: string,
    parentId: string,
  ): Promise<ParentSession> {
    const session = await this.prisma.db.parentSession.findFirst({
      where: { id: sessionId, parentId },
    });
    if (!session) {
      throwUnauthorized('invalid_token', 'Invalid session');
    }
    if (session.revokedAt) {
      throwUnauthorized('revoked_session', 'Session has been revoked');
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throwUnauthorized('expired_token', 'Session has expired');
    }
    return session;
  }

  async getActiveParent(parentId: string): Promise<{
    id: string;
    locale: string;
    timezone: string;
    lifecycle: ParentAccountLifecycle;
  }> {
    const parent = await this.prisma.db.parentAccount.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        locale: true,
        timezone: true,
        lifecycle: true,
        deletedAt: true,
      },
    });
    if (!parent || parent.deletedAt) {
      throwUnauthorized('invalid_token', 'Parent account is not active');
    }
    return parent;
  }

  private async revokeSession(
    sessionId: string,
    reason: ParentSessionRevokeReason,
  ): Promise<void> {
    await this.prisma.db.$transaction(async (tx) => {
      await this.revokeSessionTx(tx, sessionId, reason);
    });
  }

  private async revokeSessionTx(
    tx: TxClient,
    sessionId: string,
    reason: ParentSessionRevokeReason,
  ): Promise<void> {
    await tx.parentSessionRefreshHashLookup.deleteMany({
      where: { sessionId },
    });
    await tx.parentSession.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
        refreshTokenHash: null,
        refreshTokenHashHistory: [] as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /** O(1) indexed prior-hash lookup — no scan limit. */
  private async findHistoryMatchTx(
    tx: TxClient,
    presentedHash: string,
  ): Promise<ParentSession | null> {
    const hit = await tx.parentSessionRefreshHashLookup.findUnique({
      where: { hash: presentedHash },
      include: { session: true },
    });
    if (!hit || hit.session.revokedAt) {
      return null;
    }
    return hit.session;
  }
}
