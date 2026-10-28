import { isUuidV4OrV7 } from './otp-uuid';

describe('isUuidV4OrV7', () => {
  it('accepts v4/v7 shaped UUIDs', () => {
    expect(isUuidV4OrV7('11111111-1111-4111-8111-111111111111')).toBe(true);
    expect(isUuidV4OrV7('018f3c2a-7b3e-7000-8000-000000000001')).toBe(true);
  });

  it('rejects malformed ids', () => {
    expect(isUuidV4OrV7('not-a-uuid')).toBe(false);
    expect(isUuidV4OrV7('11111111-1111-4111-8111-11111111111')).toBe(false);
    expect(isUuidV4OrV7("'; DROP TABLE otp_challenges; --")).toBe(false);
    expect(isUuidV4OrV7('')).toBe(false);
  });
});
