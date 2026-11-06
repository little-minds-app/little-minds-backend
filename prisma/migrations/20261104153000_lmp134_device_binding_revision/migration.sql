-- LMP-134 P1-02: server-authoritative compare-and-set for devices.child_id binds.
ALTER TABLE "devices" ADD COLUMN "binding_revision" INTEGER NOT NULL DEFAULT 0;
