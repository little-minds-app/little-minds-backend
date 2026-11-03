-- LMP-130: parent-scoped mission status assertions (stable mission_id, occurrence-aware).

CREATE TABLE "parent_mission_status_reports" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "mission_id" VARCHAR(128) NOT NULL,
    "occurrence_id" UUID NOT NULL,
    "report_status" VARCHAR(32) NOT NULL,
    "idempotency_key" UUID NOT NULL,
    "schema_version" VARCHAR(32) NOT NULL,
    "consent_scope" VARCHAR(64) NOT NULL,
    "consent_policy_version" VARCHAR(128) NOT NULL,
    "actor_scope" VARCHAR(32) NOT NULL DEFAULT 'parent',
    "source" VARCHAR(32) NOT NULL DEFAULT 'caregiver_report',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_mission_status_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "parent_mission_status_reports_idempotency_uq"
  ON "parent_mission_status_reports"("parent_id", "idempotency_key");

CREATE UNIQUE INDEX "parent_mission_status_reports_occurrence_uq"
  ON "parent_mission_status_reports"("parent_id", "child_id", "mission_id", "occurrence_id");

CREATE INDEX "parent_mission_status_reports_parent_child_recorded_idx"
  ON "parent_mission_status_reports"("parent_id", "child_id", "recorded_at");

ALTER TABLE "parent_mission_status_reports"
  ADD CONSTRAINT "parent_mission_status_reports_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_mission_status_reports"
  ADD CONSTRAINT "parent_mission_status_reports_child_id_fkey"
  FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
