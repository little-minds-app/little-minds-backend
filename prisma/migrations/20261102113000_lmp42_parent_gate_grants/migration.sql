-- LMP-42: opaque, short-lived, session-bound adult grants.
CREATE TABLE "parent_gate_grants" (
  "token_hash" VARCHAR(64) NOT NULL,
  "parent_id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "parent_gate_grants_pkey" PRIMARY KEY ("token_hash"),
  CONSTRAINT "parent_gate_grants_parent_id_fkey" FOREIGN KEY ("parent_id")
    REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "parent_gate_grants_session_id_fkey" FOREIGN KEY ("session_id")
    REFERENCES "parent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "parent_gate_grants_parent_id_session_id_expires_at_idx"
  ON "parent_gate_grants"("parent_id", "session_id", "expires_at");
