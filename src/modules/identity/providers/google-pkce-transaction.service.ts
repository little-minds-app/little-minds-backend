import { Injectable } from '@nestjs/common';
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { clientIp } from '../auth/client-ip';
import {
  throwInvalidRequest,
  throwRateLimited,
  throwUnauthorized,
} from '../session/auth.errors';
import {
  GOOGLE_PROVIDER,
  OIDC_NONCE_TTL_SECONDS,
} from '../otp/multi-provider.constants';

const PKCE_START_PER_IP_PER_MIN = 30;
/** Same TTL family as OIDC nonce (10 min). */
export const GOOGLE_PKCE_TX_TTL_SECONDS = OIDC_NONCE_TTL_SECONDS;

function floorWindow(nowMs: number, windowMs: number): Date {
  return new Date(Math.floor(nowMs / windowMs) * windowMs);
}

function s256Challenge(verifier: string): string {
  return createHash('sha256').update(verifier, 'utf8').digest('base64url');
}

function safeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

export type GooglePkceStartInput = {
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod?: string | null;
  /** Optional; must be in GOOGLE_CLIENT_IDS allowlist when provided. */
  clientId?: string | null;
};

export type GooglePkceConsumeInput = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
};

/**
 * Server-issued one-time Google PKCE OAuth transactions (P0 / ADR-021 §5.2).
 * Bound to client_id + redirect_uri + code_challenge; atomic consume.
 */
@Injectable()
export class GooglePkceTransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  static hashState(plaintext: string): string {
    return createHash('sha256').update(plaintext, 'utf8').digest('hex');
  }

  private allowedClientIds(): string[] {
    const raw = this.config.get('GOOGLE_CLIENT_IDS', { infer: true }) as
      | string[]
      | string
      | undefined;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (typeof raw === 'string' && raw.trim()) {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  private redirectAllowed(redirectUri: string): boolean {
    const allow =
      this.config.get('GOOGLE_REDIRECT_URIS', { infer: true }) ?? [];
    return allow.includes(redirectUri);
  }

  async start(
    req: Request,
    input: GooglePkceStartInput,
  ): Promise<{ state: string; expires_in: number; client_id: string }> {
    const pkceEnabled = this.config.get('GOOGLE_PKCE_ENABLED', { infer: true });
    if (!pkceEnabled) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    const clients = this.allowedClientIds();
    if (clients.length === 0) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    if (
      typeof input.redirectUri !== 'string' ||
      !this.redirectAllowed(input.redirectUri)
    ) {
      throwInvalidRequest('Invalid request');
    }

    const method = (input.codeChallengeMethod ?? 'S256').toUpperCase();
    if (method !== 'S256') {
      throwInvalidRequest('Invalid request');
    }
    if (
      typeof input.codeChallenge !== 'string' ||
      input.codeChallenge.length < 43 ||
      input.codeChallenge.length > 128
    ) {
      throwInvalidRequest('Invalid request');
    }

    let clientId = clients[0];
    if (typeof input.clientId === 'string' && input.clientId.length > 0) {
      if (!clients.includes(input.clientId)) {
        throwInvalidRequest('Invalid request');
      }
      clientId = input.clientId;
    }

    await this.assertStartRate(clientIp(req));

    const state = randomBytes(32).toString('base64url');
    const stateHash = GooglePkceTransactionService.hashState(state);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + GOOGLE_PKCE_TX_TTL_SECONDS * 1000,
    );

    await this.prisma.db.authOauthTransaction.create({
      data: {
        id: randomUUID(),
        stateHash,
        provider: GOOGLE_PROVIDER,
        clientId,
        redirectUri: input.redirectUri,
        codeChallenge: input.codeChallenge,
        codeChallengeMethod: 'S256',
        expiresAt,
      },
    });

    return {
      state,
      expires_in: GOOGLE_PKCE_TX_TTL_SECONDS,
      client_id: clientId,
    };
  }

  /**
   * Atomically consume a PKCE transaction after validating state/redirect/
   * clientId/PKCE. Rejects missing / expired / reused / mismatch.
   */
  async consumeOrThrow(input: GooglePkceConsumeInput): Promise<{
    clientId: string;
    redirectUri: string;
  }> {
    if (
      !input.state ||
      input.state.length < 8 ||
      !input.codeVerifier ||
      input.codeVerifier.length < 43 ||
      input.codeVerifier.length > 128
    ) {
      throwUnauthorized('invalid_token', 'Invalid token');
    }

    const stateHash = GooglePkceTransactionService.hashState(input.state);

    return this.prisma.db.$transaction(async (tx) => {
      const clock = await tx.$queryRaw<Array<{ now: Date }>>`
        SELECT clock_timestamp() AS now
      `;
      const now = clock[0]?.now ?? new Date();

      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          client_id: string;
          redirect_uri: string;
          code_challenge: string;
          code_challenge_method: string;
        }>
      >`
        SELECT id, client_id, redirect_uri, code_challenge, code_challenge_method
        FROM auth_oauth_transactions
        WHERE state_hash = ${stateHash}
          AND provider = ${GOOGLE_PROVIDER}
          AND consumed_at IS NULL
          AND expires_at > ${now}
        FOR UPDATE
      `;

      if (rows.length !== 1) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }
      const row = rows[0];

      if (!safeEqualStr(row.redirect_uri, input.redirectUri)) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }
      // Stored client_id must still be allowlisted (ops rotation fail-closed).
      if (!this.allowedClientIds().includes(row.client_id)) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }

      if (row.code_challenge_method !== 'S256') {
        throwUnauthorized('invalid_token', 'Invalid token');
      }
      const derived = s256Challenge(input.codeVerifier);
      if (!safeEqualStr(derived, row.code_challenge)) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }

      const marked = await tx.$queryRaw<Array<{ id: string }>>`
        UPDATE auth_oauth_transactions
        SET consumed_at = ${now}
        WHERE id = ${row.id}::uuid
          AND consumed_at IS NULL
          AND expires_at > ${now}
        RETURNING id
      `;
      if (marked.length !== 1) {
        throwUnauthorized('invalid_token', 'Invalid token');
      }

      return { clientId: row.client_id, redirectUri: row.redirect_uri };
    });
  }

  private async assertStartRate(ip: string): Promise<void> {
    const w1 = floorWindow(Date.now(), 60_000);
    await this.prisma.db.otpAbuseCounter.upsert({
      where: {
        bucketType_bucketKey_windowStart: {
          bucketType: 'google_pkce_ip_1m',
          bucketKey: ip,
          windowStart: w1,
        },
      },
      create: {
        bucketType: 'google_pkce_ip_1m',
        bucketKey: ip,
        windowStart: w1,
        sendCount: 0,
        verifyCount: 0,
      },
      update: {},
    });
    const updated = await this.prisma.db.$queryRaw<
      Array<{ send_count: number }>
    >`
      UPDATE otp_abuse_counters
      SET send_count = send_count + 1
      WHERE bucket_type = 'google_pkce_ip_1m'
        AND bucket_key = ${ip}
        AND window_start = ${w1}
        AND send_count < ${PKCE_START_PER_IP_PER_MIN}
      RETURNING send_count
    `;
    if (updated.length === 0) {
      throwRateLimited();
    }
  }
}
