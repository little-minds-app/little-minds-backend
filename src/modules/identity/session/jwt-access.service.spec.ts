import { ConfigService } from '@nestjs/config';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
} from '../../../../test/fixtures/auth/keys';
import type { AppEnv } from '../../../config/env.validation';
import { JwtAccessService } from './jwt-access.service';

describe('JwtAccessService (LMP-33)', () => {
  async function build(): Promise<JwtAccessService> {
    const config = {
      get: (key: keyof AppEnv) => {
        const map: Partial<AppEnv> = {
          APP_ENV: 'development',
          JWT_ACCESS_PRIVATE_KEY_PEM: TEST_JWT_PRIVATE_PEM,
          JWT_ACCESS_PUBLIC_KEY_PEM: TEST_JWT_PUBLIC_PEM,
          JWT_KEY_ID: 'test',
          JWT_ISSUER: 'little-minds-backend',
          JWT_AUDIENCE: 'little-minds-parent',
        };
        return map[key];
      },
    } as unknown as ConfigService<AppEnv, true>;
    const svc = new JwtAccessService(config);
    await svc.onModuleInit();
    return svc;
  }

  it('signs and verifies access tokens with required claims', async () => {
    const svc = await build();
    const parentId = '11111111-1111-4111-8111-111111111111';
    const sessionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const token = await svc.signAccessToken({ parentId, sessionId });
    const claims = await svc.verifyAccessToken(token);
    expect(claims.sub).toBe(parentId);
    expect(claims.sid).toBe(sessionId);
    expect(claims.token_use).toBe('access');
    expect(claims.jti).toBeTruthy();
  });

  it('rejects tampered tokens', async () => {
    const svc = await build();
    const token = await svc.signAccessToken({
      parentId: '11111111-1111-4111-8111-111111111111',
      sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    await expect(svc.verifyAccessToken(`${token}x`)).rejects.toBeTruthy();
  });
});
