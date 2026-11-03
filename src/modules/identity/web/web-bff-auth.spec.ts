import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import type { WebParentSessionService } from '../session/web-parent-session.service';
import {
  readTrustedWebSessionHandle,
  resolvePassiveWebParentId,
} from './web-bff-auth';

describe('web BFF auth helpers (LMP-132 regression)', () => {
  const bffSecret = 'synthetic-bff-secret-at-least-32-bytes-long';
  const handle = 'A'.repeat(43);

  function config(secret: string | undefined = bffSecret) {
    return {
      get: (key: keyof AppEnv) => (key === 'LM_WEB_BFF_SECRET' ? secret : undefined),
    } as unknown as ConfigService<AppEnv, true>;
  }

  function request(headers: Record<string, string | undefined>) {
    return { headers } as import('express').Request;
  }

  it('rejects absent BFF secret before reading session handle', () => {
    expect(() =>
      readTrustedWebSessionHandle(config(), request({ 'x-lm-web-session': handle })),
    ).toThrow(UnauthorizedException);
  });

  it('rejects wrong BFF secret with timing-safe comparison', () => {
    expect(() =>
      readTrustedWebSessionHandle(
        config(),
        request({
          'x-lm-web-session': handle,
          'x-lm-bff-secret': 'wrong-bff-secret-that-is-long-enough-32b',
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects trusted BFF when session handle header is missing', () => {
    expect(() =>
      readTrustedWebSessionHandle(
        config(),
        request({ 'x-lm-bff-secret': bffSecret }),
      ),
    ).toThrow(/Missing web session/);
  });

  it('returns opaque handle when BFF secret matches', () => {
    const got = readTrustedWebSessionHandle(
      config(),
      request({ 'x-lm-web-session': handle, 'x-lm-bff-secret': bffSecret }),
    );
    expect(got).toBe(handle);
  });

  it('resolvePassiveWebParentId verifies session without idle extension', async () => {
    const web = { requireActive: jest.fn().mockResolvedValue({ parent_id: 'parent-A' }) };
    const parentId = await resolvePassiveWebParentId(
      config(),
      web as unknown as WebParentSessionService,
      request({ 'x-lm-web-session': handle, 'x-lm-bff-secret': bffSecret }),
    );
    expect(parentId).toBe('parent-A');
    expect(web.requireActive).toHaveBeenCalledWith(handle, false);
  });
});
