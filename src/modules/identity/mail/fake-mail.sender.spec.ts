import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { FakeMailSender } from './fake-mail.sender';

function configWith(appEnv: AppEnv['APP_ENV']): ConfigService<AppEnv, true> {
  return {
    get: (key: keyof AppEnv) => {
      if (key === 'APP_ENV') return appEnv;
      return undefined;
    },
  } as unknown as ConfigService<AppEnv, true>;
}

describe('FakeMailSender', () => {
  it('accepts send in development and stashes OTP for tests', async () => {
    const fake = new FakeMailSender(configWith('development'));
    fake.assertAllowedEnvironment();
    const result = await fake.send({
      to: 'user@example.com',
      subject: 't',
      body: 'code 123456 here',
      challengeId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.ok).toBe(true);
    expect(fake.peekCodeForTests('11111111-1111-4111-8111-111111111111')).toBe(
      '123456',
    );
  });

  it('fail-closed assert when APP_ENV=staging', () => {
    const fake = new FakeMailSender(configWith('staging'));
    expect(() => fake.assertAllowedEnvironment()).toThrow(/FakeMailSender/);
  });

  it('returns ok:false in staging even if somehow invoked', async () => {
    const fake = new FakeMailSender(configWith('staging'));
    const result = await fake.send({
      to: 'x@y.z',
      subject: 't',
      body: '000000',
      challengeId: '22222222-2222-4222-8222-222222222222',
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('fake_forbidden');
  });
});
