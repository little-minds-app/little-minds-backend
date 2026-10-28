import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.APP_ENV = 'development';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:3000';

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

  it('GET /health/ready returns ok with database skipped when unset', async () => {
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
    process.env.APP_ENV = 'development';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:3000';

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
