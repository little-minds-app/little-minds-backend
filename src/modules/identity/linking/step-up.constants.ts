/** LMP-36 P1 — server-issued recent-auth / step-up for identity linking. */

export const STEP_UP_PURPOSE_IDENTITY_LINK = 'identity_link' as const;

/** Short TTL — access-token refresh alone does not re-issue step-up. */
export const STEP_UP_TTL_SECONDS = 300;

/** Issue rate limits (best-effort single-node + durable IP counters optional). */
export const RATE_LIMIT_STEP_UP_PER_IP = 10;
export const RATE_LIMIT_STEP_UP_PER_PARENT = 10;
