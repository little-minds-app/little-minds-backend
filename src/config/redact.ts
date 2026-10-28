import { isSecretEnvKey } from './env.secrets';

export const REDACTED = '[REDACTED]';

/** Header names that must never appear in logs (case-insensitive). */
const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'proxy-authorization',
]);

/**
 * Token parts that mark a key as credentials / auth / PII
 * (Blueprint §31.4 / §36.2). Matched on underscore/camel segments so
 * technical ids like `play_session_id` are not over-redacted.
 */
const SENSITIVE_SEGMENTS = new Set([
  'secret',
  'password',
  'passwd',
  'token',
  'apikey',
  'authorization',
  'auth',
  'bearer',
  'otp',
  'jwt',
  'cookie',
  'credential',
  'credentials',
  'phone',
  'email',
  'dob',
  'ssn',
  'passport',
  'oauth',
  'firstname',
  'lastname',
  'fullname',
  'childname',
  'displayname',
  'givenname',
  'familyname',
  'birthdate',
  'dateofbirth',
  'nationalid',
  'privatekey',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'purchasetoken',
]);

/**
 * Allowlisted structured-log context keys (plus severity envelope fields).
 * Anything else in a context object is dropped or deeply redacted.
 */
export const STRUCTURED_LOG_ALLOWLIST = new Set([
  'event',
  'method',
  'path',
  'status_code',
  'duration_ms',
  'error_name',
  'error_fingerprint',
  'route',
  'check',
  'adapter',
  'ready',
  'database',
  'http_status',
  // LMP-33 session lifecycle (never parent_id / tokens / PII)
  // Avoid keys containing the segment "auth" — that triggers value redaction.
  'session_event',
  'session_id',
  'token_family_id',
  'refresh_generation',
  'revoke_reason',
  'client_surface',
  'session_error',
]);

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

function splitKeySegments(key: string): string[] {
  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase();
  return normalized.split('_').filter(Boolean);
}

function isSensitiveKey(key: string): boolean {
  if (isSecretEnvKey(key)) {
    return true;
  }
  if (SENSITIVE_HEADER_NAMES.has(key.toLowerCase())) {
    return true;
  }

  const segments = splitKeySegments(key);
  if (segments.some((part) => SENSITIVE_SEGMENTS.has(part))) {
    return true;
  }

  // Compound forms without separators: apiKey → already split; apikey as whole key
  const compact = segments.join('');
  if (SENSITIVE_SEGMENTS.has(compact)) {
    return true;
  }

  // Multi-segment compounds: refresh + token, access + token, session + id, etc.
  for (let i = 0; i < segments.length - 1; i += 1) {
    const pair = `${segments[i]}${segments[i + 1]}`;
    if (SENSITIVE_SEGMENTS.has(pair)) {
      return true;
    }
  }

  return false;
}

function redactPrimitive(key: string | undefined, value: string): string {
  if (key && isSensitiveKey(key)) {
    return REDACTED;
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && value.includes('@')) {
    return redactUrlCredentials(value);
  }
  // Bearer / JWT-shaped literals even under non-sensitive keys
  if (/^Bearer\s+\S+/i.test(value)) {
    return REDACTED;
  }
  if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(value)) {
    return REDACTED;
  }
  return value;
}

/**
 * Recursively redact secret keys, auth headers, tokens, and PII-shaped fields
 * for safe structured logging. Never throws; returns a JSON-serializable clone.
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
      if (isSensitiveKey(key)) {
        out[key] = REDACTED;
        continue;
      }
      out[key] = redactSecrets(value, key);
    }
    return out;
  }
  return String(input);
}

/**
 * Project an arbitrary context object onto the structured-log allowlist,
 * then redact any residual sensitive values.
 */
export function allowlistAndRedactContext(
  context: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!context) {
    return undefined;
  }
  const projected: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (!STRUCTURED_LOG_ALLOWLIST.has(key)) {
      continue;
    }
    projected[key] = redactSecrets(value, key);
  }
  return projected;
}
