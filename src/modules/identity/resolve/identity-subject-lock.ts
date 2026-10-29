import { createHash } from 'node:crypto';

/**
 * Shared PG advisory lock key for `(provider, provider_subject)`.
 * Used by IdentityResolveService (LMP-35), AccountLinkingService (LMP-36),
 * and PhoneOtpService.resolveOrCreateParentTx — must stay identical so
 * concurrent GSM login vs explicit link serialize on the same subject.
 */
export function identitySubjectLockKey(
  provider: string,
  providerSubject: string,
): number {
  const digest = createHash('sha256')
    .update(`identity:${provider}:${providerSubject}`)
    .digest();
  return digest.readInt32BE(0);
}
