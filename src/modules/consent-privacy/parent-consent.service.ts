import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConsentRecord } from '@prisma/client';
import {
  CONSENT_SCOPES,
  type ConsentScope,
  type ServerConsentRecord,
} from '../activity-ingestion/activity-contract.types';
import { evaluateConsentScopeAuthorization } from '../activity-ingestion/activity-event.consent';
import { consentRecordsFromRows } from '../session-kpi/session-kpi.consent';
import { PrismaService } from '../prisma/prisma.service';

/**
 * LMP-134 — authoritative server consent store for parent-facing grant/withdraw.
 *
 * **Lawful basis / UX (Blueprint §29.3, F-033):**
 * - `essential_play_events` (play telemetry) requires an **explicit, unchecked opt-in**
 *   recorded via POST …/consent/grant — not login silence, not Parent Gate PIN,
 *   not privacy-notice acknowledgment alone, and not session wire `consent.decision`.
 * - Notice acknowledgment (`privacy_notice_acknowledgments`) is transparency only.
 * - This service never auto-grants on auth verify, OTP, or gameplay ingest paths.
 *
 * Rows persisted here use `source: server_consent_store` so ingest `checkConsent` can
 * authorize when `policy_version` matches the client publication envelope (e.g.
 * Shape Matching UAT `synthetic-policy-v1`).
 */
export type EffectiveConsentScope = {
  consent_scope: ConsentScope;
  child_id: string | null;
  authorized: boolean;
  policy_version: string | null;
  status: 'granted' | 'withdrawn' | 'not_granted';
  effective_at: string | null;
  source: 'server_consent_store' | null;
  record_id: string | null;
};

export type ConsentMutationResult = {
  record_id: string;
  consent_scope: ConsentScope;
  child_id: string | null;
  policy_version: string;
  status: 'granted' | 'withdrawn';
  recorded_at: string;
  source: 'server_consent_store';
};

const SERVER_SOURCE = 'server_consent_store' as const;

@Injectable()
export class ParentConsentService {
  constructor(private readonly prisma: PrismaService) {}

  parseScopes(raw: string | string[] | undefined): ConsentScope[] {
    const values = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
    if (values.length === 0) {
      throw new BadRequestException('At least one scope query parameter is required');
    }
    const scopes: ConsentScope[] = [];
    for (const value of values) {
      if (typeof value !== 'string' || !(CONSENT_SCOPES as readonly string[]).includes(value)) {
        throw new BadRequestException('Invalid consent scope');
      }
      if (!scopes.includes(value as ConsentScope)) {
        scopes.push(value as ConsentScope);
      }
    }
    return scopes;
  }

  parseOptionalChildId(raw: unknown): string | null {
    if (raw === undefined || raw === null || raw === '') {
      return null;
    }
    if (typeof raw !== 'string') {
      throw new BadRequestException('Invalid child_id');
    }
    return raw;
  }

