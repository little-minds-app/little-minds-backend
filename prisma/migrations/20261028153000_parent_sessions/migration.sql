-- LMP-33 / ADR-019: additive parent_sessions for secure parent auth lifecycle

CREATE TYPE "ParentSessionRevokeReason" AS ENUM (
  'logout',
  'logout_all',
  'refresh_reuse',
  'admin_revoke',
  'account_deletion',
  'expired',
  'security_event',
  'session_limit'
);

CREATE TABLE "parent_sessions" (
  "id" UUID NOT NULL,
  "parent_id" UUID NOT NULL,
  "token_family_id" UUID NOT NULL,
  "refresh_token_hash" TEXT,
  "refresh_token_hash_history" JSONB NOT NULL DEFAULT '[]',
  "refresh_generation" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "revoked_at" TIMESTAMPTZ(6),
  "revoked_reason" "ParentSessionRevokeReason",
  "device_id" UUID,
  "client_surface" TEXT,
  "user_agent_summary" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "last_refreshed_at" TIMESTAMPTZ(6),

  CONSTRAINT "parent_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "parent_sessions_refresh_token_hash_key" ON "parent_sessions"("refresh_token_hash");
CREATE INDEX "parent_sessions_parent_revoked_idx" ON "parent_sessions"("parent_id", "revoked_at");
CREATE INDEX "parent_sessions_token_family_idx" ON "parent_sessions"("token_family_id");
CREATE INDEX "parent_sessions_expires_at_idx" ON "parent_sessions"("expires_at");

ALTER TABLE "parent_sessions" ADD CONSTRAINT "parent_sessions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parent_sessions" ADD CONSTRAINT "parent_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
