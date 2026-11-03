-- LMP-130 review: append-only idempotency ledger; occurrence row holds current state only.

CREATE TABLE "parent_mission_status_idempotency_keys" (
    "parent_id" UUID NOT NULL,
    "idempotency_key" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "mission_id" VARCHAR(128) NOT NULL,
    "occurrence_id" UUID NOT NULL,
    "report_status" VARCHAR(32) NOT NULL,
    "payload_fingerprint" VARCHAR(64) NOT NULL,
    "assertion_id" UUID NOT NULL,
    "revision_at_accept" INTEGER NOT NULL,
    "recorded_at_at_accept" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_mission_status_idempotency_keys_pkey"
      PRIMARY KEY ("parent_id", "idempotency_key")
);

ALTER TABLE "parent_mission_status_idempotency_keys"
  ADD CONSTRAINT "parent_mission_status_idempotency_keys_assertion_id_fkey"
  FOREIGN KEY ("assertion_id") REFERENCES "parent_mission_status_reports"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "parent_mission_status_idempotency_keys" (
  "parent_id",
  "idempotency_key",
  "child_id",
  "mission_id",
  "occurrence_id",
  "report_status",
  "payload_fingerprint",
  "assertion_id",
  "revision_at_accept",
  "recorded_at_at_accept"
)
SELECT
  "parent_id",
  "idempotency_key",
  "child_id",
  "mission_id",
  "occurrence_id",
  "report_status",
  'legacy-migration-v1',
  "id",
  "revision",
  "recorded_at"
FROM "parent_mission_status_reports";

DROP INDEX "parent_mission_status_reports_idempotency_uq";

ALTER TABLE "parent_mission_status_reports" DROP COLUMN "idempotency_key";
