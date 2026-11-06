import { BadRequestException } from '@nestjs/common';
import { DeviceActiveChildService } from '../src/modules/device/device-active-child.service';

describe('DeviceActiveChildService.parseSetRequest (LMP-134 P1-02)', () => {
  const service = new DeviceActiveChildService({} as never);

  it('requires child_id and expected_binding_revision', () => {
    expect(() => service.parseSetRequest({})).toThrow(BadRequestException);
    expect(() =>
      service.parseSetRequest({ child_id: null }),
    ).toThrow(/expected_binding_revision/);
  });

  it('accepts null child_id with revision zero', () => {
    expect(
      service.parseSetRequest({
        child_id: null,
        expected_binding_revision: 0,
      }),
    ).toEqual({ child_id: null, expected_binding_revision: 0 });
  });

  it('rejects non-integer or negative revision', () => {
    expect(() =>
      service.parseSetRequest({
        child_id: '11111111-1111-4111-8111-111111111111',
        expected_binding_revision: 1.5,
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.parseSetRequest({
        child_id: null,
        expected_binding_revision: -1,
      }),
    ).toThrow(BadRequestException);
  });
});