  parseGrantOrWithdrawBody(body: unknown): {
    consent_scope: ConsentScope;
    policy_version: string;
    child_id: string | null;
  } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Invalid request body');
    }
    const record = body as Record<string, unknown>;
    const scope = record.consent_scope;
    if (typeof scope !== 'string' || !(CONSENT_SCOPES as readonly string[]).includes(scope)) {
      throw new BadRequestException('Invalid consent_scope');
    }
    const policyVersion = record.policy_version;
    if (typeof policyVersion !== 'string' || policyVersion.trim().length === 0) {
      throw new BadRequestException('Invalid policy_version');
    }
    let childId: string | null = null;
    if (Object.prototype.hasOwnProperty.call(record, 'child_id')) {
      const rawChild = record.child_id;
      if (rawChild !== null && typeof rawChild !== 'string') {
        throw new BadRequestException('Invalid child_id');
      }
      childId = rawChild as string | null;
    }
    return {
      consent_scope: scope as ConsentScope,
      policy_version: policyVersion.trim(),
      child_id: childId,
    };
  }

  async getEffectiveScopes(
    parentId: string,
    scopes: readonly ConsentScope[],
    childId: string | null,
  ): Promise<{ scopes: EffectiveConsentScope[] }> {
    if (childId !== null) {
      await this.assertOwnedChild(parentId, childId);
    }
    const results: EffectiveConsentScope[] = [];
    for (const consentScope of scopes) {
      results.push(
        await this.evaluateOneScope(parentId, consentScope, childId),
      );
    }
    return { scopes: results };
  }

  async grant(
    parentId: string,
    input: {
      consent_scope: ConsentScope;
      policy_version: string;
      child_id: string | null;
    },
  ): Promise<ConsentMutationResult> {
    if (input.child_id !== null) {
      await this.assertOwnedChild(parentId, input.child_id);
    }
    const recordedAt = new Date();
    const row = await this.prisma.db.consentRecord.create({
      data: {
        parentId,
        childId: input.child_id,
        purpose: input.consent_scope,
        policyVersion: input.policy_version,
        status: 'granted',
        recordedAt,
        source: SERVER_SOURCE,
      },
    });
    return this.toMutation(row);
  }

  async withdraw(
    parentId: string,
    input: {
      consent_scope: ConsentScope;
      policy_version: string;
      child_id: string | null;
    },
  ): Promise<ConsentMutationResult> {
    if (input.child_id !== null) {
      await this.assertOwnedChild(parentId, input.child_id);
    }
    const recordedAt = new Date();
    const row = await this.prisma.db.consentRecord.create({
      data: {
        parentId,
        childId: input.child_id,
        purpose: input.consent_scope,
        policyVersion: input.policy_version,
        status: 'withdrawn',
        recordedAt,
        source: SERVER_SOURCE,
      },
    });
    return this.toMutation(row);
  }

  /** Same row selection semantics as ActivityIngestionService.checkConsent. */
  async loadScopedRows(
    parentId: string,
    consentScope: ConsentScope,
    childId: string | null,
  ): Promise<ConsentRecord[]> {
    const rows = await this.prisma.db.consentRecord.findMany({
      where: {
        parentId,
        purpose: consentScope,
        OR: [{ childId: null }, ...(childId ? [{ childId }] : [])],
      },
      orderBy: { recordedAt: 'desc' },
    });
    return rows;
  }

  rowsToServerRecords(
    rows: readonly ConsentRecord[],
    consentScope: ConsentScope,
  ): ServerConsentRecord[] {
    const scoped = rows.filter((row) => row.purpose === consentScope);
    if (
      scoped.some(
        (row) =>
          row.source !== SERVER_SOURCE && row.source !== 'sync_scope_grant',
      )
    ) {
      return [];
    }
    return consentRecordsFromRows(scoped).map((row) => ({
      ...row,
      consent_scope: consentScope,
    }));
  }

  isAuthorizedForPolicy(
    consentScope: ConsentScope,
    serverRecords: readonly ServerConsentRecord[],
    policyVersion: string,
  ): boolean {
    const evaluation = evaluateConsentScopeAuthorization(
      consentScope,
      serverRecords,
    );
    return (
      evaluation.authorized &&
      evaluation.effective?.policy_version === policyVersion
    );
  }

  private async evaluateOneScope(
    parentId: string,
    consentScope: ConsentScope,
    childId: string | null,
  ): Promise<EffectiveConsentScope> {
    const rows = await this.loadScopedRows(parentId, consentScope, childId);
    const serverRecords = this.rowsToServerRecords(rows, consentScope);
    if (serverRecords.length === 0) {
      return {
        consent_scope: consentScope,
        child_id: childId,
        authorized: false,
        policy_version: null,
        status: 'not_granted',
        effective_at: null,
        source: null,
        record_id: null,
      };
    }
    const evaluation = evaluateConsentScopeAuthorization(
      consentScope,
      serverRecords,
    );
    if (!evaluation.effective) {
      return {
        consent_scope: consentScope,
        child_id: childId,
        authorized: false,
        policy_version: null,
        status: 'not_granted',
        effective_at: null,
        source: null,
        record_id: null,
      };
    }
    const effectiveRow = rows.find(
      (row) =>
        row.policyVersion === evaluation.effective!.policy_version &&
        row.source === evaluation.effective!.source,
    );
    return {
      consent_scope: consentScope,
      child_id: childId,
      authorized: evaluation.authorized,
      policy_version: evaluation.effective.policy_version,
      status: evaluation.authorized ? 'granted' : 'withdrawn',
      effective_at: evaluation.effective.effective_at,
      source:
        evaluation.effective.source === SERVER_SOURCE ? SERVER_SOURCE : null,
      record_id: effectiveRow?.id ?? null,
    };
  }

  private async assertOwnedChild(
    parentId: string,
    childId: string,
  ): Promise<void> {
    const child = await this.prisma.db.childProfile.findFirst({
      where: {
        id: childId,
        parentId,
        deletedAt: null,
        parent: { lifecycle: 'active', deletedAt: null },
      },
      select: { id: true },
    });
    if (!child) {
      throw new NotFoundException('Child profile not found');
    }
  }

  private toMutation(row: ConsentRecord): ConsentMutationResult {
    return {
      record_id: row.id,
      consent_scope: row.purpose as ConsentScope,
      child_id: row.childId,
      policy_version: row.policyVersion,
      status: row.status === 'granted' ? 'granted' : 'withdrawn',
      recorded_at: row.recordedAt.toISOString(),
      source: SERVER_SOURCE,
    };
  }
}
