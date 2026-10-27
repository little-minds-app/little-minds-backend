-- CreateEnum
CREATE TYPE "ParentAccountLifecycle" AS ENUM ('active', 'pending_deletion', 'deleted');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('granted', 'withdrawn', 'not_asked');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('draft', 'in_review', 'rejected', 'approved', 'published', 'archived');

-- CreateEnum
CREATE TYPE "SubscriptionLifecycle" AS ENUM ('ACTIVE', 'GRACE_PERIOD', 'BILLING_RETRY', 'CANCELLED_RENEWAL', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('requested', 'in_progress', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('pending', 'acknowledged', 'rejected', 'conflict');

-- CreateEnum
CREATE TYPE "ProfileDraftStatus" AS ENUM ('pending', 'accepted', 'skipped', 'expired', 'deleted');

-- CreateTable
CREATE TABLE "parent_accounts" (
    "id" UUID NOT NULL,
    "auth_subject" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'tr-TR',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "lifecycle" "ParentAccountLifecycle" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "parent_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_identities" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_subject" TEXT NOT NULL,
    "verified_contact" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "linked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlinked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "parent_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_profiles" (
    "parent_id" UUID NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "age_band_optional" TEXT,
    "gender_optional" TEXT,
    "number_of_children_optional" INTEGER,
    "occupation_optional" TEXT,
    "collection_notice_version" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("parent_id")
);

-- CreateTable
CREATE TABLE "profile_drafts" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "encrypted_payload" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "ProfileDraftStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profile_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_notice_acknowledgments" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "notice_version" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "presented_at" TIMESTAMPTZ(6) NOT NULL,
    "acknowledged_at" TIMESTAMPTZ(6) NOT NULL,
    "surface" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_notice_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_preferences" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "ConsentStatus" NOT NULL,
    "legal_basis" TEXT NOT NULL,
    "policy_version" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "processing_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_profiles" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "nickname_optional" TEXT,
    "age_months_at_reference" INTEGER NOT NULL,
    "age_reference_date" DATE NOT NULL,
    "preferred_locale" TEXT NOT NULL DEFAULT 'tr-TR',
    "timezone" TEXT DEFAULT 'Europe/Istanbul',
    "accessibility_preferences_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "child_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "child_id" UUID,
    "purpose" TEXT NOT NULL,
    "policy_version" TEXT NOT NULL,
    "status" "ConsentStatus" NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_preferences" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "available_materials" JSONB,
    "time_budget" JSONB,
    "sensory_preferences" JSONB,
    "co_play_preference" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "parent_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "child_id" UUID,
    "platform" TEXT NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6),
    "last_policy_version" TEXT,
    "last_synced_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "install_key_ref" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kids_mode_authorizations" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "generation" INTEGER NOT NULL,
    "activated_at" TIMESTAMPTZ(6) NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "credential_ref" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "kids_mode_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_domains" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label_key" TEXT NOT NULL,

    CONSTRAINT "learning_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_goals" (
    "id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "objective_key" TEXT NOT NULL,
    "evidence_refs" JSONB,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "learning_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_tags" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "domain_id" UUID NOT NULL,
    "description_key" TEXT NOT NULL,

    CONSTRAINT "skill_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "palette_token_ref" TEXT,
    "narrative_key" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_mechanics" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "engine_version" TEXT NOT NULL,
    "input_capabilities" JSONB,

    CONSTRAINT "game_mechanics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_definitions" (
    "id" UUID NOT NULL,
    "mechanic_id" UUID NOT NULL,
    "learning_goal_id" UUID NOT NULL,
    "skill_tags" JSONB,
    "min_age_months" INTEGER NOT NULL,
    "max_age_months" INTEGER NOT NULL,
    "safety_class" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "activity_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_variants" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "difficulty" TEXT,
    "scaffold_level" TEXT,
    "theme_id" UUID,
    "locale" TEXT NOT NULL DEFAULT 'tr-TR',
    "configuration_json" JSONB,
    "asset_manifest_id" UUID,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "activity_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_packs" (
    "id" UUID NOT NULL,
    "age_month" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "theme_id" UUID,
    "version" INTEGER NOT NULL,
    "release_channel" TEXT NOT NULL DEFAULT 'default',
    "published_at" TIMESTAMPTZ(6),
    "status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monthly_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_pack_items" (
    "id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "monthly_pack_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_manifests" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "license_provenance" TEXT,
    "entries_json" JSONB,
    "status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "asset_manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localizations" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "localizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reviews" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "review_type" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_provenance" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "generated_at" TIMESTAMPTZ(6) NOT NULL,
    "content_hash" TEXT NOT NULL,

    CONSTRAINT "generation_provenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_cards" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "age_min_months" INTEGER NOT NULL,
    "age_max_months" INTEGER NOT NULL,
    "goal_ids" JSONB,
    "materials" JSONB,
    "scripts" JSONB,
    "adaptations" JSONB,
    "safety_notes" JSONB,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mentor_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "real_world_missions" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "linked_activity_ids" JSONB,
    "age_min_months" INTEGER NOT NULL,
    "age_max_months" INTEGER NOT NULL,
    "goal_ids" JSONB,
    "materials" JSONB,
    "steps" JSONB,
    "safety_notes" JSONB,
    "adaptations" JSONB,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "real_world_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_recommendations" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "mentor_card_id" UUID NOT NULL,
    "reason_code" TEXT NOT NULL,
    "evidence_summary" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "mentor_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_feedback" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "mission_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "reported_by_parent_id" UUID NOT NULL,
    "reported_at" TIMESTAMPTZ(6) NOT NULL,
    "optional_note_ref" TEXT,

    CONSTRAINT "mission_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_reflections" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "mission_id" UUID,
    "encrypted_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "parent_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_sessions" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "content_version_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6),
    "duration_seconds" INTEGER,
    "monotonic_duration_seconds" INTEGER,
    "completion_status" TEXT,
    "device_id" UUID,
    "schema_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "activity_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "event_id" UUID NOT NULL,
    "play_session_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "device_id" UUID,
    "content_version_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL,
    "monotonic_duration_seconds" INTEGER,
    "payload_json" JSONB,
    "schema_version" TEXT NOT NULL,
    "consent_scope" TEXT NOT NULL,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "skill_observations" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "skill_tag_id" UUID NOT NULL,
    "activity_variant_id" UUID,
    "difficulty" TEXT,
    "observation_type" TEXT NOT NULL,
    "value" JSONB,
    "observed_at" TIMESTAMPTZ(6) NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "skill_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_state" (
    "child_id" UUID NOT NULL,
    "skill_tag_id" UUID NOT NULL,
    "scaffold_level" TEXT,
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "rule_version" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "skill_state_pkey" PRIMARY KEY ("child_id","skill_tag_id")
);

-- CreateTable
CREATE TABLE "daily_usage_aggregates" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "local_date" DATE NOT NULL,
    "timezone" TEXT NOT NULL,
    "per_device_duration_sum" JSONB,
    "cross_device_interval_union" INTEGER,
    "overlap_delta" INTEGER,
    "active_seconds" INTEGER NOT NULL,
    "data_complete" BOOLEAN NOT NULL,
    "trust_status" TEXT,
    "computed_at" TIMESTAMPTZ(6) NOT NULL,
    "definition_version" TEXT NOT NULL,
    "policy_version" TEXT,

    CONSTRAINT "daily_usage_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_aggregates" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "content_version_id" UUID NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "window_end" TIMESTAMPTZ(6) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "first_attempt_eligible" INTEGER,
    "first_attempt_correct" INTEGER,
    "hints" INTEGER,
    "definition_version" TEXT NOT NULL,
    "sample_threshold_meta" JSONB,

    CONSTRAINT "activity_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "template_id" TEXT NOT NULL,
    "rule_version" TEXT NOT NULL,
    "evidence_window" JSONB,
    "sample_size" INTEGER,
    "metric_refs" JSONB,
    "mentor_card_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_time_policies" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "daily_cap_seconds" INTEGER NOT NULL,
    "session_cap_seconds_optional" INTEGER,
    "break_interval_seconds" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "updated_by_parent_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screen_time_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_time_intervals" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "play_session_id" UUID,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6),
    "active_seconds" INTEGER NOT NULL,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'pending',
    "trust_metadata" JSONB,
    "received_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screen_time_intervals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_time_reset_history" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "local_day" DATE NOT NULL,
    "timezone" TEXT NOT NULL,
    "policy_version" INTEGER NOT NULL,
    "trusted_anchor" TIMESTAMPTZ(6) NOT NULL,
    "reset_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT NOT NULL,
    "quality_flag" TEXT,

    CONSTRAINT "screen_time_reset_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "store" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "status" "SubscriptionLifecycle" NOT NULL,
    "current_period_end" TIMESTAMPTZ(6),
    "store_valid_until" TIMESTAMPTZ(6),
    "last_verified_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "auto_renew_status" TEXT,
    "original_transaction_ref" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_transactions" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "store" TEXT NOT NULL,
    "store_event_id" TEXT,
    "original_transaction_ref" TEXT,
    "event_type" TEXT NOT NULL,
    "verified_at" TIMESTAMPTZ(6) NOT NULL,
    "payload_hash" TEXT NOT NULL,
    "status_transition" TEXT,
    "encrypted_external_refs" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entitlements" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "feature_key" TEXT NOT NULL,
    "valid_from" TIMESTAMPTZ(6) NOT NULL,
    "valid_until" TIMESTAMPTZ(6),
    "offline_access_until" TIMESTAMPTZ(6),
    "source_subscription_id" UUID,
    "status" TEXT NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_entitlement_grants" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL,
    "store_valid_until" TIMESTAMPTZ(6) NOT NULL,
    "offline_access_until" TIMESTAMPTZ(6) NOT NULL,
    "signature_key_id" TEXT NOT NULL,
    "revocation_generation" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_entitlement_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_cursors" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "last_uploaded_event_id" UUID,
    "last_downloaded_policy_version" TEXT,
    "last_sync_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sync_cursors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_redacted" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deletion_requests" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "scope" TEXT NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'requested',
    "completed_at" TIMESTAMPTZ(6),
    "retention_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parent_identities_parent_id_idx" ON "parent_identities"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "parent_identities_provider_subject_key" ON "parent_identities"("provider", "provider_subject");

-- CreateIndex
CREATE INDEX "profile_drafts_parent_id_status_idx" ON "profile_drafts"("parent_id", "status");

-- CreateIndex
CREATE INDEX "privacy_notice_acknowledgments_parent_id_idx" ON "privacy_notice_acknowledgments"("parent_id");

-- CreateIndex
CREATE INDEX "processing_preferences_parent_id_purpose_idx" ON "processing_preferences"("parent_id", "purpose");

-- CreateIndex
CREATE INDEX "child_profiles_parent_id_deleted_at_idx" ON "child_profiles"("parent_id", "deleted_at");

-- CreateIndex
CREATE INDEX "consent_records_parent_id_idx" ON "consent_records"("parent_id");

-- CreateIndex
CREATE INDEX "consent_records_child_id_idx" ON "consent_records"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "parent_preferences_child_id_key" ON "parent_preferences"("child_id");

-- CreateIndex
CREATE INDEX "parent_preferences_parent_id_idx" ON "parent_preferences"("parent_id");

-- CreateIndex
CREATE INDEX "devices_parent_id_idx" ON "devices"("parent_id");

-- CreateIndex
CREATE INDEX "devices_child_id_idx" ON "devices"("child_id");

-- CreateIndex
CREATE INDEX "kids_mode_authorizations_child_id_idx" ON "kids_mode_authorizations"("child_id");

-- CreateIndex
CREATE INDEX "kids_mode_authorizations_device_id_idx" ON "kids_mode_authorizations"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_domains_code_key" ON "learning_domains"("code");

-- CreateIndex
CREATE INDEX "learning_goals_domain_id_idx" ON "learning_goals"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_tags_code_key" ON "skill_tags"("code");

-- CreateIndex
CREATE INDEX "skill_tags_domain_id_idx" ON "skill_tags"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "themes_code_key" ON "themes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "game_mechanics_code_key" ON "game_mechanics"("code");

-- CreateIndex
CREATE INDEX "activity_definitions_mechanic_id_idx" ON "activity_definitions"("mechanic_id");

-- CreateIndex
CREATE INDEX "activity_definitions_learning_goal_id_idx" ON "activity_definitions"("learning_goal_id");

-- CreateIndex
CREATE INDEX "activity_variants_theme_id_idx" ON "activity_variants"("theme_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_variants_activity_id_version_key" ON "activity_variants"("activity_id", "version");

-- CreateIndex
CREATE INDEX "monthly_packs_age_locale_channel_status_idx" ON "monthly_packs"("age_month", "locale", "release_channel", "status");

-- CreateIndex
CREATE INDEX "monthly_pack_items_pack_id_idx" ON "monthly_pack_items"("pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "localizations_entity_type_entity_id_locale_key_key" ON "localizations"("entity_type", "entity_id", "locale", "key");

-- CreateIndex
CREATE INDEX "content_reviews_entity_version_idx" ON "content_reviews"("entity_type", "entity_id", "version");

-- CreateIndex
CREATE INDEX "generation_provenance_entity_type_entity_id_idx" ON "generation_provenance"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "mentor_recommendations_child_id_idx" ON "mentor_recommendations"("child_id");

-- CreateIndex
CREATE INDEX "mission_feedback_child_id_idx" ON "mission_feedback"("child_id");

-- CreateIndex
CREATE INDEX "parent_reflections_child_id_idx" ON "parent_reflections"("child_id");

-- CreateIndex
CREATE INDEX "activity_sessions_child_id_started_at_idx" ON "activity_sessions"("child_id", "started_at");

-- CreateIndex
CREATE INDEX "activity_events_child_id_received_at_idx" ON "activity_events"("child_id", "received_at");

-- CreateIndex
CREATE INDEX "skill_observations_child_id_idx" ON "skill_observations"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_usage_aggregates_child_id_local_date_timezone_definit_key" ON "daily_usage_aggregates"("child_id", "local_date", "timezone", "definition_version");

-- CreateIndex
CREATE INDEX "activity_aggregates_child_id_content_version_id_idx" ON "activity_aggregates"("child_id", "content_version_id");

-- CreateIndex
CREATE INDEX "insights_child_id_idx" ON "insights"("child_id");

-- CreateIndex
CREATE INDEX "screen_time_policies_child_id_idx" ON "screen_time_policies"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "screen_time_policies_child_id_version_key" ON "screen_time_policies"("child_id", "version");

-- CreateIndex
CREATE INDEX "screen_time_intervals_child_device_started_idx" ON "screen_time_intervals"("child_id", "device_id", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "screen_time_reset_history_unique_day" ON "screen_time_reset_history"("child_id", "local_day", "timezone", "policy_version");

-- CreateIndex
CREATE INDEX "subscriptions_parent_id_status_idx" ON "subscriptions"("parent_id", "status");

-- CreateIndex
CREATE INDEX "purchase_transactions_subscription_id_idx" ON "purchase_transactions"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_transactions_store_event_key" ON "purchase_transactions"("store", "store_event_id");

-- CreateIndex
CREATE INDEX "entitlements_parent_id_feature_key_idx" ON "entitlements"("parent_id", "feature_key");

-- CreateIndex
CREATE INDEX "offline_entitlement_grants_parent_id_device_id_idx" ON "offline_entitlement_grants"("parent_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "sync_cursors_device_id_child_id_key" ON "sync_cursors"("device_id", "child_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "deletion_requests_parent_id_status_idx" ON "deletion_requests"("parent_id", "status");

-- AddForeignKey
ALTER TABLE "parent_identities" ADD CONSTRAINT "parent_identities_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_drafts" ADD CONSTRAINT "profile_drafts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_notice_acknowledgments" ADD CONSTRAINT "privacy_notice_acknowledgments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_preferences" ADD CONSTRAINT "processing_preferences_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_preferences" ADD CONSTRAINT "parent_preferences_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_preferences" ADD CONSTRAINT "parent_preferences_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_mode_authorizations" ADD CONSTRAINT "kids_mode_authorizations_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_mode_authorizations" ADD CONSTRAINT "kids_mode_authorizations_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_goals" ADD CONSTRAINT "learning_goals_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "learning_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_tags" ADD CONSTRAINT "skill_tags_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "learning_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_definitions" ADD CONSTRAINT "activity_definitions_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "game_mechanics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_definitions" ADD CONSTRAINT "activity_definitions_learning_goal_id_fkey" FOREIGN KEY ("learning_goal_id") REFERENCES "learning_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_variants" ADD CONSTRAINT "activity_variants_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_variants" ADD CONSTRAINT "activity_variants_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_variants" ADD CONSTRAINT "activity_variants_asset_manifest_id_fkey" FOREIGN KEY ("asset_manifest_id") REFERENCES "asset_manifests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_packs" ADD CONSTRAINT "monthly_packs_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_pack_items" ADD CONSTRAINT "monthly_pack_items_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "monthly_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_recommendations" ADD CONSTRAINT "mentor_recommendations_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_recommendations" ADD CONSTRAINT "mentor_recommendations_mentor_card_id_fkey" FOREIGN KEY ("mentor_card_id") REFERENCES "mentor_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_feedback" ADD CONSTRAINT "mission_feedback_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_feedback" ADD CONSTRAINT "mission_feedback_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "real_world_missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_reflections" ADD CONSTRAINT "parent_reflections_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_reflections" ADD CONSTRAINT "parent_reflections_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "real_world_missions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_sessions" ADD CONSTRAINT "activity_sessions_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_sessions" ADD CONSTRAINT "activity_sessions_content_version_id_fkey" FOREIGN KEY ("content_version_id") REFERENCES "activity_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_sessions" ADD CONSTRAINT "activity_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_play_session_id_fkey" FOREIGN KEY ("play_session_id") REFERENCES "activity_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_content_version_id_fkey" FOREIGN KEY ("content_version_id") REFERENCES "activity_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_observations" ADD CONSTRAINT "skill_observations_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_observations" ADD CONSTRAINT "skill_observations_skill_tag_id_fkey" FOREIGN KEY ("skill_tag_id") REFERENCES "skill_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_observations" ADD CONSTRAINT "skill_observations_activity_variant_id_fkey" FOREIGN KEY ("activity_variant_id") REFERENCES "activity_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_state" ADD CONSTRAINT "skill_state_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_state" ADD CONSTRAINT "skill_state_skill_tag_id_fkey" FOREIGN KEY ("skill_tag_id") REFERENCES "skill_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_usage_aggregates" ADD CONSTRAINT "daily_usage_aggregates_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_aggregates" ADD CONSTRAINT "activity_aggregates_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_aggregates" ADD CONSTRAINT "activity_aggregates_content_version_id_fkey" FOREIGN KEY ("content_version_id") REFERENCES "activity_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_mentor_card_id_fkey" FOREIGN KEY ("mentor_card_id") REFERENCES "mentor_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_time_policies" ADD CONSTRAINT "screen_time_policies_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_time_intervals" ADD CONSTRAINT "screen_time_intervals_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_time_intervals" ADD CONSTRAINT "screen_time_intervals_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_time_intervals" ADD CONSTRAINT "screen_time_intervals_play_session_id_fkey" FOREIGN KEY ("play_session_id") REFERENCES "activity_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_time_reset_history" ADD CONSTRAINT "screen_time_reset_history_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_transactions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_source_subscription_id_fkey" FOREIGN KEY ("source_subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_entitlement_grants" ADD CONSTRAINT "offline_entitlement_grants_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_entitlement_grants" ADD CONSTRAINT "offline_entitlement_grants_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_cursors" ADD CONSTRAINT "sync_cursors_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_cursors" ADD CONSTRAINT "sync_cursors_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- LMP-22 integrity extras (§38.1 age range + active kids-mode auth)
ALTER TABLE "child_profiles"
  ADD CONSTRAINT "child_profiles_age_months_range_check"
  CHECK ("age_months_at_reference" >= 24 AND "age_months_at_reference" <= 71);

ALTER TABLE "activity_definitions"
  ADD CONSTRAINT "activity_definitions_age_range_check"
  CHECK ("min_age_months" >= 24 AND "min_age_months" <= "max_age_months" AND "max_age_months" <= 71);

ALTER TABLE "monthly_packs"
  ADD CONSTRAINT "monthly_packs_age_month_range_check"
  CHECK ("age_month" >= 24 AND "age_month" <= 71);

ALTER TABLE "activity_sessions"
  ADD CONSTRAINT "activity_sessions_duration_nonnegative_check"
  CHECK (
    ("duration_seconds" IS NULL OR "duration_seconds" >= 0)
    AND ("monotonic_duration_seconds" IS NULL OR "monotonic_duration_seconds" >= 0)
  );

ALTER TABLE "screen_time_intervals"
  ADD CONSTRAINT "screen_time_intervals_active_seconds_nonnegative_check"
  CHECK ("active_seconds" >= 0);

CREATE UNIQUE INDEX "kids_mode_authorizations_one_active_per_child"
  ON "kids_mode_authorizations" ("child_id")
  WHERE "superseded_at" IS NULL;
