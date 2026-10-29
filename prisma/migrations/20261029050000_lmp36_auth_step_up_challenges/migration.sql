-- LMP-36 P1 — server-issued recent-auth / step-up challenges for identity link.
-- Additive only. Pattern mirrors auth_oidc_nonces / auth_oauth_transactions.

CREATE TABLE "auth_step_up_challenges" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "parent_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_step_up_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_step_up_challenges_token_hash_key"
  ON "auth_step_up_challenges"("token_hash");

CREATE INDEX "auth_step_up_challenges_parent_purpose_idx"
  ON "auth_step_up_challenges"("parent_id", "purpose");

CREATE INDEX "auth_step_up_challenges_expires_at_idx"
  ON "auth_step_up_challenges"("expires_at");
