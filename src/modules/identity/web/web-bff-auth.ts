import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type { AppEnv } from '../../../config/env.validation';
import type { WebParentSessionService } from '../session/web-parent-session.service';

/** Timing-safe BFF secret check; returns opaque session handle when trusted. */
export function readTrustedWebSessionHandle(
  config: ConfigService<AppEnv, true>,
  request: Request,
  untrustedMessage = 'Untrusted web request',
): string {
  const secret = config.get('LM_WEB_BFF_SECRET', { infer: true });
  const provided = request.headers['x-lm-bff-secret'];
  if (
    !secret ||
    secret.length < 32 ||
    typeof provided !== 'string' ||
    !timingSafeEqual(
      createHash('sha256').update(secret).digest(),
      createHash('sha256').update(provided).digest(),
    )
  ) {
    throw new UnauthorizedException(untrustedMessage);
  }
  const handle = request.headers['x-lm-web-session'];
  if (typeof handle !== 'string') throw new UnauthorizedException('Missing web session');
  return handle;
}

/** Passive web read: verify BFF + session without extending idle timeout. */
export async function resolvePassiveWebParentId(
  config: ConfigService<AppEnv, true>,
  web: WebParentSessionService,
  request: Request,
): Promise<string> {
  const handle = readTrustedWebSessionHandle(config, request);
  const active = await web.requireActive(handle, false);
  return active.parent_id;
}
