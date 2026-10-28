import { normalizeTrMobileE164 } from './phone-normalize';

describe('normalizeTrMobileE164 (LMP-34)', () => {
  it('accepts E.164 TR mobile', () => {
    expect(normalizeTrMobileE164('+905551112233')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
  });

  it('accepts national 05… and 5… forms', () => {
    expect(normalizeTrMobileE164('05551112233')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
    expect(normalizeTrMobileE164('5551112233')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
  });

  it('accepts country_code + national', () => {
    expect(normalizeTrMobileE164('5551112233', '+90')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
  });

  it('rejects non-TR and landline-shaped numbers', () => {
    expect(normalizeTrMobileE164('+14445556666').ok).toBe(false);
    expect(normalizeTrMobileE164('+902121112233').ok).toBe(false);
    expect(normalizeTrMobileE164('not-a-phone').ok).toBe(false);
  });
});
