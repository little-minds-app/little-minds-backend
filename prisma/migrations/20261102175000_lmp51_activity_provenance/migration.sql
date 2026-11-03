-- LMP-51: retain consent policy and provenance when storing versioned Activity V1 documents.
-- Nullable columns permit legacy local fixture rows without destructive backfill.
ALTER TABLE "activity_sessions"
  ADD COLUMN "consent_scope" TEXT,
  ADD COLUMN "consent_policy_version" TEXT,
  ADD COLUMN "provenance_json" JSONB;
ALTER TABLE "activity_events"
  ADD COLUMN "consent_policy_version" TEXT,
  ADD COLUMN "provenance_json" JSONB;
ALTER TABLE "parent_activity_events"
  ADD COLUMN "provenance_json" JSONB;
