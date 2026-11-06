import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { FakeSmsSender } from '../src/modules/identity/sms/fake-sms.sender';
import { SMS_SENDER } from '../src/modules/identity/sms/sms-sender';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
} from '../src/modules/identity/otp/otp.constants';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_OTP_PEPPER,
  TEST_PHONE_SUBJECT_PEPPER,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';
import { resetOtpPgE2eState } from './helpers/otp-pg-e2e-reset';

/**
 * Full HTTP OTP flow needs Postgres (challenges + durable counters).
 * Nest CI has no DB — opt in explicitly (prisma-checks / local Compose):
 *   LM_PHONE_OTP_E2E=1 DATABASE_URL=... npm run test:e2e -- phone-otp
 * Default coverage for concurrency/retention lives in `phone-otp.db.spec.ts`.
 */
const describePhone =
  process.env.LM_PHONE_OTP_E2E === '1' && process.env.DATABASE_URL
    ? describe
    : describe.skip;

describePhone('POST /v1/auth/phone/* (LMP-34 e2e)', () => {
  let app: INestApplication<App>;
  let fakeSms: FakeSmsSender;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM ??= TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM ??= TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER ??= TEST_REFRESH_PEPPER;
    process.env.OTP_PEPPER ??= TEST_OTP_PEPPER;
    process.env.PHONE_SUBJECT_PEPPER ??= TEST_PHONE_SUBJECT_PEPPER;
    process.env.SMS_SENDER = 'fake';
    process.env.APP_ENV = 'development';
    process.env.AUTH_DEV_BOOTSTRAP_ENABLED = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    fakeSms = moduleFixture.get(FakeSmsSender);
    prisma = moduleFixture.get(PrismaService);
    // Ensure SMS_SENDER token resolves to FakeSmsSender
    expect(moduleFixture.get(SMS_SENDER)).toBe(fakeSms);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    fakeSms.clearInboxForTests();
    await resetOtpPgE2eState(prisma);
  });

  it('start→verify creates parent (U7) and returns token pair', async () => {
    const start = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '+905551112233',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
        client_surface: 'ios',
      })
      .expect(200);

    expect(start.body.challenge_id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(start.body.expires_in).toBe(300);
    expect(start.body.resend_after).toBe(60);
    expect(start.body.otp_code).toBeUndefined();

    const code = fakeSms.peekCodeForTests(start.body.challenge_id);
    expect(code).toMatch(/^\d{6}$/);

    const verify = await request(app.getHttpServer())
      .post('/v1/auth/phone/verify')
      .send({
        challenge_id: start.body.challenge_id,
        code,
        client_surface: 'ios',
      })
      .expect(200);

    expect(verify.body.access_token).toBeTruthy();
    expect(verify.body.refresh_token).toBeTruthy();
    expect(verify.body.token_type).toBe('Bearer');
    expect(verify.body.parent_id).toMatch(/^[0-9a-f-]{36}$/i);

    // Second start+verify for same phone signs into existing parent (no client branch).
    const start2 = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '05551112233',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(200);
    const code2 = fakeSms.peekCodeForTests(start2.body.challenge_id);
    const verify2 = await request(app.getHttpServer())
      .post('/v1/auth/phone/verify')
      .send({ challenge_id: start2.body.challenge_id, code: code2 })
      .expect(200);
    expect(verify2.body.parent_id).toBe(verify.body.parent_id);
  });

  it('rejects invalid notice and non-TR uniformly (no account oracle)', async () => {
    const badNotice = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '+905551112233',
        notice_version: 'wrong',
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(400);
    expect(badNotice.body.error).toBe('invalid_request');

    const badPhone = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '+14445556666',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(400);
    expect(badPhone.body.error).toBe('invalid_request');
  });

  it('rejects wrong OTP with otp_invalid and locks after 5 attempts', async () => {
    const start = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '+905559998877',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(200);

    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/phone/verify')
        .send({ challenge_id: start.body.challenge_id, code: '000000' })
        .expect(401);
      expect(res.body.error).toBe('otp_invalid');
    }

    const code = fakeSms.peekCodeForTests(start.body.challenge_id);
    const locked = await request(app.getHttpServer())
      .post('/v1/auth/phone/verify')
      .send({ challenge_id: start.body.challenge_id, code })
      .expect(401);
    expect(locked.body.error).toBe('otp_invalid');
  });

  it('verify has no privacy fields requirement', async () => {
    const start = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '+905557778899',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(200);
    const code = fakeSms.peekCodeForTests(start.body.challenge_id)!;
    // Intentionally omit notice_* — must succeed.
    await request(app.getHttpServer())
      .post('/v1/auth/phone/verify')
      .send({ challenge_id: start.body.challenge_id, code })
      .expect(200);
  });

  it('malformed challenge_id returns otp_invalid (not 500)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/phone/verify')
      .send({ challenge_id: 'not-a-uuid', code: '123456' })
      .expect(401);
    expect(res.body.error).toBe('otp_invalid');
    expect(res.body.message).toBeTruthy();
  });

  it('SMS adapter throw normalizes to sms_unavailable without leaking', async () => {
    fakeSms.throwNextSendForTests();
    const res = await request(app.getHttpServer())
      .post('/v1/auth/phone/start')
      .send({
        phone: '+905556667788',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(503);
    expect(res.body.error).toBe('sms_unavailable');
    expect(JSON.stringify(res.body)).not.toMatch(/injected sms/i);
    expect(JSON.stringify(res.body)).not.toMatch(/\+905556667788/);
  });
});
