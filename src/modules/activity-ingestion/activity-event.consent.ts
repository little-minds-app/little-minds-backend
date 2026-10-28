import {
  ESSENTIAL_CONSENT_SCOPES,
  OPTIONAL_CONSENT_SCOPES,
  type ConsentScope,
  type ServerConsentRecord,
} from './activity-contract.types';

/**
 * Consent gating helpers (Blueprint §29 / §38.2–38.3).
 *
 * IMPORTANT: a client `decision: "granted"` field is NOT authorization.
 * Server-side consent records (or sync-scope grants) are authoritative.
 */

export function isEssentialConsentScope(scope: ConsentScope): boolean {
  return (ESSENTIAL_CONSENT_SCOPES as readonly string[]).includes(scope);
}

export function isOptionalConsentScope(scope: ConsentScope): boolean {
  return (OPTIONAL_CONSENT_SCOPES as readonly string[]).includes(scope);
}

/**
 * Authorize a declared event/session consent_scope against server records.
 * Client-declared decision is ignored on purpose.
 */
export function isConsentScopeAuthorized(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: { clientDecision?: string },
): boolean {
  // Explicitly ignore clientDecision — never treat it as authorization.
  void options?.clientDecision;

  const matching = serverRecords.filter(
    (row) => row.consent_scope === consentScope || row.purpose === consentScope,
  );

  if (matching.length === 0) {
    // Optional scopes without a server grant are rejected.
    // Essential scopes still require an explicit server record (fail closed).
    return false;
  }

  return matching.some((row) => row.status === 'granted');
}

/**
 * Withdrawal / denial blocks upload for that purpose (and queued uploads later).
 */
export function isConsentScopeBlocked(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
): boolean {
  const matching = serverRecords.filter(
    (row) => row.consent_scope === consentScope || row.purpose === consentScope,
  );
  if (matching.length === 0) {
    return true;
  }
  return matching.every(
    (row) => row.status === 'denied' || row.status === 'withdrawn',
  );
}
