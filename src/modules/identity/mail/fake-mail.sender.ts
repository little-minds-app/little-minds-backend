import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../../config/env.validation';
import { MAIL_ADAPTER_FAKE } from '../otp/multi-provider.constants';
import type { MailSendInput, MailSendResult, MailSender } from './mail-sender';

type InboxEntry = {
  challengeId: string;
  code: string;
  body: string;
  createdAt: Date;
};

/**
 * Local/CI FakeMailSender. Fail-closed if resolved when APP_ENV is staging/production.
 */
@Injectable()
export class FakeMailSender implements MailSender {
  readonly adapterName = MAIL_ADAPTER_FAKE;
  private readonly inbox = new Map<string, InboxEntry>();
  private failNext = false;
  private throwNext = false;
  private sendInvocations = 0;

  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  assertAllowedEnvironment(): void {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    if (appEnv === 'staging' || appEnv === 'production') {
      throw new Error(
        `FakeMailSender must not be used when APP_ENV=${appEnv} (ADR-021 fail-closed)`,
      );
    }
  }

  async send(input: MailSendInput): Promise<MailSendResult> {
    this.sendInvocations += 1;
    if (this.throwNext) {
      this.throwNext = false;
      throw new Error('injected mail adapter throw — must not leak to HTTP');
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
      providerMessageId: `fake-mail-${input.challengeId}`,
    };
  }

  peekCodeForTests(challengeId: string): string | undefined {
    return this.inbox.get(challengeId)?.code;
  }

  failNextSendForTests(): void {
    this.failNext = true;
  }

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
