-- LMP-51 Phase A: globally unique event identifiers across child and parent event tables.
-- Claim insertion and canonical event insertion MUST share a single DB transaction.
CREATE TABLE "activity_ingest_keys" (
  "event_id" UUID NOT NULL,
  "parent_id" UUID NOT NULL,
  "payload_fingerprint" VARCHAR(64) NOT NULL,
  "event_class" VARCHAR(16) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_ingest_keys_pkey" PRIMARY KEY ("event_id"),
  CONSTRAINT "activity_ingest_keys_event_class_check" CHECK ("event_class" IN ('child', 'parent')),
  CONSTRAINT "activity_ingest_keys_fingerprint_check" CHECK ("payload_fingerprint" ~ '^[a-f0-9]{64}$')
);
CREATE INDEX "activity_ingest_keys_parent_created_idx" ON "activity_ingest_keys"("parent_id", "created_at");
