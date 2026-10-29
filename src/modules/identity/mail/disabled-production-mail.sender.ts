import { Injectable } from '@nestjs/common';
import { MAIL_ADAPTER_PRODUCTION } from '../otp/multi-provider.constants';
import type { MailSendInput, MailSendResult, MailSender } from './mail-sender';

/**
 * Fail-closed production mail port until SMTP / vendor is separately approved
 * (ADR-021 U22). No SDK, no network send.
 */
@Injectable()
export class DisabledProductionMailSender implements MailSender {
  readonly adapterName = MAIL_ADAPTER_PRODUCTION;

  async send(_input: MailSendInput): Promise<MailSendResult> {
    return {
      ok: false,
      adapter: this.adapterName,
      errorCode: 'production_mail_disabled',
    };
  }
}
