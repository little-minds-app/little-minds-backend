import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import type { AppEnv } from '../../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';

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

  /** Setup is one-time only. PIN recovery needs a separately verified OTP flow. */
  async setup(parentId: string, pin: unknown, confirmation: unknown): Promise<void> {
    validPin(pin);
    validPin(confirmation);
    if (pin !== confirmation) throw new BadRequestException('PIN confirmation mismatch');
    const salt = randomBytes(32).toString('hex');
    const pinHash = (await this.derive(pin, salt)).toString('hex');
    try {
      await this.prisma.db.parentGatePin.create({
        data: { parentId, salt, pinHash },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('PIN already configured');
      }
      throw error;
    }
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
