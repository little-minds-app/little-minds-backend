import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { createHmac } from 'node:crypto';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { FakeSmsSender } from '../src/modules/identity/sms/fake-sms.sender';
import { SMS_SENDER } from '../src/modules/identity/sms/sms-sender';
import {
  TEST_JWT_PRIVATE_PEM, TEST_JWT_PUBLIC_PEM, TEST_OTP_PEPPER,
  TEST_PHONE_SUBJECT_PEPPER, TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';

const enabled = process.env.LM_FULLSTACK_WEB_E2E === '1' &&
  Boolean(process.env.LM_CLIENT_WEB_DIR) && Boolean(process.env.DATABASE_URL);
const describeFullstack = enabled ? describe : describe.skip;

async function allocatePort(): Promise<number> {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = (server.address() as AddressInfo).port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

describeFullstack('LMP-38: real Next.js + NestJS + PostgreSQL authentication E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fakeSms: FakeSmsSender;
  let next: ChildProcess;
  let origin: string;

  const requestWeb = (action: string, body: Record<string, unknown>, cookie?: string) =>
    fetch(origin + '/api/auth/' + action, {
      method: 'POST',
      headers: {
        origin,
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
      redirect: 'manual',
    });

  const signIn = async (phone: string) => {
    const start = await requestWeb('start', { phone });
    expect(start.status).toBe(200);
    const startBody = (await start.json()) as { challenge_id: string };
    const code = fakeSms.peekCodeForTests(startBody.challenge_id);
    expect(code).toMatch(/^\\d{6}$/);
    const verify = await requestWeb('verify', { challenge_id: startBody.challenge_id, code });
    expect(verify.status).toBe(200);
    const responseBody = await verify.text();
    expect(responseBody).not.toContain('access_token');
    expect(responseBody).not.toContain('refresh_token');
    const issued = verify.headers.get('set-cookie') || '';
    expect(issued).toContain('lm_dev_web_session=');
    expect(issued).toContain('httponly');
    expect(issued.toLowerCase()).toContain('samesite=strict');
    const match = issued.match(/lm_dev_web_session=([^;]+)/);
    expect(match?.[1]).toBeTruthy();
    return { cookie: 'lm_dev_web_session=' + match![1], handle: match![1] };
  };

  beforeAll(async () => {
    process.env.APP_ENV = 'development';
    process.env.NODE_ENV = 'test';
    process.env.SMS_SENDER = 'fake';
    process.env.MAIL_SENDER = 'fake';
    process.env.AUTH_DEV_BOOTSTRAP_ENABLED = 'false';
    process.env.JWT_ACCESS_PRIVATE_KEY_PEM = TEST_JWT_PRIVATE_PEM;
    process.env.JWT_ACCESS_PUBLIC_KEY_PEM = TEST_JWT_PUBLIC_PEM;
    process.env.REFRESH_TOKEN_PEPPER = TEST_REFRESH_PEPPER;
    process.env.OTP_PEPPER = TEST_OTP_PEPPER;
    process.env.PHONE_SUBJECT_PEPPER = TEST_PHONE_SUBJECT_PEPPER;
    process.env.LM_WEB_BFF_SECRET = 'ci-cross-repo-web-bff-secret-32-chars-minimum';
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    prisma = module.get(PrismaService);
    fakeSms = module.get(FakeSmsSender);
    expect(module.get(SMS_SENDER)).toBe(fakeSms);
    const apiPort = (app.getHttpServer().address() as AddressInfo).port;
    const webPort = await allocatePort();
    origin = 'http://127.0.0.1:' + webPort;
    const cwd = process.env.LM_CLIENT_WEB_DIR!;
    next = spawn(process.execPath, [join(cwd, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(webPort)], {
      cwd, stdio: 'ignore',
      env: {
        ...process.env, NODE_ENV: 'production',
        LM_API_BASE_URL: 'http://127.0.0.1:' + apiPort,
        LM_WEB_BFF_SECRET: process.env.LM_WEB_BFF_SECRET,
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });
    // In production Next uses __Host- cookies; tests operate over HTTP, so
    // production cookie policies cannot be exercised by Node's non-browser fetch.
    // Test the backend and HTTP boundary; separate HTTPS browser QA is required.
    for (let i = 0; i < 100; i++) {
      if (next.exitCode !== null) throw new Error('Next exited: ' + next.exitCode);
      try {
        const response = await fetch(origin);
        if (response.ok) return;
      } catch { /* start-up */ }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error('Next server did not start');
  }, 90000);

  afterAll(async () => {
    next?.kill('SIGTERM');
    await app?.close();
  });

  it('sign-in, protected access, passive read, explicit activity, logout and idle expiry', async () => {
    // Production mode on HTTP means Secure cookies are not replayed automatically;
    // raw explicit Cookie headers allow us to test the server-only session chain.
    const first = await signIn('+905552224411');
    const profile = await fetch(origin + '/api/auth/me', { headers: { cookie: first.cookie } });
    expect(profile.status).toBe(200);
    const parentPage = await fetch(origin + '/parent', { headers: { cookie: first.cookie }, redirect: 'manual' });
    expect(parentPage.status).toBe(200);
    const activity = await requestWeb('activity', {}, first.cookie);
    expect(activity.status).toBe(200);
    const logout = await requestWeb('logout', {}, first.cookie);
    expect(logout.status).toBe(200);
    expect((await fetch(origin + '/api/auth/me', { headers: { cookie: first.cookie } })).status).toBe(401);

    const second = await signIn('+905552224422');
    const hash = createHmac('sha256', TEST_REFRESH_PEPPER)
      .update('web-session-v1:').update(second.handle).digest('hex');
    await prisma.db.webParentSession.update({
      where: { handleHash: hash },
      data: { lastUsedAt: new Date(Date.now() - 31 * 60_000) },
    });
    expect((await fetch(origin + '/api/auth/me', { headers: { cookie: second.cookie } })).status).toBe(401);
    expect((await requestWeb('activity', {}, second.cookie)).status).toBe(401);
    expect((await fetch(origin + '/parent', { headers: { cookie: second.cookie }, redirect: 'manual' })).status).toBe(307);
  }, 90000);
});
