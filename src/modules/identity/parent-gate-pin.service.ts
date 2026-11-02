import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import type { AppEnv } from '../../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';
import { StepUpService } from './linking/step-up.service';

const PIN_PATTERN = /^[0-9]{6}$/;
const KEY_LENGTH = 32;
const SCRYPT_OPTIONS = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

function validPin(pin: unknown): asserts pin is string {
  if (typeof pin !== 'string' || !PIN_PATTERN.test(pin)) {
    throw new BadRequestException('PIN must contain six digits');
  }
}

/** Low-entropy PINs require server-side throttling in addition to stretching. */
@Injectable()
export class ParentGatePinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppEnv, true>,
    private readonly stepUp: StepUpService,
  ) {}

  private pepper(): string {
    const value = this.config.get('REFRESH_TOKEN_PEPPER', { infer: true });
    if (!value || value.length < 16) throw new Error('Missing PIN hash pepper');
    return value;
  }

  private async derive(pin: string, salt: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      scryptCallback(
        pin + ':' + this.pepper(),
        Buffer.from(salt, 'hex'),
        KEY_LENGTH,
        SCRYPT_OPTIONS,
        (error, derived) => error ? reject(error) : resolve(derived),
      );
    });
  }

  private tokenHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async configuration(parentId: string): Promise<{ configured: boolean }> {
    const count = await this.prisma.db.parentGatePin.count({ where: { parentId } });
    return { configured: count > 0 };
  }

  /** Opaque gate token is never a parent session or a replacement for one. */
  async verifyAndIssue(parentId: string, sessionId: string, pin: unknown) {
    await this.verify(parentId, pin);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.prisma.db.parentGateGrant.create({
      data: { tokenHash: this.tokenHash(token), parentId, sessionId, expiresAt },
    });
    return { gate_token: token, expires_in: 300 };
  }

  /** Fail-closed: caller must also pass ParentAuthGuard first. */
  async requireGrant(parentId: string, sessionId: string, token: unknown): Promise<void> {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      throw new ForbiddenException('Parent gate locked');
    }
    const grant = await this.prisma.db.parentGateGrant.findUnique({
      where: { tokenHash: this.tokenHash(token) },
    });
    if (!grant || grant.parentId !== parentId || grant.sessionId !== sessionId ||
        grant.expiresAt <= new Date()) {
      throw new ForbiddenException('Parent gate locked');
    }
  }

  async revokeGrant(parentId: string, sessionId: string, token: unknown): Promise<void> {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
    await this.prisma.db.parentGateGrant.deleteMany({
      where: { tokenHash: this.tokenHash(token), parentId, sessionId },
    });
  }

  /**
   * Setup and reset require a one-time fresh proof of a linked identity.
   * Proof consumption and PIN mutation are committed atomically.
   */
  async setWithProof(
    parentId: string,
    sessionId: string,
    proof: string,
    pin: unknown,
    confirmation: unknown,
    reset: boolean,
  ): Promise<{ configured: true }> {
    validPin(pin);
    validPin(confirmation);
    if (pin !== confirmation) throw new BadRequestException('PIN confirmation mismatch');
    const salt = randomBytes(32).toString('hex');
    const pinHash = (await this.derive(pin, salt)).toString('hex');
    try {
      await this.prisma.db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM parent_accounts WHERE id = ${parentId}::uuid FOR UPDATE`;
        const existing = await tx.parentGatePin.findUnique({ where: { parentId } });
        if (reset !== !!existing) {
          throw new ForbiddenException(reset ? 'Parent PIN not configured' : 'PIN already configured');
        }
        await this.stepUp.consumeParentGateTx(tx, {
          parentId, sessionId, stepUpToken: proof,
        });
        if (reset) {
          await tx.parentGatePin.update({
            where: { parentId },
            data: { salt, pinHash, failedAttempts: 0, lockedUntil: null },
          });
          await tx.parentGateGrant.deleteMany({ where: { parentId } });
        } else {
          await tx.parentGatePin.create({ data: { parentId, salt, pinHash } });
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('PIN already configured');
      }
      throw error;
    }
    return { configured: true };
  }

  /**
   * Serializes attempts per parent in PostgreSQL. A successful match is not
   * itself an adult authorization grant: callers must mint a session-bound,
   * short-lived grant in a separate, reviewed step.
   */
  async verify(parentId: string, pin: unknown): Promise<void> {
    validPin(pin);
    await this.prisma.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM parent_accounts WHERE id = ${parentId}::uuid FOR UPDATE`;
      const record = await tx.parentGatePin.findUnique({ where: { parentId } });
      if (!record) throw new ForbiddenException('Parent PIN not configured');
      const now = new Date();
      if (record.lockedUntil && record.lockedUntil > now) {
        throw new HttpException('Parent gate temporarily locked', HttpStatus.TOO_MANY_REQUESTS);
      }
      const candidate = await this.derive(pin, record.salt);
      const stored = Buffer.from(record.pinHash, 'hex');
      const correct = stored.length === KEY_LENGTH && timingSafeEqual(candidate, stored);
      if (!correct) {
        const failures = record.failedAttempts + 1;
        // Lockout begins after five mistakes; capped at one hour.
        const lockSeconds = failures >= 5 ? Math.min(3600, 30 * (2 ** Math.min(failures - 5, 7))) : 0;
        await tx.parentGatePin.update({
          where: { parentId },
          data: {
            failedAttempts: failures,
            lockedUntil: lockSeconds ? new Date(now.getTime() + lockSeconds * 1000) : null,
          },
        });
        // Never throw here: throwing inside the transaction rolls back attempts!
        return false;
      }
      await tx.parentGatePin.update({
        where: { parentId },
        data: { failedAttempts: 0, lockedUntil: null },
      });
      return true;
    }).then((accepted) => {
      if (!accepted) throw new ForbiddenException('Invalid parent PIN');
    });
  }
}
