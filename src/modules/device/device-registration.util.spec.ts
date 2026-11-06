import { scopedDeviceId } from '../identity/session/session-issuer.service';
import { resolveDatabaseDeviceId } from './device-registration.util';

describe('resolveDatabaseDeviceId (issue #28)', () => {
  const installation = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const parentA = '11111111-1111-4111-8111-111111111111';
  const parentB = '22222222-2222-4222-8222-222222222222';

  it('uses legacy row id when installation matches owned legacy device', () => {
    expect(resolveDatabaseDeviceId(installation, parentA, parentA)).toBe(
      installation,
    );
  });

  it('derives scoped id for new parent/installation pairs', () => {
    expect(resolveDatabaseDeviceId(installation, parentA, parentB)).toBe(
      scopedDeviceId(installation, parentA),
    );
    expect(resolveDatabaseDeviceId(installation, parentA, undefined)).toBe(
      scopedDeviceId(installation, parentA),
    );
  });
});
