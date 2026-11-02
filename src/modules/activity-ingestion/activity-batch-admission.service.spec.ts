import { BadRequestException } from '@nestjs/common';
import {
  ActivityBatchAdmissionService,
  canonicalJson,
  eventFingerprint,
} from './activity-batch-admission.service';
import type { ActivityEventV1 } from './activity-contract.types';

describe('LMP-51 batch admission safety boundary', () => {
  const admission = new ActivityBatchAdmissionService();
  it('rejects malformed, empty and oversized batch envelopes', () => {
    for (const input of [
      null,
      [],
      {},
      { sessions: [], events: [] },
      { sessions: [], events: [], parent_id: 'forbidden' },
      { sessions: [], events: Array.from({ length: 51 }, () => ({})) },
    ]) {
      expect(() => admission.validate(input)).toThrow(BadRequestException);
    }
  });

  it('normalizes object key ordering without changing array ordering', () => {
    expect(canonicalJson({ z: 1, a: { y: 2, x: 3 }, values: [3, 1] }))
      .toBe(canonicalJson({ values: [3, 1], a: { x: 3, y: 2 }, z: 1 }));
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it('detects changed replay content with a distinct fingerprint', () => {
    const wire = {
      schema_version: '1.0.0',
      event_id: 'f8b21969-c48e-4b99-83bf-8b5f8b380a44',
      event_type: 'mentor_card_opened',
      payload: { value: 1 },
    } as unknown as ActivityEventV1;
    expect(eventFingerprint(wire)).toBe(eventFingerprint({ ...wire }));
    expect(eventFingerprint(wire))
      .not.toBe(eventFingerprint({ ...wire, payload: { value: 2 } }));
    expect(eventFingerprint(wire)).toMatch(/^[a-f0-9]{64}$/);
  });
});
