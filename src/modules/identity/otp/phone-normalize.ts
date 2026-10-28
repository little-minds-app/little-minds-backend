/**
 * E.164 Türkiye (+90) **mobile** normalization for LMP-34 Day-1 (ADR-020 U10).
 * No country expansion beyond TR. Rejects landlines / non-TR uniformly (U12).
 *
 * Uses a maintained TR mobile structure check rather than a third-party
 * phonenumber dependency (no new npm deps). Operator prefixes stay TR-only.
 */

/** TR mobile: +90 5XX XXX XX XX (10 national digits starting with 5). */
const TR_MOBILE_E164 = /^\+905[0-9]{9}$/;

/** National mobile operator second digit — exclude obvious landline shapes. */
const TR_MOBILE_NATIONAL = /^5[0-9]{9}$/;

export type PhoneNormalizeResult =
  | { ok: true; e164: string }
  | { ok: false };

/**
 * Accepts:
 * - E.164 `+905XXXXXXXXX`
 * - Local `05XXXXXXXXX` / `5XXXXXXXXX` (TR mobile)
 * - Optional `country_code` of `+90` / `90` / `TR` with national mobile number
 *
 * Rejects (uniform `ok: false` — callers map to generic invalid_request):
 * - Non-+90 countries
 * - TR landline-shaped (+902… / +903… / +904…)
 * - Too short / too long / garbage
 */
export function normalizeTrMobileE164(
  phone: string,
  countryCode?: string | null,
): PhoneNormalizeResult {
  if (typeof phone !== 'string') {
    return { ok: false };
  }
  const raw = phone.trim().replace(/[\s\-().]/g, '');
  if (!raw || raw.length > 20) {
    return { ok: false };
  }

  let candidate = raw;
  const cc = (countryCode ?? '').trim().toUpperCase();
  const ccProvided = cc.length > 0;
  const ccIsTr = cc === '+90' || cc === '90' || cc === 'TR';

  // Explicit non-TR country_code must not be rewritten as TR (no country expansion).
  if (ccProvided && !ccIsTr) {
    return { ok: false };
  }

  if (candidate.startsWith('+')) {
    // keep as-is for E.164 check (still must be +905…)
  } else if (ccIsTr) {
    const national = candidate.replace(/^0/, '');
    if (!TR_MOBILE_NATIONAL.test(national)) {
      return { ok: false };
    }
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

  if (!TR_MOBILE_E164.test(candidate)) {
    return { ok: false };
  }
  // National part after +90 must be mobile 5XXXXXXXXX
  const national = candidate.slice(3);
  if (!TR_MOBILE_NATIONAL.test(national)) {
    return { ok: false };
  }
  return { ok: true, e164: candidate };
}
