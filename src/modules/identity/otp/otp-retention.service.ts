import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OTP_RETENTION_INTERVAL_MS } from './otp.constants';
import {
  scrubExpiredOtpArtifacts,
  type OtpRetentionResult,
} from './otp-retention';

/**
 * Invokes OTP retention on boot + interval (ADR-020 U16).
 * Concurrent ticks serialized; multi-replica deletes are idempotent by cutoff.
 */
@Injectable()
export class OtpRetentionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OtpRetentionService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.runSafe();
    }, OTP_RETENTION_INTERVAL_MS);
    this.timer.unref?.();
    void this.runSafe();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runNow(now: Date = new Date()): Promise<OtpRetentionResult> {
    return scrubExpiredOtpArtifacts(this.prisma.db, now);
  }

  private async runSafe(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      const result = await this.runNow();
      if (
        result.challengesDeleted +
          result.deliveryDeleted +
          result.abuseCountersDeleted >
        0
      ) {
        this.logger.log(
          `otp_retention scrubbed challenges=${result.challengesDeleted} delivery=${result.deliveryDeleted} abuse=${result.abuseCountersDeleted}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `otp_retention failed: ${err instanceof Error ? err.name : 'unknown'}`,
      );
    } finally {
      this.running = false;
    }
  }
}
