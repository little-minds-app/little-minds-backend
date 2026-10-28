import {
  ACTIVE_PRIVACY_NOTICE_LOCALE,
  ACTIVE_PRIVACY_NOTICE_VERSION,
  ENGINEERING_PRIVACY_NOTICE_CATALOG,
  isActivePrivacyNoticePair,
  isPrivacyNoticeLegallyPublished,
} from './privacy-notice.catalog';

describe('privacy notice catalog (LMP-34 / Option A)', () => {
  it('exposes a server-owned engineering placeholder pair', () => {
    expect(ACTIVE_PRIVACY_NOTICE_VERSION).toBe('v1-tr-2026-10');
    expect(ACTIVE_PRIVACY_NOTICE_LOCALE).toBe('tr-TR');
    expect(ENGINEERING_PRIVACY_NOTICE_CATALOG).toHaveLength(1);
    expect(ENGINEERING_PRIVACY_NOTICE_CATALOG[0].published).toBe(false);
  });

  it('matches only the active pair (anti-enum / uniform reject otherwise)', () => {
    expect(
      isActivePrivacyNoticePair(
        ACTIVE_PRIVACY_NOTICE_VERSION,
        ACTIVE_PRIVACY_NOTICE_LOCALE,
      ),
    ).toBe(true);
    expect(isActivePrivacyNoticePair('wrong', ACTIVE_PRIVACY_NOTICE_LOCALE)).toBe(
      false,
    );
    expect(isActivePrivacyNoticePair(ACTIVE_PRIVACY_NOTICE_VERSION, 'en-US')).toBe(
      false,
    );
  });

  it('reports not legally published until counsel flips published', () => {
    expect(isPrivacyNoticeLegallyPublished()).toBe(false);
  });
});
