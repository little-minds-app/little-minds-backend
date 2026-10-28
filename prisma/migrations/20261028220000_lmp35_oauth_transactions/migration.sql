-- LMP-35 P0: server-issued one-time Google PKCE / OAuth transactions

CREATE TABLE "auth_oauth_transactions" (
  "id" UUID NOT NULL,
  "state_hash" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "redirect_uri" TEXT NOT NULL,
  "code_challenge" TEXT NOT NULL,
  "code_challenge_method" TEXT NOT NULL DEFAULT 'S256',
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "auth_oauth_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_oauth_transactions_state_hash_key"
  ON "auth_oauth_transactions"("state_hash");
CREATE INDEX "auth_oauth_transactions_expires_at_idx"
  ON "auth_oauth_transactions"("expires_at");
