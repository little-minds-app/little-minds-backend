import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ParentConsentService } from './parent-consent.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('ParentConsentService', () => {
  const parentId = '11111111-1111-4111-8111-111111111111';
  let service: ParentConsentService;
  let consentRecord: {
    create: jest.Mock;
    findMany: jest.Mock;
  };
  let childProfile: { findFirst: jest.Mock };

  beforeEach(() => {
    consentRecord = {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    };
    childProfile = { findFirst: jest.fn() };
    service = new ParentConsentService({
      db: { consentRecord, childProfile },
    } as unknown as PrismaService);
  });

  it('requires at least one scope query value', () => {
    expect(() => service.parseScopes(undefined)).toThrow(BadRequestException);
  });

  it('records grant with server_consent_store source', async () => {
    const recordedAt = new Date('2026-03-01T12:00:00.000Z');
    consentRecord.create.mockResolvedValue({
      id: 'rec-1',
      parentId,
      childId: null,
      purpose: 'essential_play_events',
      policyVersion: 'synthetic-policy-v1',
      status: 'granted',
      recordedAt,
      source: 'server_consent_store',
    });
    const result = await service.grant(parentId, {
      consent_scope: 'essential_play_events',
      policy_version: 'synthetic-policy-v1',
      child_id: null,
    });
    expect(consentRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'server_consent_store',
          status: 'granted',
          purpose: 'essential_play_events',
        }),
      }),
    );
    expect(result).toMatchObject({
      status: 'granted',
      source: 'server_consent_store',
      policy_version: 'synthetic-policy-v1',
    });
  });

  it('returns not_granted when no trusted records exist', async () => {
    const out = await service.getEffectiveScopes(
      parentId,
      ['essential_play_events'],
      null,
    );
    expect(out.scopes[0]).toMatchObject({
      authorized: false,
      status: 'not_granted',
    });
  });

  it('validates owned child on grant', async () => {
    childProfile.findFirst.mockResolvedValue(null);
    await expect(
      service.grant(parentId, {
        consent_scope: 'essential_play_events',
        policy_version: 'synthetic-policy-v1',
        child_id: '33333333-3333-4333-8333-333333333333',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
