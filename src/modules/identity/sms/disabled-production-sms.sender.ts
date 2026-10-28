import { Injectable } from '@nestjs/common';
import { SMS_ADAPTER_PRODUCTION } from '../otp/otp.constants';
import type { SmsSendInput, SmsSendResult, SmsSender } from './sms-sender';

/**
 * Fail-closed production SMS port until a paid vendor is separately approved
 * (ADR-020 U19 / vendor gate). No SDK, no network send.
 */
@Injectable()
export class DisabledProductionSmsSender implements SmsSender {
  readonly adapterName = SMS_ADAPTER_PRODUCTION;

  async send(_input: SmsSendInput): Promise<SmsSendResult> {
    return {
      ok: false,
      adapter: this.adapterName,
      errorCode: 'production_sms_disabled',
    };
  }
}
