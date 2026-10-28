import type { ActivityValidationIssue } from './activity-contract.types';

/**
 * Recursive privacy rejection (Blueprint §14.1 / §16 / ADR-017 / §34.3 / §38.4).
 * Fail closed: banned keys, free-text heuristics, media, identity, secrets.
 */

const BANNED_EXACT_KEYS = new Set(
  [
    'child_id',
    'child_name',
    'parent_id',
    'parent_name',
    'user_id',
    'auth_subject',
    'email',
    'phone',
    'phone_number',
    'otp',
    'jwt',
    'access_token',
    'refresh_token',
    'id_token',
    'oauth',
    'password',
    'advertising_id',
    'idfa',
    'gaid',
    'precise_location',
    'gps',
    'latitude',
    'longitude',
    'microphone',
    'photo',
    'photos',
    'image',
    'images',
    'video',
    'audio',
    'recording',
    'contact_list',
    'contacts',
    'raw_touch',
    'touch_path',
    'pointer_x',
    'pointer_y',
    'touch_x',
    'touch_y',
    'received_at',
    'notes',
    'note',
    'transcript',
    'free_text',
    'comment',
    'comments',
    'materials',
    'mentor_adjacency',
  ].map((k) => k.toLowerCase()),
);

const BANNED_SUBSTRINGS = [
  'touch',
  'coord',
  'pointer',
  'fingerprint',
  'microphone',
  'advertising',
  'idfa',
  'gaid',
  'password',
  'secret',
  'token',
  'otp',
  'child_name',
  'parent_name',
];

const FREE_TEXT_VALUE_MAX = 64;

function pathJoin(base: string, key: string | number): string {
  if (base === '') {
    return String(key);
  }
  return typeof key === 'number' ? `${base}[${key}]` : `${base}.${key}`;
}

function keyLooksBanned(key: string): boolean {
  const lower = key.toLowerCase();
  if (BANNED_EXACT_KEYS.has(lower)) {
    return true;
  }
  return BANNED_SUBSTRINGS.some((s) => lower.includes(s));
}

function looksLikeDataUrl(value: string): boolean {
  return /^data:(image|audio|video|application)\//i.test(value);
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function looksLikePhone(value: string): boolean {
  // Require an explicit phone shape (+country or separators). Do not match UUIDs/timestamps.
  if (/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-/.test(value)) {
    return false;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return false;
  }
  const trimmed = value.trim();
  if (!/^\+?\d[\d\s().-]{8,}\d$/.test(trimmed)) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && /[+\s()-]/.test(trimmed);
}

/**
 * Walk a JSON value and collect privacy violations.
 * Does not log values (avoid sensitive payload leakage in issues).
 */
export function collectPrivacyIssues(
  value: unknown,
  basePath = '',
): ActivityValidationIssue[] {
  const issues: ActivityValidationIssue[] = [];

  if (value === null || value === undefined) {
    return issues;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      issues.push(...collectPrivacyIssues(item, pathJoin(basePath, index)));
    });
    return issues;
  }

  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const childPath = pathJoin(basePath, key);
      if (keyLooksBanned(key)) {
        issues.push({
          code: 'privacy.banned_key',
          path: childPath,
          message: `Forbidden privacy-sensitive key "${key}"`,
        });
        // Still walk children to surface nested issues without trusting content.
      }
      issues.push(...collectPrivacyIssues(child, childPath));
    }
    return issues;
  }

  if (typeof value === 'string') {
    const leaf = basePath.split('.').pop() ?? '';
    const structuralLeaves = new Set([
      'occurred_at',
      'started_at',
      'ended_at',
      'event_id',
      'play_session_id',
      'device_id',
      'content_version_id',
      'app_build',
      'consent_policy_version',
      'policy_version',
      'schema_version',
      'event_type',
      'consent_scope',
      'locale',
    ]);

    if (looksLikeDataUrl(value)) {
      issues.push({
        code: 'privacy.media_blob',
        path: basePath,
        message: 'Media data-URL values are forbidden',
      });
    }
    if (!structuralLeaves.has(leaf) && looksLikeEmail(value)) {
      issues.push({
        code: 'privacy.pii_email',
        path: basePath,
        message: 'Email-like values are forbidden',
      });
    }
    if (!structuralLeaves.has(leaf) && looksLikePhone(value)) {
      issues.push({
        code: 'privacy.pii_phone',
        path: basePath,
        message: 'Phone-like values are forbidden',
      });
    }
    // Unrestricted free text: reject whitespace prose outside allowlisted leaves.
    if (
      !structuralLeaves.has(leaf) &&
      /\s/.test(value) &&
      !/^[a-z0-9][a-z0-9._-]*$/i.test(value)
    ) {
      issues.push({
        code: 'privacy.free_text',
        path: basePath,
        message: 'Unrestricted free-text values are forbidden',
      });
    } else if (
      !structuralLeaves.has(leaf) &&
      value.length > FREE_TEXT_VALUE_MAX &&
      /\s/.test(value)
    ) {
      issues.push({
        code: 'privacy.free_text',
        path: basePath,
        message: 'Unrestricted free-text values are forbidden',
      });
    }
  }

  return issues;
}

/** Client wire documents must never carry server-only or ownership identity fields. */
export function collectForbiddenClientIdentityIssues(
  record: Record<string, unknown>,
): ActivityValidationIssue[] {
  const issues: ActivityValidationIssue[] = [];
  const forbiddenTopLevel = [
    'received_at',
    'child_id',
    'parent_id',
    'user_id',
    'auth_subject',
  ];
  for (const key of forbiddenTopLevel) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      issues.push({
        code: 'privacy.forbidden_client_identity',
        path: key,
        message: `Client must not send "${key}"; ownership and receipt are server-derived`,
      });
    }
  }
  return issues;
}
