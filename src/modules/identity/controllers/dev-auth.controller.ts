import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import { clientIp, isLoopbackIp } from '../auth/client-ip';
import { AuthRateLimitService } from '../session/auth-rate-limit.service';
import { SessionIssuerService } from '../session/session-issuer.service';
import {
  throwForbidden,
  throwInvalidRequest,
  throwNotFound,
} from '../session/auth.errors';

/** LMP-22 seed parent UUID — default bootstrap allowlist only. */
const DEFAULT_BOOTSTRAP_PARENT_ID =
  '11111111-1111-4111-8111-111111111111';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller()
export class DevAuthController {
  constructor(
    private readonly sessions: SessionIssuerService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  @Post('v1/auth/dev/session')
  @HttpCode(200)
  async bootstrap(
    @Req() req: Request,
    @Body()
    body: {
      parent_id?: unknown;
      client_surface?: unknown;
      device_id?: unknown;
    },
  ) {
    this.assertBootstrapAllowed(req);

    const ip = clientIp(req);
    this.rateLimit.consumeBootstrapIp(ip);

    const parentId = body?.parent_id;
    if (typeof parentId !== 'string' || !UUID_RE.test(parentId)) {
      throwInvalidRequest('parent_id must be a UUID');
    }

    const allowlist = this.parentAllowlist();
    if (!allowlist.has(parentId)) {
      // Anti-enumeration / no arbitrary impersonation
      throwNotFound('Parent not found');
    }

    const clientSurface =
      typeof body?.client_surface === 'string' ? body.client_surface : null;
    const deviceId =
      typeof body?.device_id === 'string' && UUID_RE.test(body.device_id)
        ? body.device_id
        : null;

    return this.sessions.mintSession({
      parentId,
      clientSurface,
      deviceId,
      userAgentSummary: truncateUa(req.headers['user-agent']),
    });
  }

  private assertBootstrapAllowed(req: Request): void {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    const nodeEnv = this.config.get('NODE_ENV', { infer: true });
    if (appEnv === 'staging' || appEnv === 'production') {
      throwForbidden('bootstrap_disabled', 'Dev bootstrap is disabled');
    }

    const enabled = this.config.get('AUTH_DEV_BOOTSTRAP_ENABLED', {
      infer: true,
    });
    if (enabled !== true) {
      throwForbidden('bootstrap_disabled', 'Dev bootstrap is disabled');
    }

    // development or automated test harness only
    if (appEnv !== 'development' && nodeEnv !== 'test') {
      throwForbidden('bootstrap_disabled', 'Dev bootstrap is disabled');
    }

    // Fail closed behind reverse proxies: peer would be loopback while the
    // public client is remote (LMP-33 re-review).
    if (requestLooksProxied(req)) {
      throwForbidden(
        'bootstrap_disabled',
        'Dev bootstrap rejects proxied requests',
      );
    }

    const listenHost = this.config.get('LISTEN_HOST', { infer: true });
    if (
      listenHost !== '127.0.0.1' &&
      listenHost !== '::1' &&
      listenHost.toLowerCase() !== 'localhost'
    ) {
      throwForbidden(
        'bootstrap_disabled',
        'Dev bootstrap requires loopback LISTEN_HOST',
      );
    }

    const ip = clientIp(req);
    if (!isLoopbackIp(ip)) {
      throwForbidden(
        'bootstrap_disabled',
        'Dev bootstrap requires loopback client',
      );
    }
  }

  private parentAllowlist(): Set<string> {
    const raw = this.config.get('AUTH_DEV_BOOTSTRAP_PARENT_ALLOWLIST', {
      infer: true,
    });
    if (raw && raw.trim().length > 0) {
      return new Set(
        raw
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean),
      );
    }
    return new Set([DEFAULT_BOOTSTRAP_PARENT_ID]);
  }
}

function truncateUa(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value.slice(0, 128);
}

/** True when common reverse-proxy forwarding headers are present. */
export function requestLooksProxied(req: Request): boolean {
  const headers = req.headers;
  return Boolean(
    headers['x-forwarded-for'] ||
      headers['x-real-ip'] ||
      headers['forwarded'] ||
      headers['x-forwarded-host'] ||
      headers['x-forwarded-proto'],
  );
}
