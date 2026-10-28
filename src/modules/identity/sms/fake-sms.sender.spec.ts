import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { FakeSmsSender } from './fake-sms.sender';

function config(appEnv: AppEnv['APP_ENV']): ConfigService<AppEnv, true> {
  return {
    get: (key: keyof AppEnv) => {
      if (key === 'APP_ENV') return appEnv;
      return undefined;
    },
  } as unknown as ConfigService<AppEnv, true>;
}

describe('FakeSmsSender (LMP-34)', () => {
  it('stores codes for test harness peek in development', async () => {
    const fake = new FakeSmsSender(config('development'));
    const result = await fake.send({
      e164: '+905551112233',
      body: 'Little Minds dogrulama kodu: 654321. 5 dk gecerli.',
      challengeId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.ok).toBe(true);
    expect(fake.peekCodeForTests('11111111-1111-4111-8111-111111111111')).toBe(
      '654321',
    );
  });

  it('fail-closed assert + send when APP_ENV is staging/production', async () => {
    const staging = new FakeSmsSender(config('staging'));
    expect(() => staging.assertAllowedEnvironment()).toThrow(/FakeSmsSender/);
    const denied = await staging.send({
      e164: '+905551112233',
      body: 'code 111111',
      challengeId: '22222222-2222-4222-8222-222222222222',
    });
    expect(denied.ok).toBe(false);
    expect(denied.errorCode).toBe('fake_forbidden');

    const production = new FakeSmsSender(config('production'));
    expect(() => production.assertAllowedEnvironment()).toThrow(/FakeSmsSender/);
  });
});
