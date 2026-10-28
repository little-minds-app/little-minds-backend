import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { fingerprintError, StructuredLogger } from './structured-logger';
import { safePath } from './http-logging.interceptor';
import { getRequestId } from './request-context';

/**
 * Global exception filter: structured redacted logs; ordinary 4xx are not
 * treated as incidents (Blueprint §31.2.2). Never echoes request bodies.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

    const status = resolveStatus(exception);
    const message = resolveClientMessage(exception, status);
    const path = safePath(req.originalUrl || req.url || '/');
    const method = req.method;
    const isIncident = status >= 500;
    const requestId =
      getRequestId() ??
      (req as Request & { requestId?: string }).requestId;

    if (isIncident) {
      this.logger.error('unhandled_exception', {
        error: exception,
        alertable: true,
        context: {
          event: 'error',
          method,
          path,
          status_code: status,
          error_name: errorName(exception),
          error_fingerprint: fingerprintError(exception),
        },
      });
    } else {
      this.logger.warn('client_error', {
        event: 'error',
        method,
        path,
        status_code: status,
        error_name: errorName(exception),
      });
    }

    if (requestId) {
      res.setHeader('x-request-id', requestId);
    }

    const errorCode = resolveAuthErrorCode(exception);
    res.status(status).json({
      ...(errorCode ? { error: errorCode } : { statusCode: status }),
      message,
      request_id: requestId,
    });
  }
}

function resolveStatus(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

/** Preserve ADR-019/020 AuthError `error` codes when present on HttpException body. */
function resolveAuthErrorCode(exception: unknown): string | undefined {
  if (!(exception instanceof HttpException)) {
    return undefined;
  }
  const body = exception.getResponse();
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const code = (body as { error?: unknown }).error;
  return typeof code === 'string' && code.length > 0 && code.length <= 64
    ? code
    : undefined;
}

function resolveClientMessage(exception: unknown, status: number): string {
  if (exception instanceof HttpException) {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body.slice(0, 256);
    }
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message: unknown }).message;
      if (typeof msg === 'string') {
        return msg.slice(0, 256);
      }
      if (Array.isArray(msg)) {
        return msg.map(String).join('; ').slice(0, 256);
      }
    }
    return exception.message.slice(0, 256);
  }
  // Do not leak internal error messages on 5xx.
  if (status >= 500) {
    return 'Internal server error';
  }
  return 'Request failed';
}

function errorName(exception: unknown): string {
  if (exception && typeof exception === 'object' && 'name' in exception) {
    return String((exception as { name: unknown }).name).slice(0, 64);
  }
  return 'Error';
}
