import { createHmac } from 'node:crypto';
import { domainToASCII } from 'node:url';

/**
 * email_norm_v1 (ADR-021 §6). Changing rules requires email_norm_v2 + dual-read.
 */

export type EmailNormOk = { ok: true; canonical: string };
export type EmailNormErr = { ok: false; reason: string };
export type EmailNormResult = EmailNormOk | EmailNormErr;

const EMAIL_NORM_PREFIX = 'email_norm_v1|';

/** Reject non-ASCII local-part code points (Unicode local forbidden). */
function isAsciiLocal(local: string): boolean {
  for (let i = 0; i < local.length; i += 1) {
    if (local.charCodeAt(i) > 0x7f) {
      return false;
    }
  }
  return true;
}

function hasControlOrSpace(s: string): boolean {
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    if (c <= 0x20 || c === 0x7f) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize email per email_norm_v1:
 * - trim Unicode whitespace
 * - UTF-8 byte length ∈ [3, 320]
 * - single @; non-empty local + domain
 * - local: ASCII only, case-preserved, plus-tags preserved
 * - domain: IDNA/UTS #46 → ASCII punycode, lowercase
 * - no provider collapse (no Gmail dot-strip / googlemail rewrite)
 */
export function normalizeEmailV1(raw: unknown): EmailNormResult {
  if (typeof raw !== 'string') {
    return { ok: false, reason: 'type' };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty' };
  }
  const byteLen = Buffer.byteLength(trimmed, 'utf8');
  if (byteLen < 3 || byteLen > 320) {
    return { ok: false, reason: 'length' };
  }
  const at = trimmed.indexOf('@');
  if (at <= 0 || at !== trimmed.lastIndexOf('@') || at === trimmed.length - 1) {
    return { ok: false, reason: 'syntax' };
  }
  const local = trimmed.slice(0, at);
  const domainRaw = trimmed.slice(at + 1);
  if (local.length === 0 || domainRaw.length === 0) {
    return { ok: false, reason: 'syntax' };
  }
  if (hasControlOrSpace(local) || hasControlOrSpace(domainRaw)) {
    return { ok: false, reason: 'charset' };
  }
  if (!isAsciiLocal(local)) {
    return { ok: false, reason: 'unicode_local' };
  }
  // Preserve local-part case (do not lowercase).
  let domainAscii: string;
  try {
    domainAscii = domainToASCII(domainRaw);
  } catch {
    return { ok: false, reason: 'domain' };
  }
  if (!domainAscii || domainAscii.length === 0) {
    return { ok: false, reason: 'domain' };
  }
  const domain = domainAscii.toLowerCase();
  if (domain.includes(' ') || domain.startsWith('.') || domain.endsWith('.')) {
    return { ok: false, reason: 'domain' };
  }
  return { ok: true, canonical: `${local}@${domain}` };
}

/** HMAC-SHA256(EMAIL_SUBJECT_PEPPER, "email_norm_v1|" || canonical_email) hex. */
export function emailSubjectKey(
  canonicalEmail: string,
  emailSubjectPepper: string,
): string {
  return createHmac('sha256', emailSubjectPepper)
    .update(`${EMAIL_NORM_PREFIX}${canonicalEmail}`, 'utf8')
    .digest('hex');
}
