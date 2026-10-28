/**
 * Delivery-only mail port (ADR-021). Adapters must NOT own OTP verify,
 * parent identity, or session mint.
 */
export type MailSendInput = {
  /** Canonical email destination — never log. */
  to: string;
  subject: string;
  /** Pre-rendered body (may contain OTP) — never log. */
  body: string;
  /** Correlation id for delivery attempt rows (not PII). */
  challengeId: string;
};

export type MailSendResult = {
  ok: boolean;
  adapter: string;
  providerMessageId?: string;
  errorCode?: string;
};

export const MAIL_SENDER = Symbol('MAIL_SENDER');

export interface MailSender {
  readonly adapterName: string;
  send(input: MailSendInput): Promise<MailSendResult>;
}
