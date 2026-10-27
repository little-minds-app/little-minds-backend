import { isSecretEnvKey } from './env.secrets';

const REDACTED = '[REDACTED]';

/**
 * Mask userinfo (credentials) inside URLs without dropping the rest of the URL shape.
 */
export function redactUrlCredentials(value: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) {
      parsed.username = parsed.username ? '***' : '';
      parsed.password = parsed.password ? '***' : '';
      return parsed.toString();
    }
    return value;
  } catch {
    return value.replace(/\/\/([^/@\s]+):([^@/\s]+)@/g, '//***:***@');
  }
}

function redactPrimitive(key: string | undefined, value: string): string {
  if (key && isSecretEnvKey(key)) {
    return REDACTED;
  }
  if (key && /secret|password|token|apikey|api_key|authorization/i.test(key)) {
    return REDACTED;
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && value.includes('@')) {
    return redactUrlCredentials(value);
  }
  return value;
}

/**
 * Recursively redact secret keys and URL credentials for safe structured logging.
 * Never throws; returns a JSON-serializable clone.
 */
export function redactSecrets(input: unknown, keyHint?: string): unknown {
  if (input === null || input === undefined) {
    return input;
  }
  if (typeof input === 'string') {
    return redactPrimitive(keyHint, input);
  }
  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => redactSecrets(item, keyHint));
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      if (isSecretEnvKey(key) || /secret|password|token|apikey|api_key/i.test(key)) {
        out[key] = REDACTED;
        continue;
      }
      out[key] = redactSecrets(value, key);
    }
    return out;
  }
  return String(input);
}
