import type { Request } from 'express';
import { requestLooksProxied } from './dev-auth.controller';

function reqWith(headers: Record<string, string>): Request {
  return { headers } as unknown as Request;
}

describe('requestLooksProxied (bootstrap reverse-proxy gate)', () => {
  it('is false for plain loopback clients with no forwarding headers', () => {
    expect(requestLooksProxied(reqWith({}))).toBe(false);
    expect(requestLooksProxied(reqWith({ 'user-agent': 'jest' }))).toBe(false);
  });

  it('detects common reverse-proxy / ingress forwarding headers', () => {
    expect(
      requestLooksProxied(reqWith({ 'x-forwarded-for': '203.0.113.9' })),
    ).toBe(true);
    expect(requestLooksProxied(reqWith({ 'x-real-ip': '198.51.100.7' }))).toBe(
      true,
    );
    expect(
      requestLooksProxied(
        reqWith({ forwarded: 'for=203.0.113.9;proto=https' }),
      ),
    ).toBe(true);
    expect(
      requestLooksProxied(reqWith({ 'x-forwarded-host': 'api.example.invalid' })),
    ).toBe(true);
    expect(requestLooksProxied(reqWith({ 'x-forwarded-proto': 'https' }))).toBe(
      true,
    );
  });
});
