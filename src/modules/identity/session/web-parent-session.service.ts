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
    const session = await this.prisma.db.$transaction(async (tx) => {
      // Serialize conversion and prevent any later refresh-token based use of this session.
      await tx.$queryRaw`SELECT id FROM parent_sessions WHERE id = ${parentSessionId}::uuid FOR UPDATE`;
      // Obtain wall-clock time only after the row lock is acquired.
      const now = new Date();
      const parentSession = await tx.parentSession.findFirst({
        where: { id: parentSessionId, parentId, revokedAt: null, expiresAt: { gt: now } },
      });
      if (!parentSession || parentSession.clientSurface !== 'web') throwUnauthorized('invalid_token', 'Inactive parent session');
      const parent = await tx.parentAccount.findUnique({ where: { id: parentId } });
      if (!parent || parent.deletedAt || parent.lifecycle !== ParentAccountLifecycle.active) {
        throwUnauthorized('invalid_token', 'Inactive parent');
      }
      // The web handle replaces native refresh credentials. This avoids any
      // single-use refresh rotation and cross-replica race for browser sessions.
      // Conversion cannot be retried for an already-converted native session.
      if (!parentSession.refreshTokenHash) throwUnauthorized('invalid_token', 'Session already exchanged');
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

    // Atomic eligibility + activity update using the PostgreSQL clock.
    // The conditional UPDATE is the linearization point for concurrent requests,
    // idle expiry, and web logout. No stale read can extend an idle session.
    const active = await this.prisma.db.$queryRaw<Array<{ parent_id: string }>>`
      UPDATE web_parent_sessions AS w
      SET last_used_at = clock_timestamp()
      WHERE w.handle_hash = ${this.hash(handle)}
        AND w.revoked_at IS NULL
        AND w.expires_at > clock_timestamp()
        AND COALESCE(w.last_used_at, w.created_at) > clock_timestamp() - INTERVAL '30 minutes'
        AND EXISTS (
          SELECT 1 FROM parent_sessions AS ps
          WHERE ps.id = w.parent_session_id
            AND ps.parent_id = w.parent_id
            AND ps.revoked_at IS NULL
            AND ps.expires_at > clock_timestamp()
        )
        AND EXISTS (
          SELECT 1 FROM parent_accounts AS pa
          WHERE pa.id = w.parent_id
            AND pa.deleted_at IS NULL
            AND pa.lifecycle = 'active'::"ParentAccountLifecycle"
        )
      RETURNING w.parent_id
    `;
    if (active.length !== 1) throwUnauthorized('invalid_token', 'Invalid or idle-expired web session');
    const parent = await this.prisma.db.parentAccount.findUnique({ where: { id: active[0].parent_id } });
    if (!parent || parent.deletedAt || parent.lifecycle !== ParentAccountLifecycle.active) {
      throwUnauthorized('invalid_token', 'Inactive parent');
    }
    return { parent_id: parent.id, locale: parent.locale, timezone: parent.timezone };
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
