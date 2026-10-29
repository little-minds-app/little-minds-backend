import { emailSubjectKey, normalizeEmailV1 } from './email-norm';

describe('email_norm_v1 (ADR-021 §6)', () => {
  it('preserves local-part case and lowercases domain', () => {
    const r = normalizeEmailV1('  User@Example.COM ');
    expect(r).toEqual({ ok: true, canonical: 'User@example.com' });
  });

  it('preserves plus tags as distinct', () => {
    const a = normalizeEmailV1('user+tag@example.com');
    const b = normalizeEmailV1('user@example.com');
    expect(a).toEqual({ ok: true, canonical: 'user+tag@example.com' });
    expect(b).toEqual({ ok: true, canonical: 'user@example.com' });
    expect(a.ok && b.ok && a.canonical !== b.canonical).toBe(true);
  });

  it('does not strip Gmail dots', () => {
    const r = normalizeEmailV1('u.s.er@gmail.com');
    expect(r).toEqual({ ok: true, canonical: 'u.s.er@gmail.com' });
  });

  it('treats case-different local-parts as distinct', () => {
    const a = normalizeEmailV1('User@example.com');
    const b = normalizeEmailV1('user@example.com');
    expect(a).toEqual({ ok: true, canonical: 'User@example.com' });
    expect(b).toEqual({ ok: true, canonical: 'user@example.com' });
    const pepper = 'test-email-subject-pepper-32ch!!';
    expect(emailSubjectKey((a as { canonical: string }).canonical, pepper)).not.toBe(
      emailSubjectKey((b as { canonical: string }).canonical, pepper),
    );
  });

  it('rejects Unicode local-part', () => {
    const r = normalizeEmailV1('üser@example.com');
    expect(r.ok).toBe(false);
  });

  it('IDNA-encodes internationalized domain (UTS #46)', () => {
    const r = normalizeEmailV1('user@bücher.de');
    expect(r).toEqual({ ok: true, canonical: 'user@xn--bcher-kva.de' });
  });

  it('rejects empty / invalid / too long', () => {
    expect(normalizeEmailV1('').ok).toBe(false);
    expect(normalizeEmailV1('not-an-email').ok).toBe(false);
    expect(normalizeEmailV1('a@').ok).toBe(false);
    expect(normalizeEmailV1(null).ok).toBe(false);
    const longLocal = `${'a'.repeat(320)}@x.co`;
    expect(normalizeEmailV1(longLocal).ok).toBe(false);
  });

  it('HMAC subject uses email_norm_v1| prefix', () => {
    const pepper = 'test-email-subject-pepper-32ch!!';
    const key = emailSubjectKey('User@example.com', pepper);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    // Different pepper → different key
    expect(key).not.toBe(emailSubjectKey('User@example.com', pepper + 'x'));
  });
});
