-- LMP-42: parent-scoped gate PIN state. No plaintext PIN or grant is persisted.
CREATE TABLE "parent_gate_pins" (
  "parent_id" UUID NOT NULL,
  "salt" VARCHAR(64) NOT NULL,
  "pin_hash" VARCHAR(128) NOT NULL,
  "failed_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "parent_gate_pins_pkey" PRIMARY KEY ("parent_id"),
  CONSTRAINT "parent_gate_pins_parent_id_fkey" FOREIGN KEY ("parent_id")
    REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "parent_gate_pins_attempts_nonnegative" CHECK ("failed_attempts" >= 0)
);
