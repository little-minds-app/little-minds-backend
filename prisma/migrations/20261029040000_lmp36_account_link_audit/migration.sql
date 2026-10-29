-- LMP-36 — privacy-safe account link audit (Blueprint §29.4 account_link_audit).
-- Additive only. No backfill. Recovery cases table deferred (architecture review).

CREATE TYPE "AccountLinkOutcome" AS ENUM (
  'linked',
  'already_linked',
  'collision_other_parent',
  'collision_unlinked',
  'collision_race',
  'invalid_proof',
  'rate_limited'
);

CREATE TABLE "account_link_audits" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "session_id" UUID,
    "provider" TEXT NOT NULL,
    "provider_subject_hash" TEXT NOT NULL,
    "outcome" "AccountLinkOutcome" NOT NULL,
    "identity_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_link_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "account_link_audits_parent_created_idx"
  ON "account_link_audits"("parent_id", "created_at");

CREATE INDEX "account_link_audits_provider_created_idx"
  ON "account_link_audits"("provider", "created_at");

CREATE INDEX "account_link_audits_outcome_created_idx"
  ON "account_link_audits"("outcome", "created_at");

ALTER TABLE "account_link_audits"
  ADD CONSTRAINT "account_link_audits_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
