# LMP-22 — Prisma ↔ Blueprint mapping

**Precedence:** Blueprint §38 supersedes conflicting §13 shorthand.  
**Out of PostgreSQL:** `content_cache_index` is device-local (§38.2) — not modeled here.

## Mapping table

| Prisma model | Table | Blueprint counterpart | Fields / notes |
|---|---|---|---|
| `ParentAccount` | `parent_accounts` | §13.1 `parent_accounts` + §38.2 lifecycle | `id`, `auth_subject`, `locale`, `timezone`, `lifecycle` (`active`/`pending_deletion`/`deleted`), `created_at`, `updated_at`, `deleted_at` |
| `ParentIdentity` | `parent_identities` | §13.1 / §38.2 | Unique `(provider, provider_subject)`; `verified_contact` minimized; `verified_at`, `linked_at`, `unlinked_at` |
| `ParentProfile` | `parent_profiles` | **§38.2 canonical**; replaces §13 `parent_demographics` as a table | Optional name + age band / gender / children count / occupation; `collection_notice_version` |
| `ProfileDraft` | `profile_drafts` | §38.2 new | Short-lived encrypted Apple/provider name draft; `expires_at`, `status` |
| `PrivacyNoticeAcknowledgment` | `privacy_notice_acknowledgments` | §13.1 | Notice presentation evidence ≠ consent |
| `ProcessingPreference` | `processing_preferences` | §13.1 / §38.2 | Purpose-scoped optional processing; withdrawable |
| `ChildProfile` | `child_profiles` | §13.1 / §38.2 | `age_months_at_reference`, `age_reference_date`, locale, optional timezone, accessibility JSON, soft delete |
| `ConsentRecord` | `consent_records` | §13.1 / §38.2 | Purpose, policy version, status, grant/withdraw timestamps |
| `ParentPreference` | `parent_preferences` | §13.1 | One row per child; materials / time / sensory / co-play as JSON where structure undecided |
| `Device` | `devices` | §13.1 / §38.2 | App-scoped device id; `revoked_at`; no hardware fingerprint |
| `KidsModeAuthorization` | `kids_mode_authorizations` | §38.2 **new** | Generation, activate/supersede/expire; partial unique active-per-child in SQL |
| `LearningDomain` | `learning_domains` | §13.2 | `code`, `label_key` |
| `LearningGoal` | `learning_goals` | §13.2 | Domain FK, objective key, evidence refs, review status |
| `SkillTag` | `skill_tags` | §13.2 | Code unique, domain FK |
| `Theme` | `themes` | §13.2 | Code, palette/narrative refs, status |
| `GameMechanic` | `game_mechanics` | §13.2 | Code, engine version, input capabilities |
| `ActivityDefinition` | `activity_definitions` | §13.2 | Mechanic/goal FKs, age range 24–71 check, safety class, status; `skill_tags` JSON pending join-table decision |
| `ActivityVariant` | `activity_variants` | §13.2; **Day-1 `content_version_id` target** (§38) | Immutable versioned variant; sessions/events FK here until separate `content_versions` decided |
| `MonthlyPack` | `monthly_packs` | §13.2 / §38.1 index intent | `age_month`, locale, channel, status, version |
| `MonthlyPackItem` | `monthly_pack_items` | §13.2 | Polymorphic `item_type` + `item_id` |
| `AssetManifest` | `asset_manifests` | §13.2 / §38.2 | Checksum, storage key, size; `entries_json` until `asset_entries` table decided |
| `Localization` | `localizations` | §13.2 | EAV-style entity/key/locale text |
| `ContentReview` | `content_reviews` | §13.2 | Entity/version review audit |
| `GenerationProvenance` | `generation_provenance` | §13.2 | Provider/model/prompt/hash |
| `MentorCard` | `mentor_cards` | §13.3 | Versioned guidance; materials/scripts as JSON |
| `RealWorldMission` | `real_world_missions` | §13.3 | Versioned missions; steps/materials JSON |
| `MentorRecommendation` | `mentor_recommendations` | §13.3 | Child + card + reason; expires |
| `MissionFeedback` | `mission_feedback` | §13.3 | Caregiver-reported status |
| `ParentReflection` | `parent_reflections` | §13.3 P1 optional | `encrypted_text` only; soft delete |
| `ActivitySession` | `activity_sessions` | §13.4; §38 `play_session_id` = `id` | `content_version_id` → `activity_variants`; duration fields |
| `ActivityEvent` | `activity_events` | §13.4 / §38.4 | Immutable `event_id` PK; idempotent; allowlisted payload JSON |
| `SkillObservation` | `skill_observations` | §13.4 | Non-diagnostic observations |
| `SkillState` | `skill_state` | §13.4 | Composite PK child+skill; recomputable |
| `DailyUsageAggregate` | `daily_usage_aggregates` | §13.4 / §38.2 | Per-device sum / union / overlap fields |
| `ActivityAggregate` | `activity_aggregates` | §13.4 / §38.2 / §38.5 | Content-version scoped; QA metrics not child ranking |
| `Insight` | `insights` | §13.4 | Template + evidence refs; optional mentor card |
| `ScreenTimePolicy` | `screen_time_policies` | §13.5 / §38.2 | Versioned caps; IANA timezone |
| `ScreenTimeInterval` | `screen_time_intervals` | §13.5 / §38.2 | Append-oriented raw intervals; optional play session |
| `ScreenTimeResetHistory` | `screen_time_reset_history` | §38.2 **new** | Unique per child/local day/tz/policy version |
| `Subscription` | `subscriptions` | §13.5 / §38.2–38.3 | Store-authoritative lifecycle enum |
| `PurchaseTransaction` | `purchase_transactions` | §13.5 / §38.2 | Unique `(store, store_event_id)` when present |
| `Entitlement` | `entitlements` | §13.5 / §38.2 | Feature key + validity; nullable source subscription for free/admin |
| `OfflineEntitlementGrant` | `offline_entitlement_grants` | §38.2 **new** | Device-bound signed grant metadata (no raw signing secret) |
| `SyncCursor` | `sync_cursors` | §13.5 | Per device+child sync watermark |
| `AuditLog` | `audit_logs` | §13.5 | Redacted metadata only |
| `DeletionRequest` | `deletion_requests` | §13.5 / §38.2 | Auditable deletion state machine |

