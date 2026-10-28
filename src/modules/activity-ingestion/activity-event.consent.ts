import {
  ESSENTIAL_CONSENT_SCOPES,
  OPTIONAL_CONSENT_SCOPES,
  type ActivitySessionV1,
  type ActivityValidationIssue,
  type ConsentAuthorizationDenialReason,
  type ConsentDecision,
  type ConsentScope,
  type ServerConsentRecord,
} from './activity-contract.types';

/**
 * Consent gating helpers (Blueprint §29 / §38.2–38.3).
 *
 * HARD RULES:
 * - Client `decision: "granted"` is NEVER authorization.
 * - Authorization uses **latest-effective** server-attested consent (not “any grant”).
 * - Withdrawal/denial that is newer than a grant wins.
 * - Ambiguous ordering, forged sources, or status conflicts → deny (fail closed).
 */

/** Sources that are allowed to authorize a consent_scope. */
export const SERVER_CONSENT_AUTHORITATIVE_SOURCES = [
  'server_consent_store',
  'sync_scope_grant',
] as const;

export type ServerConsentAuthoritativeSource =
  (typeof SERVER_CONSENT_AUTHORITATIVE_SOURCES)[number];

/** Higher rank wins ties at the same revision / effective_at. */
const SOURCE_PRECEDENCE: Record<ServerConsentAuthoritativeSource, number> = {
  server_consent_store: 2,
  sync_scope_grant: 1,
};

const UTC_Z_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,9})?Z$/;

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

function matchesScope(
  row: ServerConsentRecord,
  consentScope: ConsentScope,
): boolean {
  return row.consent_scope === consentScope || row.purpose === consentScope;
}

function isTrustworthyEffectiveAt(value: string | undefined): boolean {
  if (typeof value !== 'string' || !UTC_Z_PATTERN.test(value)) {
    return false;
  }
  return Number.isFinite(Date.parse(value));
}

export type ConsentAuthorizationOptions = {
  /**
   * Client UX decision from the wire document.
   * Accepted solely so call sites can pass it without mistaking it for a grant.
   * It is discarded and must never flip authorization to true.
   */
  clientDeclaredDecision?: ConsentDecision | string | null;
};

export type ConsentAuthorizationEvaluation = {
  authorized: boolean;
  reason?: ConsentAuthorizationDenialReason;
  /** Latest-effective record when selection succeeded without conflict. */
  effective?: ServerConsentRecord;
};

/**
 * Compare two authoritative records for latest-effective ordering.
 * Returns positive if `a` is newer/higher precedence than `b`.
 */
function compareLatestEffective(
  a: ServerConsentRecord,
  b: ServerConsentRecord,
  useRevision: boolean,
): number {
  if (useRevision) {
    const ra = a.revision as number;
    const rb = b.revision as number;
    if (ra !== rb) {
      return ra - rb;
    }
  }

  const ta = Date.parse(a.effective_at);
  const tb = Date.parse(b.effective_at);
  if (ta !== tb) {
    return ta - tb;
  }

  return (
    SOURCE_PRECEDENCE[a.source as ServerConsentAuthoritativeSource] -
    SOURCE_PRECEDENCE[b.source as ServerConsentAuthoritativeSource]
  );
}

function orderingKeyEqual(
  a: ServerConsentRecord,
  b: ServerConsentRecord,
  useRevision: boolean,
): boolean {
  if (useRevision && a.revision !== b.revision) {
    return false;
  }
  if (Date.parse(a.effective_at) !== Date.parse(b.effective_at)) {
    return false;
  }
  return (
    SOURCE_PRECEDENCE[a.source as ServerConsentAuthoritativeSource] ===
    SOURCE_PRECEDENCE[b.source as ServerConsentAuthoritativeSource]
  );
}

/**
 * Evaluate latest-effective consent for a scope against server records.
 * Fail closed on forged sources, missing ordering metadata, or conflicts.
 */
