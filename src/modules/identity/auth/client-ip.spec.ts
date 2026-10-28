import type { Request } from 'express';
import { clientIp, isLoopbackIp, transportPeerIp } from './client-ip';

function fakeReq(partial: {
  remoteAddress?: string;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}): Request {
  return {
    ip: partial.ip,
    headers: partial.headers ?? {},
    socket: { remoteAddress: partial.remoteAddress },
  } as unknown as Request;
}

describe('clientIp / transportPeerIp (LMP-33 QA)', () => {
  it('uses socket peer and ignores forged X-Forwarded-For', () => {
    const req = fakeReq({
      remoteAddress: '203.0.113.50',
      ip: '127.0.0.1',
      headers: { 'x-forwarded-for': '127.0.0.1, 10.0.0.1' },
    });
    expect(clientIp(req)).toBe('203.0.113.50');
    expect(isLoopbackIp(clientIp(req))).toBe(false);
  });

  it('ignores XFF proxy chains claiming loopback', () => {
    const req = fakeReq({
      remoteAddress: '198.51.100.9',
      headers: { 'x-forwarded-for': ['::1', '127.0.0.1'] },
    });
    expect(transportPeerIp(req)).toBe('198.51.100.9');
  });

  it('recognizes IPv4-mapped IPv6 loopback peers', () => {
    expect(isLoopbackIp('::ffff:127.0.0.1')).toBe(true);
    expect(isLoopbackIp('::1')).toBe(true);
    expect(isLoopbackIp('127.0.0.1')).toBe(true);
  });

  it('fails closed to non-loopback when peer is missing', () => {
    const req = fakeReq({
      headers: { 'x-forwarded-for': '127.0.0.1' },
    });
    expect(clientIp(req)).toBe('0.0.0.0');
    expect(isLoopbackIp(clientIp(req))).toBe(false);
  });
});
