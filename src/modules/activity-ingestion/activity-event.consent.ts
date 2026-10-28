import {
  ESSENTIAL_CONSENT_SCOPES,
  OPTIONAL_CONSENT_SCOPES,
  type ActivitySessionV1,
  type ActivityValidationIssue,
  type ConsentDecision,
  type ConsentScope,
  type ServerConsentRecord,
} from './activity-contract.types';

/**
 * Consent gating helpers (Blueprint §29 / §38.2–38.3).
 *
 * HARD RULE: a client `decision: "granted"` field is NEVER authorization.
 * Only server-attested consent records (or sync-scope grants) authorize.
 */

/** Sources that are allowed to authorize a consent_scope. */
export const SERVER_CONSENT_AUTHORITATIVE_SOURCES = [
  'server_consent_store',
  'sync_scope_grant',
] as const;

export type ServerConsentAuthoritativeSource =
  (typeof SERVER_CONSENT_AUTHORITATIVE_SOURCES)[number];

export function isEssentialConsentScope(scope: ConsentScope): boolean {
  return (ESSENTIAL_CONSENT_SCOPES as readonly string[]).includes(scope);
}

export function isOptionalConsentScope(scope: ConsentScope): boolean {
  return (OPTIONAL_CONSENT_SCOPES as readonly string[]).includes(scope);
}

function isAuthoritativeSource(
  source: string | undefined,
): source is ServerConsentAuthoritativeSource {
  return (
    !!source &&
    (SERVER_CONSENT_AUTHORITATIVE_SOURCES as readonly string[]).includes(source)
  );
}

function authoritativeGrantedRecords(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
): ServerConsentRecord[] {
  return serverRecords.filter(
    (row) =>
      isAuthoritativeSource(row.source) &&
      row.status === 'granted' &&
      (row.consent_scope === consentScope || row.purpose === consentScope),
  );
}

export type ConsentAuthorizationOptions = {
  /**
   * Client UX decision from the wire document.
   * Accepted solely so call sites can pass it without mistaking it for a grant.
   * It is discarded and must never flip authorization to true.
   */
  clientDeclaredDecision?: ConsentDecision | string | null;
};

/**
 * Authorize a declared event/session consent_scope against server records.
 * Client-declared decision is ignored on purpose — including `"granted"`.
 */
export function isConsentScopeAuthorized(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions,
): boolean {
  // Poison pill: even if callers pass decision:"granted", it cannot authorize.
  void options?.clientDeclaredDecision;

  return authoritativeGrantedRecords(consentScope, serverRecords).length > 0;
}

/**
 * Withdrawal / denial / missing server grant blocks upload for that purpose.
 * Client decision is irrelevant.
 */
export function isConsentScopeBlocked(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions,
): boolean {
  void options?.clientDeclaredDecision;

  if (authoritativeGrantedRecords(consentScope, serverRecords).length > 0) {
    return false;
  }
  return true;
}

/**
 * Validation hook: produce issues when a scope is not server-authorized.
 * Always ignores clientDeclaredDecision (including `"granted"`).
 */
export function collectConsentAuthorizationIssues(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions & { path?: string },
): ActivityValidationIssue[] {
  const path = options?.path ?? 'consent_scope';
  const clientDecision = options?.clientDeclaredDecision;

  if (
    isConsentScopeBlocked(consentScope, serverRecords, {
      clientDeclaredDecision: clientDecision,
    }) ||
    !isConsentScopeAuthorized(consentScope, serverRecords, {
      clientDeclaredDecision: clientDecision,
    })
  ) {
    return [
      {
        code: 'consent.unauthorized_scope',
        path,
        message:
          'consent_scope is not authorized by server-attested records (client decision is not authorization)',
      },
    ];
  }
  return [];
}

/**
 * Session wire `consent.decision` is UX evidence only.
 * Authorization requires matching server records for consent_scope.
 */
export function collectSessionConsentAuthorizationIssues(
  session: Pick<ActivitySessionV1, 'consent'>,
  serverRecords: readonly ServerConsentRecord[],
): ActivityValidationIssue[] {
  return collectConsentAuthorizationIssues(
    session.consent.consent_scope,
    serverRecords,
    {
      // Explicitly pass the client decision to prove it cannot authorize.
      clientDeclaredDecision: session.consent.decision,
      path: 'consent.consent_scope',
    },
  );
}

/**
 * Reject attempts to treat a client decision object as a server consent record.
 * Schemas-only guardrail for future ingest wiring.
 */
export function isClientDecisionMasqueradingAsServerRecord(
  candidate: unknown,
): boolean {
  if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return false;
  }
  const row = candidate as Record<string, unknown>;
  const source = row.source;
  if (source === 'client_decision' || source === 'wire_consent' || source === 'offline_claim') {
    return true;
  }
  // Missing authoritative source while claiming granted status from a decision field.
  if (
    row.decision === 'granted' &&
    !isAuthoritativeSource(
      typeof source === 'string' ? source : undefined,
    )
  ) {
    return true;
  }
  return false;
}
