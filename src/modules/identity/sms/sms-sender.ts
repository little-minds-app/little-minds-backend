/**
 * Delivery-only SMS port (ADR-020). Adapters must NOT own OTP verify,
 * parent identity, or session mint.
 */
export type SmsSendInput = {
  /** E.164 destination — never log. */
  e164: string;
  /** Pre-rendered vendor-neutral body (TR template Day-1). */
  body: string;
  /** Correlation id for delivery attempt rows (not PII). */
  challengeId: string;
};

export type SmsSendResult = {
  ok: boolean;
  adapter: string;
  providerMessageId?: string;
  errorCode?: string;
};

export const SMS_SENDER = Symbol('SMS_SENDER');

export interface SmsSender {
  readonly adapterName: string;
  send(input: SmsSendInput): Promise<SmsSendResult>;
}
