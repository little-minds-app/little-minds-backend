import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  REQUEST_ID_HEADER,
  resolveRequestId,
  runWithRequestContext,
} from './request-context';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = headerValue(req.headers[REQUEST_ID_HEADER]);
    const requestId = resolveRequestId(incoming);
    const traceHeader = headerValue(req.headers['x-trace-id']);
    const traceId =
      traceHeader && /^[A-Za-z0-9_-]{1,128}$/.test(traceHeader)
        ? traceHeader
        : undefined;

    res.setHeader(REQUEST_ID_HEADER, requestId);
    const correlated = req as Request & {
      requestId?: string;
      traceId?: string;
    };
    correlated.requestId = requestId;
    correlated.traceId = traceId;

    runWithRequestContext({ requestId, traceId }, () => next());
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
