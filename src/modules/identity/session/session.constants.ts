/** ADR-019 session + token constants (LMP-33). */
export const ACCESS_TOKEN_TTL_SECONDS = 900;
export const SESSION_ABSOLUTE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const MAX_ACTIVE_SESSIONS_PER_PARENT = 20;
export const REFRESH_HASH_HISTORY_MAX = 8;
export const REFRESH_TOKEN_PREFIX = 'lmr1.';
export const JWT_ALG = 'EdDSA' as const;
export const DEFAULT_JWT_ISSUER = 'little-minds-backend';
export const DEFAULT_JWT_AUDIENCE = 'little-minds-parent';
export const JWT_CLOCK_SKEW_SECONDS = 60;

export const RATE_LIMIT_REFRESH_PER_IP = 30;
export const RATE_LIMIT_REFRESH_PER_SESSION = 10;
export const RATE_LIMIT_BOOTSTRAP_PER_IP = 5;
export const RATE_LIMIT_WINDOW_MS = 60_000;
