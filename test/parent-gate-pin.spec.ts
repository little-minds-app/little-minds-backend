import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ParentGatePinService } from '../src/modules/identity/parent-gate-pin.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../src/config/env.validation';
import { StepUpService } from '../src/modules/identity/linking/step-up.service';

describe('LMP-42 parent PIN gate', () => {
  const parentId = '11111111-1111-4111-8111-111111111111';
  const sessionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const pinRow = {
    salt: 'a'.repeat(64),
    pinHash: 'b'.repeat(64),
    failedAttempts: 0,
    lockedUntil: null as Date | null,
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: parentId }]),
    parentGatePin: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
    parentGateGrant: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };
  const db = {
    parentGatePin: {
      create: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    parentGateGrant: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn(async (action: (client: typeof tx) => Promise<unknown>) =>
      action(tx)),
  };
  const stepUp = { consumeParentGateTx: jest.fn().mockResolvedValue(undefined) };
  const service = new ParentGatePinService(
    { get db() { return db; } } as unknown as PrismaService,
    { get: () => 'unit-test-pepper-must-be-long' } as unknown as ConfigService<AppEnv, true>,
    stepUp as unknown as StepUpService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    tx.parentGatePin.findUnique.mockResolvedValue({ ...pinRow });
  });

  it('refuses non-six-digit setup PIN and mismatched confirmation', async () => {
    await expect(service.setWithProof(parentId, sessionId, 'proof', '1234', '1234', false)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.setWithProof(parentId, sessionId, 'proof', '123456', '654321', false)).rejects.toBeInstanceOf(BadRequestException);
    expect(db.parentGatePin.create).not.toHaveBeenCalled();
  });

  it('requires and atomically consumes a fresh linked identity proof on first setup', async () => {
    tx.parentGatePin.findUnique.mockResolvedValue(null);
    await expect(service.setWithProof(
      parentId, sessionId, 'fresh-otp-step-up', '654321', '654321', false,
    )).resolves.toEqual({ configured: true });
    expect(stepUp.consumeParentGateTx).toHaveBeenCalledWith(tx, {
      parentId, sessionId, stepUpToken: 'fresh-otp-step-up',
    });
    expect(tx.parentGatePin.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ parentId, salt: expect.any(String), pinHash: expect.any(String) }),
    });
  });

  it('resets PIN only after OTP proof and revokes every old adult grant', async () => {
    await expect(service.setWithProof(
      parentId, sessionId, 'fresh-reset-proof', '654321', '654321', true,
    )).resolves.toEqual({ configured: true });
    expect(stepUp.consumeParentGateTx).toHaveBeenCalledWith(tx, {
      parentId, sessionId, stepUpToken: 'fresh-reset-proof',
    });
    expect(tx.parentGateGrant.deleteMany).toHaveBeenCalledWith({ where: { parentId } });
  });

  it('fails closed when a missing PIN tries to reset', async () => {
    tx.parentGatePin.findUnique.mockResolvedValue(null);
    await expect(service.setWithProof(
      parentId, sessionId, 'fresh-reset-proof', '654321', '654321', true,
    )).rejects.toBeInstanceOf(ForbiddenException);
    expect(stepUp.consumeParentGateTx).not.toHaveBeenCalled();
  });

  it('never grants access for a missing or malformed token', async () => {
    await expect(service.requireGrant(parentId, sessionId, undefined)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.requireGrant(parentId, sessionId, '123456')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects grants from another parent or session', async () => {
    db.parentGateGrant.findUnique.mockResolvedValue({
      parentId: '22222222-2222-4222-8222-222222222222', sessionId,
      expiresAt: new Date(Date.now() + 300000),
    });
    const token = 'a'.repeat(43);
    await expect(service.requireGrant(parentId, sessionId, token)).rejects.toBeInstanceOf(ForbiddenException);
    db.parentGateGrant.findUnique.mockResolvedValue({
      parentId, sessionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      expiresAt: new Date(Date.now() + 300000),
    });
    await expect(service.requireGrant(parentId, sessionId, token)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('persists failed PIN attempts before rejecting the request', async () => {
    await expect(service.verify(parentId, '123456')).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.parentGatePin.update).toHaveBeenCalledWith({
      where: { parentId },
      data: { failedAttempts: 1, lockedUntil: null },
    });
  });
});
