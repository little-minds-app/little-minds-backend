import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import {
  ActivityBatchAdmissionService,
  canonicalJson,
  eventFingerprint,
} from './activity-batch-admission.service';
import type { ActivityEventV1 } from './activity-contract.types';
import { noopStructuredLogger } from '../../../test/helpers/noop-structured-logger';
import { StructuredLogger } from '../observability/structured-logger';
import { RecentErrorsStore } from '../observability/recent-errors.store';

describe('LMP-51 batch admission safety boundary', () => {
  const admission = new ActivityBatchAdmissionService(noopStructuredLogger());
  it('logs bounded validation_issues through StructuredLogger on reject', () => {
    const config = {
      get: (key: string) => {
        if (key === 'APP_ENV') return 'development';
        if (key === 'RELEASE') return 'test-release';
        return undefined;
      },
    } as unknown as ConfigService<never, true>;
    const lines: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((line: string) => {
      lines.push(line);
    });
    const logger = new StructuredLogger(config, new RecentErrorsStore());
    const admissionWithLogger = new ActivityBatchAdmissionService(logger);
    const secretInPayload = 'super-secret-child-name-xyzzy';

    expect(() =>
      admissionWithLogger.validate({
        sessions: [
          {
            schema_version: '1.0.0',
            play_session_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            device_id: 'not-a-uuid',
            content_version_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            child_display_name: secretInPayload,
          },
        ],
        events: [],
      }),
    ).toThrow(BadRequestException);

    jest.restoreAllMocks();

    expect(lines.length).toBeGreaterThanOrEqual(1);
    const batchLine = lines.find((line) => line.includes('batch_admission_rejected'));
    expect(batchLine).toBeDefined();
    const parsed = JSON.parse(batchLine!) as Record<string, unknown>;
    const context = parsed.context as Record<string, unknown>;
    expect(context.batch_reject_code).toBe('batch.invalid_session');
    expect(typeof context.validation_issue_count).toBe('number');
    const issues = context.validation_issues as Array<Record<string, unknown>>;
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(Object.keys(issue).sort()).toEqual(['code', 'path']);
    }
    expect(JSON.stringify(parsed)).not.toContain(secretInPayload);
  });

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
