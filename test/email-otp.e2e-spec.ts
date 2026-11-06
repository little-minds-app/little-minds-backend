import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { FakeMailSender } from '../src/modules/identity/mail/fake-mail.sender';
import { MAIL_SENDER } from '../src/modules/identity/mail/mail-sender';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
} from '../src/modules/identity/otp/otp.constants';
import {
  TEST_EMAIL_SUBJECT_PEPPER,
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_OTP_PEPPER,
  TEST_PHONE_SUBJECT_PEPPER,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';
import { resetOtpPgE2eState } from './helpers/otp-pg-e2e-reset';

const describeEmail =
  process.env.LM_PHONE_OTP_E2E === '1' && process.env.DATABASE_URL
    ? describe
    : describe.skip;

describeEmail('POST /v1/auth/email/* (LMP-35 e2e)', () => {
  let app: INestApplication<App>;
  let fakeMail: FakeMailSender;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM ??= TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM ??= TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER ??= TEST_REFRESH_PEPPER;
    process.env.OTP_PEPPER ??= TEST_OTP_PEPPER;
    process.env.PHONE_SUBJECT_PEPPER ??= TEST_PHONE_SUBJECT_PEPPER;
    process.env.EMAIL_SUBJECT_PEPPER ??= TEST_EMAIL_SUBJECT_PEPPER;
    process.env.SMS_SENDER = 'fake';
    process.env.MAIL_SENDER = 'fake';
    process.env.APP_ENV = 'development';
    process.env.AUTH_DEV_BOOTSTRAP_ENABLED = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    fakeMail = moduleFixture.get(FakeMailSender);
    prisma = moduleFixture.get(PrismaService);
    expect(moduleFixture.get(MAIL_SENDER)).toBe(fakeMail);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    fakeMail.clearInboxForTests();
    await resetOtpPgE2eState(prisma);
  });

  it('start→verify creates parent (U7) with deliveryState=sent gate', async () => {
    const start = await request(app.getHttpServer())
      .post('/v1/auth/email/start')
      .send({
        email: '  Parent.User+tag@Example.COM ',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
        client_surface: 'ios',
      })
      .expect(200);

    expect(start.body.challenge_id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(start.body.expires_in).toBe(600);
    expect(start.body.resend_after).toBe(60);
    expect(start.body.otp_code).toBeUndefined();

    const challenge = await prisma.db.otpChallenge.findUniqueOrThrow({
      where: { id: start.body.challenge_id },
    });
    expect(challenge.deliveryState).toBe('sent');
    expect(challenge.provider).toBe('email');

    const code = fakeMail.peekCodeForTests(start.body.challenge_id);
    expect(code).toMatch(/^\d{6}$/);

    const verify = await request(app.getHttpServer())
      .post('/v1/auth/email/verify')
      .send({
        challenge_id: start.body.challenge_id,
        code,
        client_surface: 'ios',
      })
      .expect(200);

    expect(verify.body.access_token).toBeTruthy();
    expect(verify.body.parent_id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('rejects Unicode local and invalid notice uniformly', async () => {
    const badEmail = await request(app.getHttpServer())
      .post('/v1/auth/email/start')
      .send({
        email: 'üser@example.com',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(400);
    expect(badEmail.body.error).toBe('invalid_request');

    const badNotice = await request(app.getHttpServer())
      .post('/v1/auth/email/start')
      .send({
        email: 'ok@example.com',
        notice_version: 'wrong',
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(400);
    expect(badNotice.body.error).toBe('invalid_request');
  });

  it('rejects verify when delivery not sent (mail failure)', async () => {
    fakeMail.failNextSendForTests();
    const start = await request(app.getHttpServer())
      .post('/v1/auth/email/start')
      .send({
        email: 'failpath@example.com',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(503);
    expect(start.body.error).toBe('mail_unavailable');
  });
});