## Explicit non-models

| Blueprint mention | Decision for LMP-22 |
|---|---|
| §13 `parent_demographics` | **Not a table** — folded into `parent_profiles` per §38 |
| §38 `content_cache_index` | Device-local; not in PostgreSQL |
| Separate `content_versions` | **Open** — `activity_variants.id` used as `content_version_id` for Day 1 |

## LMP-50 — Activity wire contract ↔ Prisma (no migrations)

Authoritative wire schemas: `contracts/schemas/activity/` (`schema_version` **1.0.0**). Docs: `docs/activity-event-contracts.md`.

| Wire field | Prisma | Notes |
|---|---|---|
| `play_session_id` | `ActivitySession.id` / `ActivityEvent.playSessionId` | Canonical session id |
| `event_id` | `ActivityEvent.eventId` (PK) | Idempotency key |
| `device_id` | `deviceId` | App-scoped UUID |
| `content_version_id` | `contentVersionId` → `activity_variants.id` | Day-1 target unchanged |
| `schema_version` | `schemaVersion` **String** | Semver `"1.0.0"` on wire |
| `occurred_at` | `occurredAt` | Client UTC (untrusted) |
| `monotonic_duration_seconds` | `monotonicDurationSeconds` | Required for duration-bearing events |
| `consent_scope` | `consentScope` | Purpose-specific allowlist |
| `payload` | `payloadJson` | Allowlisted typed JSON only |
| `completion_status` | `completionStatus` | Wire enum initial set; Prisma remains String |
| — | `ActivityEvent.receivedAt` | **Server-only** — reject if client sends |
| — | `ActivityEvent.childId` / `ActivitySession.childId` | **Server-derived** from auth scope — reject on client wire |
| Session `consent` / event `provenance` | Not separate columns yet | Persist inside allowlisted JSON or later columns in ingest task — **no migration in LMP-50** |
| Parent-only events omit `play_session_id` | `playSessionId` is required FK today | Persistence strategy deferred to ingest task; do not invent orphan sessions |

**UUIDv4 + UUIDv7** are both accepted on the wire (LMP-50 approved). Prisma `@default(uuid())` remains v4 until a reviewed generator lands — open item below is unchanged for DB defaults.

**Out of scope:** retention day counts, live ingest route, destructive migrations.

## Unresolved decisions (do not silently lock)

1. **UUIDv7 vs v4** — §38 prefers UUIDv7; Prisma `uuid()` is v4 until a reviewed generator is chosen. Wire contracts accept both v4 and v7 (LMP-50).
2. **Physical `content_versions` layout** — polymorphic vs activity-variant-only (§38.6).
3. **`asset_entries` normalization** vs `entries_json` on manifests.
4. **`activity_definitions.skill_tags` join table** vs JSON array.
5. **Exact enum catalogs** for `safety_class`, `scaffold_level`, `completion_status`, entitlement `status` strings, mission feedback statuses, localization entity types.
6. **Canonical learning domain `code` set** — Blueprint examples only; not seeded as product truth.
7. **Encryption / KMS** for `profile_drafts`, `parent_reflections`, purchase external refs.
8. **Retention day counts** for telemetry, aggregates, drafts, audit, billing (§38.3).
9. **Index tuning** beyond §38.1 minimum intent (query-plan validation later).
10. **Partial unique “one active kids-mode auth per child”** operational rules when `expires_at` is null vs set.
11. **Billing product IDs / prices / stores** (§38.6).
12. **Offline trust-anchor representation** and native reboot detection per OS.
13. **Whether `parent_preferences` allows multiple historical versions** or only current row.
14. **Monthly pack “single active publication” partial unique** exact predicate (channel/status).
