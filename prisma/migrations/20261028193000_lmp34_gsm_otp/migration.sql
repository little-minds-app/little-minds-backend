-- LMP-34 / ADR-020: GSM OTP challenges, FK-safe delivery attempts, durable abuse counters

CREATE TYPE "OtpChallengeStatus" AS ENUM (
  'pending',
  'consumed',
  'expired',
  'locked',
  'superseded'
);

CREATE TYPE "OtpDeliveryState" AS ENUM (
  'pending_send',
  'sent',
  'failed',
  'superseded'
);

CREATE TABLE "otp_challenges" (
  "id" UUID NOT NULL,
  "provider" TEXT NOT NULL,
  "subject_key" TEXT NOT NULL,
  "code_hash" TEXT NOT NULL,
  "status" "OtpChallengeStatus" NOT NULL DEFAULT 'pending',
  "delivery_state" "OtpDeliveryState" NOT NULL DEFAULT 'pending_send',
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "send_count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  "last_sent_at" TIMESTAMPTZ(6),
  "sealed_destination" TEXT,
  "notice_version" TEXT NOT NULL,
  "notice_locale" TEXT NOT NULL,
  "notice_presented_at" TIMESTAMPTZ(6) NOT NULL,
  "presentation_surface" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "otp_challenges_provider_subject_idx" ON "otp_challenges"("provider", "subject_key");
CREATE INDEX "otp_challenges_expires_at_idx" ON "otp_challenges"("expires_at");
CREATE INDEX "otp_challenges_created_at_idx" ON "otp_challenges"("created_at");
-- One active pending challenge per (provider, subject)
CREATE UNIQUE INDEX "otp_challenges_one_pending_per_subject"
  ON "otp_challenges" ("provider", "subject_key") WHERE status = 'pending';

CREATE TABLE "otp_delivery_attempts" (
  "id" UUID NOT NULL,
  "challenge_id" UUID,
  "challenge_id_snapshot" UUID NOT NULL,
  "adapter" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "provider_message_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "otp_delivery_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "otp_delivery_attempts_challenge_idx" ON "otp_delivery_attempts"("challenge_id");
CREATE INDEX "otp_delivery_attempts_challenge_snapshot_idx" ON "otp_delivery_attempts"("challenge_id_snapshot");
CREATE INDEX "otp_delivery_attempts_created_at_idx" ON "otp_delivery_attempts"("created_at");

-- Prefer SET NULL over CASCADE so 24h challenge purge does not wipe 7d delivery rows (ADR-020 §13.1).
ALTER TABLE "otp_delivery_attempts"
  ADD CONSTRAINT "otp_delivery_attempts_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES "otp_challenges"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "otp_abuse_counters" (
  "bucket_type" TEXT NOT NULL,
  "bucket_key" TEXT NOT NULL,
  "window_start" TIMESTAMPTZ(6) NOT NULL,
  "send_count" INTEGER NOT NULL DEFAULT 0,
  "verify_count" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "otp_abuse_counters_pkey" PRIMARY KEY ("bucket_type", "bucket_key", "window_start")
);
