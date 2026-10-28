/**
 * E.164 Türkiye (+90) normalization for LMP-34 Day-1 (ADR-020 U10).
 * Rejects non-TR and malformed input uniformly (anti-enumeration).
 */

const TR_E164 = /^\+90[5][0-9]{9}$/;

export type PhoneNormalizeResult =
  | { ok: true; e164: string }
  | { ok: false };

/**
 * Accepts:
 * - E.164 `+905XXXXXXXXX`
 * - Local `05XXXXXXXXX` / `5XXXXXXXXX` (TR mobile)
 * - Optional `country_code` of `+90` / `90` / `TR` with national number
 */
export function normalizeTrMobileE164(
  phone: string,
  countryCode?: string | null,
): PhoneNormalizeResult {
  const raw = phone.trim().replace(/[\s\-()]/g, '');
  if (!raw) {
    return { ok: false };
  }

  let candidate = raw;
  const cc = (countryCode ?? '').trim().toUpperCase();

  if (candidate.startsWith('+')) {
    // already international
  } else if (cc === '+90' || cc === '90' || cc === 'TR') {
    const national = candidate.replace(/^0/, '');
    candidate = `+90${national}`;
  } else if (candidate.startsWith('00')) {
    candidate = `+${candidate.slice(2)}`;
  } else if (candidate.startsWith('0') && candidate.length === 11) {
    candidate = `+90${candidate.slice(1)}`;
  } else if (candidate.startsWith('5') && candidate.length === 10) {
    candidate = `+90${candidate}`;
  } else {
    return { ok: false };
  }

  if (!TR_E164.test(candidate)) {
    return { ok: false };
  }
  return { ok: true, e164: candidate };
}
