import type { ConsentRecord } from '@prisma/client';
import type { ConsentScope, ServerConsentRecord } from '../activity-ingestion/activity-contract.types';
import { evaluateConsentScopeAuthorization } from '../activity-ingestion/activity-event.consent';

export function consentRecordsFromRows(rows: readonly ConsentRecord[]): ServerConsentRecord[] {
  return rows.map((row) => ({
    purpose: row.purpose,
    consent_scope: row.purpose as ConsentScope,
    policy_version: row.policyVersion,
    source: row.source as ServerConsentRecord['source'],
    status: row.status === 'granted' && !row.revokedAt ? 'granted' : 'withdrawn',
    effective_at: (row.revokedAt ?? row.recordedAt).toISOString(),
  }));
}

export function isSessionConsentEligibleAtRead(
  consentScope: string | null | undefined,
  consentPolicyVersion: string | null | undefined,
  parentRecords: readonly ServerConsentRecord[],
  childRecords: readonly ServerConsentRecord[],
): boolean {
  if (!consentScope) {
    return false;
  }
  const scope = consentScope as ConsentScope;
  const merged = [...parentRecords, ...childRecords];
  const evaluation = evaluateConsentScopeAuthorization(scope, merged);
  if (!evaluation.authorized || !evaluation.effective) {
    return false;
  }
  if (consentPolicyVersion && evaluation.effective.policy_version !== consentPolicyVersion) {
    return false;
  }
  return true;
}
