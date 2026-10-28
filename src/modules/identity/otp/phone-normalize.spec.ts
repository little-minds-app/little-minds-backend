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
    expect(normalizeTrMobileE164('05551112233', 'TR')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
  });

  it('accepts spaced / dashed TR mobile (anti-enum: still ok or uniform fail)', () => {
    expect(normalizeTrMobileE164('+90 555 111 22 33')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
    expect(normalizeTrMobileE164('0555-111-22-33')).toEqual({
      ok: true,
      e164: '+905551112233',
    });
  });

  it('rejects non-TR, landline-shaped, and garbage uniformly', () => {
    const rejects = [
      '+14445556666',
      '+902121112233',
      '+903121112233',
      '+904121112233',
      '+90555111',
      '+90555111223399',
      'not-a-phone',
      '',
      '+4407700123456',
    ];
    for (const phone of rejects) {
      expect(normalizeTrMobileE164(phone)).toEqual({ ok: false });
    }
  });

  it('does not expand to other countries via country_code', () => {
    expect(normalizeTrMobileE164('5551112233', '+1').ok).toBe(false);
    expect(normalizeTrMobileE164('5551112233', 'US').ok).toBe(false);
  });
});
