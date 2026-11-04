-- LMP-131: Align child_profiles age check with OpenAPI (minimum 0) so parent corrections
-- below the 24-month content band persist without PostgreSQL 23514 / Prisma 500.
ALTER TABLE "child_profiles" DROP CONSTRAINT IF EXISTS "child_profiles_age_months_range_check";
ALTER TABLE "child_profiles"
  ADD CONSTRAINT "child_profiles_age_months_range_check"
  CHECK ("age_months_at_reference" >= 0 AND "age_months_at_reference" <= 71);
