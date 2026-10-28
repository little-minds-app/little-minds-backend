import {
  generateOtpCode,
  hashOtpCode,
  phoneSubjectKey,
  verifyOtpCode,
} from './otp-crypto';

describe('otp-crypto (LMP-34)', () => {
  const otpPepper = 'test-otp-pepper-32chars-minimum!!';
  const phonePepper = 'test-phone-subject-pepper-32ch!!';

  it('generates 6-digit numeric codes', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateOtpCode()).toMatch(/^\d{6}$/);
    }
  });

  it('hashes subject from E.164 with phone pepper', () => {
    const a = phoneSubjectKey('+905551112233', phonePepper);
    const b = phoneSubjectKey('+905551112233', phonePepper);
    const c = phoneSubjectKey('+905551112234', phonePepper);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('binds code hash to challenge + subject (anti cross-challenge replay)', () => {
    const hash = hashOtpCode(otpPepper, 'c1', 'subj', '123456');
    expect(verifyOtpCode(otpPepper, 'c1', 'subj', '123456', hash)).toBe(true);
    expect(verifyOtpCode(otpPepper, 'c2', 'subj', '123456', hash)).toBe(false);
    expect(verifyOtpCode(otpPepper, 'c1', 'other', '123456', hash)).toBe(false);
    expect(verifyOtpCode(otpPepper, 'c1', 'subj', '000000', hash)).toBe(false);
  });
});
