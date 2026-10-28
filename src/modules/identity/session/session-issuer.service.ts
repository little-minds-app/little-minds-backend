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
  historyContainsHash,
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
    const now = new Date();

    const current = await db.parentSession.findFirst({
      where: { refreshTokenHash: presentedHash },
    });

    if (!current) {
      const reused = await this.findHistoryMatch(presentedHash);
      if (reused) {
        await this.revokeSession(reused.id, ParentSessionRevokeReason.refresh_reuse);
        throwUnauthorized('refresh_reuse', 'Refresh token reuse detected');
      }
      throwUnauthorized('invalid_token', 'Invalid refresh token');
    }

    if (current.revokedAt) {
      throwUnauthorized('revoked_session', 'Session has been revoked');
    }
    if (current.expiresAt.getTime() <= now.getTime()) {
      throwUnauthorized('expired_token', 'Session has expired');
    }

    const parent = await db.parentAccount.findUnique({
      where: { id: current.parentId },
    });
    if (
      !parent ||
      parent.deletedAt ||
      parent.lifecycle !== ParentAccountLifecycle.active
    ) {
      throwUnauthorized('invalid_token', 'Parent account is not active');
    }

    const newRefresh = generateRefreshToken();
    const newHash = hashRefreshToken(newRefresh, pepper);
    const history = parseHashHistory(current.refreshTokenHashHistory);
    const nextHistory = appendHashHistory(history, {
      h: presentedHash,
      g: current.refreshGeneration,
      at: now.toISOString(),
    });

    // Conditional UPDATE is the single-winner gate (ADR-019 §4.2).
    const updated = await db.$transaction(async (tx) =>
      tx.parentSession.updateMany({
        where: {
          id: current.id,
          refreshTokenHash: presentedHash,
          revokedAt: null,
        },
        data: {
          refreshTokenHash: newHash,
          refreshTokenHashHistory:
            nextHistory as unknown as Prisma.InputJsonValue,
          refreshGeneration: { increment: 1 },
          lastRefreshedAt: now,
        },
      }),
    );

    if (updated.count !== 1) {
      // Consumed by a concurrent winner — do not instruct retry of this token.
      throwUnauthorized('invalid_token', 'Invalid refresh token');
    }

    const accessToken = await this.jwt.signAccessToken({
      parentId: current.parentId,
      sessionId: current.id,
    });

    return {
      access_token: accessToken,
      refresh_token: newRefresh,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      session_id: current.id,
      parent_id: current.parentId,
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
      if (session) {
        await this.revokeSession(session.id, ParentSessionRevokeReason.logout);
      }
    }
  }

  async logoutAll(parentId: string): Promise<number> {
    const now = new Date();
    const result = await this.prisma.db.parentSession.updateMany({
      where: {
        parentId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
        revokedReason: ParentSessionRevokeReason.logout_all,
        refreshTokenHash: null,
        refreshTokenHashHistory: [] as unknown as Prisma.InputJsonValue,
      },
    });
    return result.count;
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
    await this.prisma.db.parentSession.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
        refreshTokenHash: null,
        refreshTokenHashHistory: [] as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private async findHistoryMatch(
    presentedHash: string,
  ): Promise<ParentSession | null> {
    // V1: scan recently rotated non-revoked sessions (history lives in JSON).
    const candidates = await this.prisma.db.parentSession.findMany({
      where: {
        revokedAt: null,
        refreshGeneration: { gt: 0 },
      },
      orderBy: { lastRefreshedAt: 'desc' },
      take: 500,
    });
    for (const session of candidates) {
      const history = parseHashHistory(session.refreshTokenHashHistory);
      if (historyContainsHash(history, presentedHash)) {
        return session;
      }
    }
    return null;
  }
}
