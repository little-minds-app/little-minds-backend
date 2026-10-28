/**
 * Server-owned privacy notice catalog (ADR-020 KVKK Option A).
 *
 * ENGINEERING PLACEHOLDER — not a published legal aydınlatma text.
 * Production personal-data processing requires qualified legal review and an
 * explicitly published notice version/locale pair. See
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
 * Active pair for V1 OTP start binding. `published: false` until legal sign-off.
 * Clients must still send this exact pair for catalog match (Option A).
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

export function isActivePrivacyNoticePair(
  version: string,
  locale: string,
): boolean {
  return (
    version === ACTIVE_PRIVACY_NOTICE_VERSION &&
    locale === ACTIVE_PRIVACY_NOTICE_LOCALE
  );
}

export function isPrivacyNoticeLegallyPublished(): boolean {
  return ENGINEERING_PRIVACY_NOTICE_CATALOG.some((e) => e.published);
}
