import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
} from '../src/modules/identity/otp/otp.constants';
import {
  FakeGoogleTokenExchanger,
  GOOGLE_TOKEN_EXCHANGER,
} from '../src/modules/identity/providers/google-token-exchanger';
import {
  signTestIdToken,
  TEST_OIDC_AUD_APPLE,
  TEST_OIDC_AUD_GOOGLE,
  TEST_OIDC_ISS_APPLE,
  TEST_OIDC_ISS_GOOGLE,
} from './fixtures/oidc/test-keys';

/**
 * OIDC Apple/Google HTTP e2e. Relies on test/setup-e2e-env.ts installing
 * APPLE and GOOGLE env (incl. local JWKS) before AppModule validateEnv.
 */
const describeOidc =
  process.env.LM_PHONE_OTP_E2E === '1' && process.env.DATABASE_URL
    ? describe
    : describe.skip;

describeOidc('POST /v1/auth/apple|google (LMP-35 e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let fakeExchange: FakeGoogleTokenExchanger;

  beforeAll(async () => {
    process.env.AUTH_DEV_BOOTSTRAP_ENABLED = 'false';
    fakeExchange = new FakeGoogleTokenExchanger();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GOOGLE_TOKEN_EXCHANGER)
      .useValue(fakeExchange)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await prisma.db.authOidcNonce.deleteMany({});
    await prisma.db.otpAbuseCounter.deleteMany({});
  });

  it('Apple: nonce issue → ID token → U7 create session', async () => {
    const nonceRes = await request(app.getHttpServer())
      .post('/v1/auth/oidc/nonce')
      .send({ provider: 'apple' })
      .expect(200);
    expect(nonceRes.body.nonce).toBeTruthy();
    expect(nonceRes.body.expires_in).toBe(600);

    const hashed = createHash('sha256')
      .update(nonceRes.body.nonce, 'utf8')
      .digest('hex');
    const idToken = await signTestIdToken({
      sub: 'apple-e2e-sub-1',
      aud: TEST_OIDC_AUD_APPLE,
      iss: TEST_OIDC_ISS_APPLE,
      nonce: hashed,
    });

    const auth = await request(app.getHttpServer())
      .post('/v1/auth/apple')
      .send({
        id_token: idToken,
        nonce: nonceRes.body.nonce,
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
        client_surface: 'ios',
      })
      .expect(200);

    expect(auth.body.access_token).toBeTruthy();
    expect(auth.body.parent_id).toMatch(/^[0-9a-f-]{36}$/i);

    const replay = await request(app.getHttpServer())
      .post('/v1/auth/apple')
      .send({
        id_token: idToken,
        nonce: nonceRes.body.nonce,
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(401);
    expect(replay.body.error).toBe('invalid_token');
  });

  it('Google nonce path succeeds; ID-token-without-nonce fails closed', async () => {
    const nonceRes = await request(app.getHttpServer())
      .post('/v1/auth/oidc/nonce')
      .send({ provider: 'google' })
      .expect(200);

    const idToken = await signTestIdToken({
      sub: 'google-e2e-sub-1',
      aud: TEST_OIDC_AUD_GOOGLE,
      iss: TEST_OIDC_ISS_GOOGLE,
      nonce: nonceRes.body.nonce,
      email: 'guser@example.com',
      emailVerified: true,
    });

    const auth = await request(app.getHttpServer())
      .post('/v1/auth/google')
      .send({
        id_token: idToken,
        nonce: nonceRes.body.nonce,
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(200);
    expect(auth.body.parent_id).toBeTruthy();

    const weak = await request(app.getHttpServer())
      .post('/v1/auth/google')
      .send({
        id_token: idToken,
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(401);
    expect(weak.body.error).toBe('invalid_token');
  });

  it('Google PKCE path exchanges code then JWKS-verifies', async () => {
    const idToken = await signTestIdToken({
      sub: 'google-e2e-pkce-1',
      aud: TEST_OIDC_AUD_GOOGLE,
      iss: TEST_OIDC_ISS_GOOGLE,
    });
    fakeExchange.setNextIdTokenForTests(idToken);

    const auth = await request(app.getHttpServer())
      .post('/v1/auth/google')
      .send({
        authorization_code: 'test-auth-code-value',
        code_verifier: 'a'.repeat(43),
        redirect_uri: 'http://localhost/oauth/google/callback',
        notice_version: ACTIVE_PRIVACY_NOTICE_VERSION,
        notice_locale: ACTIVE_PRIVACY_NOTICE_LOCALE,
      })
      .expect(200);
    expect(auth.body.access_token).toBeTruthy();
  });
});
