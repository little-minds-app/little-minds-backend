/**
 * Server-owned privacy notice catalog (ADR-020 KVKK Option A).
 *
 * ENGINEERING PLACEHOLDER — not a published legal aydınlatma text.
 * Staging/production boot is fail-closed until at least one catalog entry is
 * `published: true` after qualified legal review. Acceptance of a start pair
 * requires **that exact** entry to be published in real-user envs — another
 * published entry does not authorize an unpublished pair. See
 * `docs/privacy-notice-catalog.md`.
 */

export type PrivacyNoticeCatalogEntry = {
  version: string;
  locale: string;
  /** false until counsel publishes / activates this pair. */
  published: boolean;
  /** Engineering-only label — never treat as legal copy. */
  engineeringLabel: string;
};

/**
 * Active engineering pair for V1 OTP start binding in local/CI.
 * `published: false` until legal sign-off. Clients must send an exact
 * catalog-matching pair (Option A).
 */
export const ENGINEERING_PRIVACY_NOTICE_CATALOG: readonly PrivacyNoticeCatalogEntry[] =
  [
    {
      version: 'v1-tr-2026-10',
      locale: 'tr-TR',
      published: false,
      engineeringLabel:
        'placeholder-tr-otp-start — replace after qualified legal review',
    },
  ] as const;

export const ACTIVE_PRIVACY_NOTICE_VERSION =
  ENGINEERING_PRIVACY_NOTICE_CATALOG[0].version;
export const ACTIVE_PRIVACY_NOTICE_LOCALE =
  ENGINEERING_PRIVACY_NOTICE_CATALOG[0].locale;

/** Unpublished synthetic catalog fixtures — local/CI only (not staging/prod). */
export function allowsUnpublishedPrivacyNoticeFixtures(
  appEnv: string,
): boolean {
  return appEnv !== 'staging' && appEnv !== 'production';
}

export function findPrivacyNoticeEntry(
  version: string,
  locale: string,
  catalog: readonly PrivacyNoticeCatalogEntry[] = ENGINEERING_PRIVACY_NOTICE_CATALOG,
): PrivacyNoticeCatalogEntry | undefined {
  return catalog.find((e) => e.version === version && e.locale === locale);
}

/**
 * Option A acceptance:
 * - Exact version+locale must exist in the server catalog (anti-enum).
 * - Local/CI: unpublished engineering fixtures allowed.
 * - Staging/production: **that** entry must be `published: true`
 *   (another published entry does not authorize an unpublished pair).
 */
export function isAcceptablePrivacyNoticePair(
  version: string,
  locale: string,
  appEnv: string,
  catalog: readonly PrivacyNoticeCatalogEntry[] = ENGINEERING_PRIVACY_NOTICE_CATALOG,
): boolean {
  const entry = findPrivacyNoticeEntry(version, locale, catalog);
  if (!entry) {
    return false;
  }
  if (allowsUnpublishedPrivacyNoticeFixtures(appEnv)) {
    return true;
  }
  return entry.published === true;
}

/** @deprecated Prefer isAcceptablePrivacyNoticePair(appEnv) for env-aware gates. */
export function isActivePrivacyNoticePair(
  version: string,
  locale: string,
): boolean {
  return (
    version === ACTIVE_PRIVACY_NOTICE_VERSION &&
    locale === ACTIVE_PRIVACY_NOTICE_LOCALE
  );
}

/** True if any catalog entry is published (staging/prod boot prerequisite). */
export function isPrivacyNoticeLegallyPublished(
  catalog: readonly PrivacyNoticeCatalogEntry[] = ENGINEERING_PRIVACY_NOTICE_CATALOG,
): boolean {
  return catalog.some((e) => e.published);
}
