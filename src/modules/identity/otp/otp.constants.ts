/** LMP-34 / ADR-020 accepted numerical limits and OTP constants. */

export const PHONE_PROVIDER = 'phone' as const;

export const OTP_TTL_SECONDS = 300;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_WRONG_ATTEMPTS = 5;

/** SMS / phone / 15 min */
export const SMS_PER_SUBJECT_15M = 3;
/** SMS / phone / 24 h */
export const SMS_PER_SUBJECT_24H = 10;
/** SMS / IP / 15 min */
export const SMS_PER_IP_15M = 5;
/** SMS / IP / 24 h */
export const SMS_PER_IP_24H = 30;
/** Verify requests / IP / min */
export const VERIFY_PER_IP_PER_MIN = 10;
/** Global production SMS / day (planning ceiling — still not vendor enablement) */
export const SMS_GLOBAL_PER_DAY = 500;

export const WINDOW_15M_MS = 15 * 60 * 1000;
export const WINDOW_24H_MS = 24 * 60 * 60 * 1000;
export const WINDOW_1M_MS = 60 * 1000;

/** Challenge scrub/purge horizon (U16). */
export const CHALLENGE_RETENTION_MS = 24 * 60 * 60 * 1000;
/** Delivery attempt retention (U16). */
export const DELIVERY_ATTEMPT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
/** Abuse counter rows older than this are purged with retention. */
export const ABUSE_COUNTER_RETENTION_MS = 48 * 60 * 60 * 1000;

/** Retention tick interval (dev/test friendly; production still fail-closed SMS). */
export const OTP_RETENTION_INTERVAL_MS = 15 * 60 * 1000;

export {
  ACTIVE_PRIVACY_NOTICE_VERSION,
  ACTIVE_PRIVACY_NOTICE_LOCALE,
} from './privacy-notice.catalog';

export const SMS_ADAPTER_FAKE = 'fake' as const;
export const SMS_ADAPTER_PRODUCTION = 'production' as const;
