import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import {
  runWithRequestContext,
  type RequestContextStore,
} from './request-context';
import { StructuredLogger } from './structured-logger';

type RequestWithCorrelation = Request & {
  requestId?: string;
  traceId?: string;
};

/**
 * Logs request completion metadata only — never bodies, query strings with
 * secrets, or Authorization headers (Blueprint §31.4).
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithCorrelation>();
    const res = http.getResponse<Response>();
    const started = Date.now();
    const path = safePath(req.originalUrl || req.url || '/');
    const method = req.method;
    const store: RequestContextStore | undefined = req.requestId
      ? { requestId: req.requestId, traceId: req.traceId }
      : undefined;

    const handle = next.handle().pipe(
      tap({
        next: () => {
          this.logger.info('http_request', {
            event: 'request',
            method,
            path,
            status_code: res.statusCode,
            duration_ms: Date.now() - started,
          });
        },
        error: () => {
          // Exception filter owns error logging; still emit timing on failure path.
          this.logger.warn('http_request_failed', {
            event: 'request',
            method,
            path,
            status_code: res.statusCode || 500,
            duration_ms: Date.now() - started,
          });
        },
      }),
    );

    if (!store) {
      return handle;
    }

    return new Observable((subscriber) => {
      runWithRequestContext(store, () => {
        handle.subscribe(subscriber);
      });
    });
  }
}

/** Path only — drop query string to avoid leaking tokens in URLs. */
export function safePath(rawUrl: string): string {
  const q = rawUrl.indexOf('?');
  const path = q === -1 ? rawUrl : rawUrl.slice(0, q);
  return path.slice(0, 256) || '/';
}
