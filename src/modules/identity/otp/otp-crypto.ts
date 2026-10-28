import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/** 6-digit numeric OTP via CSPRNG (ADR-020 U1). */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Privacy-safe phone subject: hex(HMAC-SHA256(PHONE_SUBJECT_PEPPER, e164)) (U8). */
export function phoneSubjectKey(e164: string, phoneSubjectPepper: string): string {
  return createHmac('sha256', phoneSubjectPepper).update(e164, 'utf8').digest('hex');
}

/**
 * OTP code hash bound to challenge + subject (ADR-020 §11):
 * HMAC-SHA256(OTP_PEPPER, challenge_id || ":" || subject_key || ":" || code)
 */
export function hashOtpCode(
  otpPepper: string,
  challengeId: string,
  subjectKey: string,
  code: string,
): string {
  const material = `${challengeId}:${subjectKey}:${code}`;
  return createHmac('sha256', otpPepper).update(material, 'utf8').digest('hex');
}

export function verifyOtpCode(
  otpPepper: string,
  challengeId: string,
  subjectKey: string,
  code: string,
  expectedHash: string,
): boolean {
  const actual = hashOtpCode(otpPepper, challengeId, subjectKey, code);
  const a = Buffer.from(actual, 'utf8');
  const b = Buffer.from(expectedHash, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
