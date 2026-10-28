-- LMP-33 QA: deterministic indexed prior-refresh-hash lookup (reuse detection)

CREATE TABLE "parent_session_refresh_hash_lookups" (
  "hash" VARCHAR(64) NOT NULL,
  "session_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "parent_session_refresh_hash_lookups_pkey" PRIMARY KEY ("hash")
);

CREATE INDEX "parent_session_refresh_hash_lookups_session_idx"
  ON "parent_session_refresh_hash_lookups"("session_id");

ALTER TABLE "parent_session_refresh_hash_lookups"
  ADD CONSTRAINT "parent_session_refresh_hash_lookups_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "parent_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
