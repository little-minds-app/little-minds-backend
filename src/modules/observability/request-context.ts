import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

export type RequestContextStore = {
  requestId: string;
  traceId?: string;
};

const storage = new AsyncLocalStorage<RequestContextStore>();

/**
 * Run work inside a request correlation scope (middleware entry).
 */
export function runWithRequestContext<T>(
  store: RequestContextStore,
  fn: () => T,
): T {
  return storage.run(store, fn);
}

export function getRequestContext(): RequestContextStore | undefined {
  return storage.getStore();
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/**
 * Accept a client-supplied request id when it is a safe opaque token;
 * otherwise mint a new UUID. Rejects CR/LF and overlong values (log injection).
 */
export function resolveRequestId(incoming: string | undefined): string {
  if (!incoming) {
    return randomUUID();
  }
  const trimmed = incoming.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > 128 ||
    /[\r\n\0]/.test(trimmed)
  ) {
    return randomUUID();
  }
  // Prefer UUID-shaped ids; still accept opaque alphanumeric tokens.
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }
  return randomUUID();
}
