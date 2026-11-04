import { scopedDeviceId } from '../identity/session/session-issuer.service';

/**
 * Resolve the parent-scoped database `devices.id` for an untrusted installation UUID
 * (issue #28 / ADR-019). Legacy rows whose id equals the installation UUID stay bound
 * to their original parent.
 */
export function resolveDatabaseDeviceId(
  installationId: string,
  parentId: string,
  legacyOwnerParentId: string | null | undefined,
): string {
  return legacyOwnerParentId === parentId
    ? installationId
    : scopedDeviceId(installationId, parentId);
}
