import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { SMS_ADAPTER_FAKE } from '../otp/otp.constants';
import type { SmsSendInput, SmsSendResult, SmsSender } from './sms-sender';

type InboxEntry = {
  challengeId: string;
  /** Test-only retrieval — never exposed via public HTTP (U17). */
  code: string;
  body: string;
  createdAt: Date;
};

/**
 * Local/CI FakeSmsSender. Fail-closed if resolved when APP_ENV is staging/production.
 * OTP codes are stashed in-process for test harness retrieval only.
 */
@Injectable()
export class FakeSmsSender implements SmsSender {
  readonly adapterName = SMS_ADAPTER_FAKE;
  private readonly inbox = new Map<string, InboxEntry>();
  /** Test-only: next send returns ok:false without throwing. */
  private failNext = false;
  /** Test-only: next send throws (adapter crash / network). */
  private throwNext = false;
  /** Test-only: how many times `send` was invoked. */
  private sendInvocations = 0;

  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  /** Fail-closed: must never send when APP_ENV is staging/production (U17). */
  assertAllowedEnvironment(): void {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    if (appEnv === 'staging' || appEnv === 'production') {
      throw new Error(
        `FakeSmsSender must not be used when APP_ENV=${appEnv} (ADR-020 / U17 fail-closed)`,
      );
    }
  }

  async send(input: SmsSendInput): Promise<SmsSendResult> {
    this.sendInvocations += 1;
    if (this.throwNext) {
      this.throwNext = false;
      throw new Error('injected sms adapter throw — must not leak to HTTP');
    }
    if (this.failNext) {
      this.failNext = false;
      return {
        ok: false,
        adapter: this.adapterName,
        errorCode: 'injected_failure',
      };
    }

    const appEnv = this.config.get('APP_ENV', { infer: true });
    if (appEnv === 'staging' || appEnv === 'production') {
      return {
        ok: false,
        adapter: this.adapterName,
        errorCode: 'fake_forbidden',
      };
    }

    const codeMatch = /\b(\d{6})\b/.exec(input.body);
    const code = codeMatch?.[1] ?? '';
    this.inbox.set(input.challengeId, {
      challengeId: input.challengeId,
      code,
      body: input.body,
      createdAt: new Date(),
    });

    return {
      ok: true,
      adapter: this.adapterName,
      providerMessageId: `fake-${input.challengeId}`,
    };
  }

  /** Test harness only — not wired to any HTTP route. */
  peekCodeForTests(challengeId: string): string | undefined {
    return this.inbox.get(challengeId)?.code;
  }

  /** Test harness: next `send` returns structured failure. */
  failNextSendForTests(): void {
    this.failNext = true;
  }

  /** Test harness: next `send` throws (failure-injection). */
  throwNextSendForTests(): void {
    this.throwNext = true;
  }

  sendInvocationCountForTests(): number {
    return this.sendInvocations;
  }

  clearInboxForTests(): void {
    this.inbox.clear();
    this.failNext = false;
    this.throwNext = false;
    this.sendInvocations = 0;
  }
}
