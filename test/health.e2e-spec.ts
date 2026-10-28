import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import type { AppEnv } from '../src/config/env.validation';
import {
  TEST_JWT_PRIVATE_PEM,
  TEST_JWT_PUBLIC_PEM,
  TEST_REFRESH_PEPPER,
} from './fixtures/auth/keys';

function bootEnvLocal(): void {
  process.env.APP_ENV = 'development';
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3000';
  process.env.PUBLIC_API_BASE_URL = 'http://localhost:3000';
}

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    bootEnvLocal();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        isConfigured: false,
        ping: jest.fn(),
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 without authentication', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'little-minds-backend',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('echoes or mints x-request-id correlation headers', async () => {
    const minted = await request(app.getHttpServer()).get('/health').expect(200);
    expect(minted.headers['x-request-id']).toMatch(/^[A-Za-z0-9_-]+$/);

    const echoed = await request(app.getHttpServer())
      .get('/health')
      .set('x-request-id', 'e2e-corr-99')
      .expect(200);
    expect(echoed.headers['x-request-id']).toBe('e2e-corr-99');
  });

  it('positive: GET /health/ready may skip database in development', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'little-minds-backend',
      checks: { database: 'skipped' },
    });
  });
});

describe('Health readiness failure (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    bootEnvLocal();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        isConfigured: true,
        ping: jest.fn().mockResolvedValue(false),
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health/ready returns 503 when database probe fails', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503);

    expect(response.body).toMatchObject({
      status: 'not_ready',
      checks: { database: 'down' },
    });
    expect(JSON.stringify(response.body)).not.toMatch(
      /password|postgres:|Bearer|childName/i,
    );
  });
});

describe.each(['staging', 'production'] as const)(
  'Health readiness missing DATABASE_URL in %s (e2e)',
  (appEnv) => {
    let app: INestApplication<App>;

    beforeAll(async () => {
      // Boot under development so ConfigModule validateEnv succeeds; override
      // ConfigService so readiness sees staging/production without DATABASE_URL.
      bootEnvLocal();

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(PrismaService)
        .useValue({
          isConfigured: false,
          ping: jest.fn(),
          onModuleInit: async () => undefined,
          onModuleDestroy: async () => undefined,
        })
        .overrideProvider(ConfigService)
        .useValue({
          get: (key: keyof AppEnv | string) => {
            if (key === 'APP_ENV') {
              return appEnv;
            }
            if (key === 'NODE_ENV') {
              return 'test';
            }
            if (key === 'PORT') {
              return 3000;
            }
            if (key === 'PUBLIC_API_BASE_URL') {
              return 'https://api.example.invalid';
            }
            if (key === 'RELEASE') {
              return 'test-release';
            }
            // LMP-33: JwtAccessService.onModuleInit still runs; supply keys so
            // readiness-only staging/production simulation can boot.
            if (key === 'JWT_ACCESS_PRIVATE_KEY_PEM') {
              return TEST_JWT_PRIVATE_PEM;
            }
            if (key === 'JWT_ACCESS_PUBLIC_KEY_PEM') {
              return TEST_JWT_PUBLIC_PEM;
            }
            if (key === 'REFRESH_TOKEN_PEPPER') {
              return TEST_REFRESH_PEPPER;
            }
            if (key === 'AUTH_DEV_BOOTSTRAP_ENABLED') {
              return false;
            }
            if (key === 'LISTEN_HOST') {
              return '0.0.0.0';
            }
            return undefined;
          },
        })
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it(`negative: GET /health/ready returns 503 when DATABASE_URL missing in ${appEnv}`, async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'not_ready',
        checks: { database: 'down' },
      });
      expect(response.body.checks.database).not.toBe('skipped');
    });
  },
);
