import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import type { StructuredLogger } from './structured-logger';

describe('HttpLoggingInterceptor failure status', () => {
  it('logs HttpException status on the error path (not default 200)', (done) => {
    const logs: Array<{ message: string; context?: Record<string, unknown> }> =
      [];
    const logger = {
      info: (message: string, context?: Record<string, unknown>) => {
        logs.push({ message, context });
        return {} as ReturnType<StructuredLogger['info']>;
      },
      warn: (message: string, context?: Record<string, unknown>) => {
        logs.push({ message, context });
        return {} as ReturnType<StructuredLogger['warn']>;
      },
    } as unknown as StructuredLogger;

    const interceptor = new HttpLoggingInterceptor(logger);
    const res = { statusCode: 200 };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', originalUrl: '/v1/events/batch' }),
        getResponse: () => res,
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => throwError(() => new BadRequestException('batch.invalid_session')),
    };

    interceptor.intercept(context, next).subscribe({
      error: () => {
        const failed = logs.find((entry) => entry.message === 'http_request_failed');
        expect(failed?.context?.status_code).toBe(400);
        done();
      },
    });
  });

  it('logs 200 on successful completion', (done) => {
    const logs: Array<{ message: string; context?: Record<string, unknown> }> =
      [];
    const logger = {
      info: (message: string, context?: Record<string, unknown>) => {
        logs.push({ message, context });
        return {} as ReturnType<StructuredLogger['info']>;
      },
      warn: () => ({}) as ReturnType<StructuredLogger['warn']>,
    } as unknown as StructuredLogger;

    const interceptor = new HttpLoggingInterceptor(logger);
    const res = { statusCode: 200 };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', originalUrl: '/v1/events/batch' }),
        getResponse: () => res,
      }),
    } as ExecutionContext;

    interceptor.intercept(context, { handle: () => of(undefined) }).subscribe({
      complete: () => {
        const ok = logs.find((entry) => entry.message === 'http_request');
        expect(ok?.context?.status_code).toBe(200);
        done();
      },
    });
  });
});
