import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { FakeSmsSender } from './fake-sms.sender';

describe('FakeSmsSender failure injection (LMP-34)', () => {
  const config = {
    get: (key: keyof AppEnv) => {
      if (key === 'APP_ENV') return 'development';
      return undefined;
    },
  } as unknown as ConfigService<AppEnv, true>;

  it('throwNextSendForTests is caught by callers via thrown Error', async () => {
    const fake = new FakeSmsSender(config);
    fake.throwNextSendForTests();
    await expect(
      fake.send({
        e164: '+905551112233',
        body: 'code 123456 here',
        challengeId: '11111111-1111-4111-8111-111111111111',
      }),
    ).rejects.toThrow(/injected sms adapter throw/);
  });

  it('failNextSendForTests returns structured ok:false', async () => {
    const fake = new FakeSmsSender(config);
    fake.failNextSendForTests();
    const result = await fake.send({
      e164: '+905551112233',
      body: 'code 123456 here',
      challengeId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('injected_failure');
  });
});
