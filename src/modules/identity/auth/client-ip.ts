import type { Request } from 'express';

/**
 * Transport-peer IP for security decisions (ADR-019 / LMP-33 QA).
 *
 * Never trusts `X-Forwarded-For` or other client-controlled forwarding headers.
 * Spoofed XFF must not weaken bootstrap loopback gates or rate-limit buckets.
 * Fail closed to a non-loopback sentinel when the peer address is unavailable.
 *
 * Explicit reverse-proxy trust is out of V1 scope — enable only after a reviewed
 * Nest `trust proxy` + hop-count design; do not read XFF here until then.
 */
export function clientIp(req: Request): string {
  return transportPeerIp(req);
}

/** Raw TCP/Unix peer address only — ignores Express `req.ip` (can honor XFF when trust proxy is on). */
export function transportPeerIp(req: Request): string {
  const peer = req.socket?.remoteAddress;
  if (typeof peer === 'string' && peer.length > 0) {
    return peer;
  }
  return '0.0.0.0';
}

export function isLoopbackIp(ip: string): boolean {
  const normalized = ip.replace(/^::ffff:/i, '').toLowerCase();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === 'localhost'
  );
}
