/** LMP-36 explicit account linking — rate limits and audit hash prefix. */

/** Link attempts / IP / minute (best-effort single-node). */
export const RATE_LIMIT_LINK_PER_IP = 10;
/** Link attempts / authenticated parent / minute. */
export const RATE_LIMIT_LINK_PER_PARENT = 10;

/** Prefix for provider_subject_hash in account_link_audits (never raw subject). */
export const LINK_AUDIT_SUBJECT_PREFIX = 'link_audit_v1|';

export const LINKABLE_PROVIDERS = [
  'apple',
  'google',
  'email',
  'phone',
] as const;

export type LinkableProvider = (typeof LINKABLE_PROVIDERS)[number];
