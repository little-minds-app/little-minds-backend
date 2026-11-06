import type { StructuredLogger } from '../../src/modules/observability/structured-logger';

/** Minimal StructuredLogger stand-in for unit/db tests without Nest bootstrap. */
export function noopStructuredLogger(): StructuredLogger {
  return {
    log: () => ({}) as ReturnType<StructuredLogger['log']>,
    info: () => ({}) as ReturnType<StructuredLogger['info']>,
    warn: () => ({}) as ReturnType<StructuredLogger['warn']>,
    error: () => ({}) as ReturnType<StructuredLogger['error']>,
  } as unknown as StructuredLogger;
}
