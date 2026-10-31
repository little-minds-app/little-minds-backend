-- LMP-38: backend-owned opaque web session. No browser refresh tokens.
CREATE TABLE "web_parent_sessions" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "parent_session_id" UUID NOT NULL,
    "handle_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(6),
    CONSTRAINT "web_parent_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "web_parent_sessions_handle_hash_key" ON "web_parent_sessions"("handle_hash");
CREATE INDEX "web_parent_sessions_parent_revoked_idx" ON "web_parent_sessions"("parent_id", "revoked_at");
CREATE UNIQUE INDEX "web_parent_sessions_parent_session_id_key" ON "web_parent_sessions"("parent_session_id");
CREATE INDEX "web_parent_sessions_expires_at_idx" ON "web_parent_sessions"("expires_at");
ALTER TABLE "web_parent_sessions" ADD CONSTRAINT "web_parent_sessions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "web_parent_sessions" ADD CONSTRAINT "web_parent_sessions_parent_session_id_fkey" FOREIGN KEY ("parent_session_id") REFERENCES "parent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
