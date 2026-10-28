import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
  ENGINEERING_PRIVACY_NOTICE_CATALOG,
  allowsUnpublishedPrivacyNoticeFixtures,
  isAcceptablePrivacyNoticePair,
  isActivePrivacyNoticePair,
  isPrivacyNoticeLegallyPublished,
  type PrivacyNoticeCatalogEntry,
} from './privacy-notice.catalog';

/** Multi-entry fixture: unpublished "active" + unrelated published entry. */
const MIXED_PUBLICATION_CATALOG: readonly PrivacyNoticeCatalogEntry[] = [
  {
    version: 'v1-tr-2026-10',
    locale: 'tr-TR',
    published: false,
    engineeringLabel: 'unpublished-active-fixture',
  },
  {
    version: 'v9-other-published',
    locale: 'en-US',
    published: true,
    engineeringLabel: 'unrelated-published-entry',
  },
] as const;

describe('privacy notice catalog (LMP-34 / Option A)', () => {
  it('exposes a server-owned engineering placeholder pair', () => {
    expect(ACTIVE_PRIVACY_NOTICE_VERSION).toBe('v1-tr-2026-10');
    expect(ACTIVE_PRIVACY_NOTICE_LOCALE).toBe('tr-TR');
    expect(ENGINEERING_PRIVACY_NOTICE_CATALOG).toHaveLength(1);
    expect(ENGINEERING_PRIVACY_NOTICE_CATALOG[0].published).toBe(false);
  });

  it('matches only catalog pairs (anti-enum / uniform reject otherwise)', () => {
    expect(
      isActivePrivacyNoticePair(
        ACTIVE_PRIVACY_NOTICE_VERSION,
        ACTIVE_PRIVACY_NOTICE_LOCALE,
      ),
    ).toBe(true);
    expect(
      isAcceptablePrivacyNoticePair(
        ACTIVE_PRIVACY_NOTICE_VERSION,
        ACTIVE_PRIVACY_NOTICE_LOCALE,
        'development',
      ),
    ).toBe(true);
    expect(
      isAcceptablePrivacyNoticePair('wrong', ACTIVE_PRIVACY_NOTICE_LOCALE, 'development'),
    ).toBe(false);
    expect(
      isAcceptablePrivacyNoticePair(
        ACTIVE_PRIVACY_NOTICE_VERSION,
        'en-US',
        'development',
      ),
    ).toBe(false);
  });

  it('reports not legally published until counsel flips published', () => {
    expect(isPrivacyNoticeLegallyPublished()).toBe(false);
  });

  it('allows unpublished fixtures only outside staging/production', () => {
    expect(allowsUnpublishedPrivacyNoticeFixtures('development')).toBe(true);
    expect(allowsUnpublishedPrivacyNoticeFixtures('test')).toBe(true);
    expect(allowsUnpublishedPrivacyNoticeFixtures('staging')).toBe(false);
    expect(allowsUnpublishedPrivacyNoticeFixtures('production')).toBe(false);
  });

  it('local/CI may accept unpublished engineering fixtures', () => {
    expect(
      isAcceptablePrivacyNoticePair(
        'v1-tr-2026-10',
        'tr-TR',
        'development',
        MIXED_PUBLICATION_CATALOG,
      ),
    ).toBe(true);
  });

  it('staging/prod reject unpublished active even when another entry is published', () => {
    // Boot may see "some published entry" — that must NOT authorize this pair.
    expect(isPrivacyNoticeLegallyPublished(MIXED_PUBLICATION_CATALOG)).toBe(true);

    expect(
      isAcceptablePrivacyNoticePair(
        'v1-tr-2026-10',
        'tr-TR',
        'staging',
        MIXED_PUBLICATION_CATALOG,
      ),
    ).toBe(false);
    expect(
      isAcceptablePrivacyNoticePair(
        'v1-tr-2026-10',
        'tr-TR',
        'production',
        MIXED_PUBLICATION_CATALOG,
      ),
    ).toBe(false);
  });

  it('staging/prod accept only the exact published entry requested', () => {
    expect(
      isAcceptablePrivacyNoticePair(
        'v9-other-published',
        'en-US',
        'staging',
        MIXED_PUBLICATION_CATALOG,
      ),
    ).toBe(true);
    expect(
      isAcceptablePrivacyNoticePair(
        'v9-other-published',
        'en-US',
        'production',
        MIXED_PUBLICATION_CATALOG,
      ),
    ).toBe(true);
    // Wrong locale for the published version — still reject (anti-enum).
    expect(
      isAcceptablePrivacyNoticePair(
        'v9-other-published',
        'tr-TR',
        'staging',
        MIXED_PUBLICATION_CATALOG,
      ),
    ).toBe(false);
  });

  it('unknown pairs are rejected uniformly in all envs', () => {
    for (const appEnv of ['development', 'staging', 'production'] as const) {
      expect(
        isAcceptablePrivacyNoticePair(
          'not-in-catalog',
          'tr-TR',
          appEnv,
          MIXED_PUBLICATION_CATALOG,
        ),
      ).toBe(false);
    }
  });
});
