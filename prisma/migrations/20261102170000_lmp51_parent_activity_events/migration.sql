-- LMP-51 Phase A: isolate parent-only events from child play sessions.
-- No ingestion route is enabled by this migration.
CREATE TABLE "parent_activity_events" (
  "event_id" UUID NOT NULL,
  "parent_id" UUID NOT NULL,
  "device_id" UUID NOT NULL,
  "content_version_id" UUID NOT NULL,
  "event_type" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload_json" JSONB NOT NULL,
  "schema_version" TEXT NOT NULL,
  "consent_scope" TEXT NOT NULL,
  "consent_policy_version" TEXT NOT NULL,
  "payload_fingerprint" VARCHAR(64) NOT NULL,
  CONSTRAINT "parent_activity_events_pkey" PRIMARY KEY ("event_id"),
  CONSTRAINT "parent_activity_events_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "parent_activity_events_parent_type_check" CHECK ("event_type" IN ('mission_feedback_submitted', 'mentor_card_opened')),
  CONSTRAINT "parent_activity_events_fingerprint_check" CHECK ("payload_fingerprint" ~ '^[a-f0-9]{64}$')
);
CREATE INDEX "parent_activity_events_parent_received_idx" ON "parent_activity_events"("parent_id", "received_at");
