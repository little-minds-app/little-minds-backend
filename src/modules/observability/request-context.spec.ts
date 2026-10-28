import {
  getRequestId,
  resolveRequestId,
  runWithRequestContext,
} from './request-context';

describe('resolveRequestId', () => {
  it('mints a UUID when incoming header is missing', () => {
    const id = resolveRequestId(undefined);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('accepts a safe opaque client correlation id', () => {
    expect(resolveRequestId('client-corr-123')).toBe('client-corr-123');
  });

  it('rejects CR/LF injection and overlong values', () => {
    const injected = resolveRequestId('evil\nid');
    expect(injected).not.toContain('\n');
    expect(resolveRequestId('x'.repeat(200))).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-/i,
    );
  });
});

describe('runWithRequestContext', () => {
  it('exposes request_id inside the async scope', () => {
    runWithRequestContext({ requestId: 'req-scope-1' }, () => {
      expect(getRequestId()).toBe('req-scope-1');
    });
    expect(getRequestId()).toBeUndefined();
  });
});
