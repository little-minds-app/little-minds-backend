/** LMP-35 / ADR-021 multi-provider constants. */

export const APPLE_PROVIDER = 'apple' as const;
export const GOOGLE_PROVIDER = 'google' as const;
export const EMAIL_PROVIDER = 'email' as const;

/** Server-issued OIDC nonce TTL (ADR-021 §4.3). */
export const OIDC_NONCE_TTL_SECONDS = 600;

/** Email OTP (ADR-021 §7) — distinct from phone OTP TTL. */
export const EMAIL_OTP_TTL_SECONDS = 600;
export const EMAIL_OTP_RESEND_COOLDOWN_SECONDS = 60;
export const EMAIL_OTP_MAX_WRONG_ATTEMPTS = 5;

/** Email sends / subject / 15 min */
export const EMAIL_PER_SUBJECT_15M = 3;
/** Email sends / subject / 24 h */
export const EMAIL_PER_SUBJECT_24H = 10;
/** Email sends / IP / 15 min */
export const EMAIL_PER_IP_15M = 10;
/** Email sends / IP / 24 h */
export const EMAIL_PER_IP_24H = 40;
/** Verify requests / IP / min (shared with phone verify window type) */
export const EMAIL_VERIFY_PER_IP_PER_MIN = 10;
/**
 * Global email / day planning ceiling — unactivated; not production enablement.
 * Counter still enforced so local/CI exercises the gate.
 */
export const EMAIL_GLOBAL_PER_DAY = 2000;

export const MAIL_ADAPTER_FAKE = 'fake' as const;
export const MAIL_ADAPTER_PRODUCTION = 'production' as const;

/** Apple / Google claim clock skew (±60 s). */
export const OIDC_CLOCK_SKEW_SECONDS = 60;
/** Max ID-token age from iat (10 min). */
export const OIDC_MAX_TOKEN_AGE_SECONDS = 600;

export const DEFAULT_APPLE_ISSUER = 'https://appleid.apple.com';
export const DEFAULT_APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
export const DEFAULT_GOOGLE_ISSUERS = [
  'https://accounts.google.com',
  'accounts.google.com',
] as const;
export const DEFAULT_GOOGLE_JWKS_URL =
  'https://www.googleapis.com/oauth2/v3/certs';
export const DEFAULT_GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
