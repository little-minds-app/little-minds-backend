import type { Request } from 'express';

/** Best-effort client IP for single-node rate limits (ADR-019). */
export function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || '127.0.0.1';
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || '127.0.0.1';
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

export function isLoopbackIp(ip: string): boolean {
  const normalized = ip.replace(/^::ffff:/, '').toLowerCase();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === 'localhost' ||
    normalized === '::ffff:127.0.0.1'
  );
}
