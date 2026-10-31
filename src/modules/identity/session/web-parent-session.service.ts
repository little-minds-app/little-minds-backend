import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParentAccountLifecycle, ParentSessionRevokeReason } from '@prisma/client';
import { createHmac, randomBytes } from 'node:crypto';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { throwUnauthorized } from './auth.errors';

/** Database-authoritative opaque web sessions; no token rotation in Next.js. */
@Injectable()
export class WebParentSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  private hash(handle: string): string {
    const key = this.config.get('REFRESH_TOKEN_PEPPER', { infer: true });
    if (!key || key.length < 16) throw new Error('Missing web session hash key');
    return createHmac('sha256', key).update('web-session-v1:').update(handle).digest('hex');
  }

  private valid(handle: string): boolean {
    return /^[A-Za-z0-9_-]{43}$/.test(handle);
  }

  async create(parentId: string, parentSessionId: string): Promise<{ handle: string; expires_at: string }> {
    const handle = randomBytes(32).toString('base64url');
    const now = new Date();
    const session = await this.prisma.db.$transaction(async (tx) => {
      // Serialize conversion and prevent any later refresh-token based use of this session.
      await tx.$queryRaw`SELECT id FROM parent_sessions WHERE id = ${parentSessionId}::uuid FOR UPDATE`;
      const parentSession = await tx.parentSession.findFirst({
        where: { id: parentSessionId, parentId, revokedAt: null, expiresAt: { gt: now } },
      });
      if (!parentSession) throwUnauthorized('invalid_token', 'Inactive parent session');
      const parent = await tx.parentAccount.findUnique({ where: { id: parentId } });
      if (!parent || parent.deletedAt || parent.lifecycle !== ParentAccountLifecycle.active) {
        throwUnauthorized('invalid_token', 'Inactive parent');
      }
      // The web handle replaces native refresh credentials. This avoids any
      // single-use refresh rotation and cross-replica race for browser sessions.
      await tx.parentSessionRefreshHashLookup.deleteMany({ where: { sessionId: parentSessionId } });
      await tx.parentSession.update({
        where: { id: parentSessionId },
        data: { refreshTokenHash: null, refreshTokenHashHistory: [] },
      });
      return tx.webParentSession.create({
        data: {
          parentId,
          parentSessionId,
          handleHash: this.hash(handle),
          expiresAt: parentSession.expiresAt,
        },
      });
    });
    return { handle, expires_at: session.expiresAt.toISOString() };
  }

  async requireActive(handle: string): Promise<{ parent_id: string; locale: string; timezone: string }> {
    if (!this.valid(handle)) throwUnauthorized('invalid_token', 'Invalid web session');
    const web = await this.prisma.db.webParentSession.findUnique({
      where: { handleHash: this.hash(handle) },
      include: { parent: true, parentSession: true },
    });
    const now = Date.now();
    if (!web || web.revokedAt || web.expiresAt.getTime() <= now ||
        web.parentSession.revokedAt || web.parentSession.expiresAt.getTime() <= now ||
        web.parent.deletedAt || web.parent.lifecycle !== ParentAccountLifecycle.active ||
        web.parentSession.parentId !== web.parentId) {
      throwUnauthorized('invalid_token', 'Invalid web session');
    }
    return { parent_id: web.parentId, locale: web.parent.locale, timezone: web.parent.timezone };
  }

  async logout(handle: string): Promise<void> {
    if (!this.valid(handle)) return;
    await this.prisma.db.$transaction(async (tx) => {
      const web = await tx.webParentSession.findUnique({ where: { handleHash: this.hash(handle) } });
      if (!web || web.revokedAt) return;
      const now = new Date();
      await tx.webParentSession.update({ where: { id: web.id }, data: { revokedAt: now } });
      await tx.parentSessionRefreshHashLookup.deleteMany({ where: { sessionId: web.parentSessionId } });
      await tx.parentSession.updateMany({
        where: { id: web.parentSessionId, parentId: web.parentId, revokedAt: null },
        data: {
          revokedAt: now,
          revokedReason: ParentSessionRevokeReason.logout,
          refreshTokenHash: null,
          refreshTokenHashHistory: [],
        },
      });
    });
  }
}
