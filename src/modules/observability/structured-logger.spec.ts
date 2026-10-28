import { ConfigService } from '@nestjs/config';
import { RecentErrorsStore } from './recent-errors.store';
import {
  fingerprintError,
  StructuredLogger,
} from './structured-logger';
import { runWithRequestContext } from './request-context';

describe('StructuredLogger', () => {
  const config = {
    get: (key: string) => {
      if (key === 'APP_ENV') return 'development';
      if (key === 'RELEASE') return 'test-release';
      return undefined;
    },
  } as unknown as ConfigService<never, true>;

  let store: RecentErrorsStore;
  let logger: StructuredLogger;
  let lines: string[];

  beforeEach(() => {
    store = new RecentErrorsStore();
    logger = new StructuredLogger(config, store);
    lines = [];
    jest.spyOn(console, 'log').mockImplementation((line: string) => {
      lines.push(line);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits JSON with correlation fields and without sensitive context', () => {
    runWithRequestContext({ requestId: 'corr-42', traceId: 'trace-9' }, () => {
      logger.info('http_request', {
        event: 'request',
        method: 'GET',
        path: '/health',
        status_code: 200,
        authorization: 'Bearer secret',
        childName: 'Ada',
      });
    });

    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]) as Record<string, unknown>;
    expect(parsed).toMatchObject({
      service: 'little-minds-backend',
      environment: 'development',
      release: 'test-release',
      severity: 'info',
      message: 'http_request',
      request_id: 'corr-42',
      trace_id: 'trace-9',
    });
    expect(JSON.stringify(parsed)).not.toMatch(/Bearer|secret|Ada/i);
    expect(parsed.context).toEqual({
      event: 'request',
      method: 'GET',
      path: '/health',
      status_code: 200,
    });
  });

  it('records alertable errors into the bounded recent-error store', () => {
    logger.error('boom', {
      alertable: true,
      error: new Error('db down'),
      context: { event: 'health', check: 'readiness' },
    });

    expect(store.hasRecentFailures()).toBe(true);
    expect(store.list()[0]?.fingerprint).toBe(fingerprintError(new Error('db down')));
  });
});

describe('fingerprintError', () => {
  it('is stable for the same error shape', () => {
    expect(fingerprintError(new Error('x'))).toBe(
      fingerprintError(new Error('x')),
    );
  });
});