export function evaluateConsentScopeAuthorization(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions,
): ConsentAuthorizationEvaluation {
  void options?.clientDeclaredDecision;

  const scoped = serverRecords.filter((row) => matchesScope(row, consentScope));
  if (scoped.length === 0) {
    return { authorized: false, reason: 'no_records' };
  }

  // Any forged / unknown source in the scoped set poisons authorization.
  for (const row of scoped) {
    if (!isAuthoritativeSource(row.source)) {
      return { authorized: false, reason: 'forged_or_unknown_source' };
    }
    if (!isTrustworthyEffectiveAt(row.effective_at)) {
      return { authorized: false, reason: 'missing_ordering' };
    }
    if (
      row.revision !== undefined &&
      (!Number.isInteger(row.revision) || row.revision < 0)
    ) {
      return { authorized: false, reason: 'missing_ordering' };
    }
  }

  const allHaveRevision = scoped.every(
    (row) => typeof row.revision === 'number' && Number.isInteger(row.revision),
  );

  const sorted = [...scoped].sort((a, b) =>
    compareLatestEffective(b, a, allHaveRevision),
  );
  const latest = sorted[0];
  const runnerUp = sorted[1];

  if (
    runnerUp &&
    orderingKeyEqual(latest, runnerUp, allHaveRevision) &&
    latest.status !== runnerUp.status
  ) {
    return { authorized: false, reason: 'conflict' };
  }

  if (latest.status !== 'granted') {
    return {
      authorized: false,
      reason: 'not_granted',
      effective: latest,
    };
  }

  return { authorized: true, effective: latest };
}

/**
 * Authorize a declared event/session consent_scope against server records.
 * Uses latest-effective selection — not “any historical grant”.
 */
export function isConsentScopeAuthorized(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions,
): boolean {
  return evaluateConsentScopeAuthorization(
    consentScope,
    serverRecords,
    options,
  ).authorized;
}

/**
 * Withdrawal / denial / missing / conflict blocks the purpose.
 * Equivalent to !isConsentScopeAuthorized for latest-effective semantics.
 */
export function isConsentScopeBlocked(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions,
): boolean {
  return !isConsentScopeAuthorized(consentScope, serverRecords, options);
}

/**
 * Validation hook: produce issues when a scope is not server-authorized.
 * Always ignores clientDeclaredDecision (including `"granted"`).
 * Messages are stable and do not echo client or record payloads.
 */
export function collectConsentAuthorizationIssues(
  consentScope: ConsentScope,
  serverRecords: readonly ServerConsentRecord[],
  options?: ConsentAuthorizationOptions & { path?: string },
): ActivityValidationIssue[] {
  const path = options?.path ?? 'consent_scope';
  const evaluation = evaluateConsentScopeAuthorization(
    consentScope,
    serverRecords,
    { clientDeclaredDecision: options?.clientDeclaredDecision },
  );

  if (evaluation.authorized) {
    return [];
  }

  const codeByReason: Record<ConsentAuthorizationDenialReason, string> = {
    no_records: 'consent.unauthorized_scope',
    forged_or_unknown_source: 'consent.forged_source',
    missing_ordering: 'consent.missing_ordering',
    conflict: 'consent.conflict',
    not_granted: 'consent.unauthorized_scope',
  };

  const messageByReason: Record<ConsentAuthorizationDenialReason, string> = {
    no_records:
      'consent_scope is not authorized by server-attested records (client decision is not authorization)',
    forged_or_unknown_source:
      'consent_scope authorization rejected: forged or unknown consent source',
    missing_ordering:
      'consent_scope authorization rejected: missing or untrusted ordering metadata',
    conflict:
      'consent_scope authorization rejected: conflicting latest-effective consent records',
    not_granted:
      'consent_scope is not authorized by latest-effective server consent (client decision is not authorization)',
  };

  const reason = evaluation.reason ?? 'not_granted';
  return [
    {
      code: codeByReason[reason],
      path,
      message: messageByReason[reason],
    },
  ];
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
  if (
    candidate === null ||
    typeof candidate !== 'object' ||
    Array.isArray(candidate)
  ) {
    return false;
  }
  const row = candidate as Record<string, unknown>;
  const source = row.source;
  if (
    source === 'client_decision' ||
    source === 'wire_consent' ||
    source === 'offline_claim'
  ) {
    return true;
  }
  if (
    row.decision === 'granted' &&
    !isAuthoritativeSource(typeof source === 'string' ? source : undefined)
  ) {
    return true;
  }
  return false;
}
