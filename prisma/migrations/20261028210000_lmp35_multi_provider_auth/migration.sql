-- LMP-35 / ADR-021: server-issued OIDC nonces for Apple / Google ID-token paths

CREATE TABLE "auth_oidc_nonces" (
  "id" UUID NOT NULL,
  "nonce_hash" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "auth_oidc_nonces_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_oidc_nonces_nonce_hash_key" ON "auth_oidc_nonces"("nonce_hash");
CREATE INDEX "auth_oidc_nonces_expires_at_idx" ON "auth_oidc_nonces"("expires_at");
