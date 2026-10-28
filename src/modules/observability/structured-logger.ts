import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import type { AppEnv } from '../../config/env.validation';
import { allowlistAndRedactContext } from '../../config/redact';
import { OBSERVABILITY_ADAPTERS } from './adapters';
import { getRequestContext } from './request-context';
import { RecentErrorsStore } from './recent-errors.store';

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type StructuredLogEvent = {
  timestamp: string;
  service: 'little-minds-backend';
  environment: string;
  release: string;
  severity: LogSeverity;
  message: string;
  request_id?: string;
  trace_id?: string;
  error_fingerprint?: string;
  context?: Record<string, unknown>;
};

export type StructuredLogInput = {
  severity: LogSeverity;
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
  /** When true, record into the bounded recent-error store (5xx / health failures). */
  alertable?: boolean;
};

@Injectable()
export class StructuredLogger {
  private readonly service = 'little-minds-backend' as const;

  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    private readonly recentErrors: RecentErrorsStore,
  ) {}

  log(input: StructuredLogInput): StructuredLogEvent {
    const ctx = getRequestContext();
    const fingerprint = input.error
      ? fingerprintError(input.error)
      : input.context?.error_fingerprint &&
          typeof input.context.error_fingerprint === 'string'
        ? input.context.error_fingerprint
        : undefined;

    const event: StructuredLogEvent = {
      timestamp: new Date().toISOString(),
      service: this.service,
      environment: this.config.get('APP_ENV', { infer: true }),
      release: this.config.get('RELEASE', { infer: true }),
      severity: input.severity,
      message: sanitizeMessage(input.message),
      request_id: ctx?.requestId,
      trace_id: ctx?.traceId,
      error_fingerprint: fingerprint,
      context: allowlistAndRedactContext(input.context),
    };

    if (OBSERVABILITY_ADAPTERS.consoleStructuredLogger) {
      // Single JSON line — scrapable by future exporters; no pretty-print.
      console.log(JSON.stringify(event));
    }

    if (
      input.alertable &&
      (input.severity === 'error' || input.severity === 'critical')
    ) {
      this.recentErrors.record({
        fingerprint: fingerprint ?? `msg:${event.message.slice(0, 64)}`,
        severity: input.severity,
        message: event.message,
        requestId: event.request_id,
      });
    }

    return event;
  }

  info(message: string, context?: Record<string, unknown>): StructuredLogEvent {
    return this.log({ severity: 'info', message, context });
  }

  warn(message: string, context?: Record<string, unknown>): StructuredLogEvent {
    return this.log({ severity: 'warn', message, context });
  }

  error(
    message: string,
    options?: {
      context?: Record<string, unknown>;
      error?: unknown;
      alertable?: boolean;
    },
  ): StructuredLogEvent {
    return this.log({
      severity: 'error',
      message,
      context: options?.context,
      error: options?.error,
      alertable: options?.alertable ?? true,
    });
  }
}

function sanitizeMessage(message: string): string {
  // Strip CR/LF to reduce log-injection risk; bound length.
  return message.replace(/[\r\n\0]+/g, ' ').slice(0, 512);
}

export function fingerprintError(error: unknown): string {
  const name =
    error && typeof error === 'object' && 'name' in error
      ? String((error as { name: unknown }).name)
      : 'Error';
  const message =
    error && typeof error === 'object' && 'message' in error
      ? sanitizeMessage(String((error as { message: unknown }).message))
      : sanitizeMessage(String(error));
  return createHash('sha256')
    .update(`${name}|${message}`)
    .digest('hex')
    .slice(0, 16);
}
