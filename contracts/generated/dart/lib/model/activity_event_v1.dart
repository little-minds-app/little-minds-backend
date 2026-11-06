//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ActivityEventV1 {
  /// Returns a new [ActivityEventV1] instance.
  ActivityEventV1({
    required this.schemaVersion,
    required this.eventId,
    required this.eventType,
    this.playSessionId,
    required this.deviceId,
    required this.contentVersionId,
    required this.occurredAt,
    this.monotonicDurationSeconds,
    required this.consentScope,
    required this.consentPolicyVersion,
    required this.provenance,
    this.payload = const {},
  });

  ActivitySchemaVersion schemaVersion;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String eventId;

  ActivityEventType eventType;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? playSessionId;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String deviceId;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String contentVersionId;

  /// UTC ISO-8601 instant ending in Z
  String occurredAt;

  /// Minimum value: 0
  /// Maximum value: 86400
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  int? monotonicDurationSeconds;

  ConsentScope consentScope;

  String consentPolicyVersion;

  ActivityEventProvenance provenance;

  /// Typed allowlisted payload per event_type (see JSON Schema)
  Map<String, Object> payload;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ActivityEventV1 &&
    other.schemaVersion == schemaVersion &&
    other.eventId == eventId &&
    other.eventType == eventType &&
    other.playSessionId == playSessionId &&
    other.deviceId == deviceId &&
    other.contentVersionId == contentVersionId &&
    other.occurredAt == occurredAt &&
    other.monotonicDurationSeconds == monotonicDurationSeconds &&
    other.consentScope == consentScope &&
    other.consentPolicyVersion == consentPolicyVersion &&
    other.provenance == provenance &&
    _deepEquality.equals(other.payload, payload);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (schemaVersion.hashCode) +
    (eventId.hashCode) +
    (eventType.hashCode) +
    (playSessionId == null ? 0 : playSessionId!.hashCode) +
    (deviceId.hashCode) +
    (contentVersionId.hashCode) +
    (occurredAt.hashCode) +
    (monotonicDurationSeconds == null ? 0 : monotonicDurationSeconds!.hashCode) +
    (consentScope.hashCode) +
    (consentPolicyVersion.hashCode) +
    (provenance.hashCode) +
    (payload.hashCode);

  @override
  String toString() => 'ActivityEventV1[schemaVersion=$schemaVersion, eventId=$eventId, eventType=$eventType, playSessionId=$playSessionId, deviceId=$deviceId, contentVersionId=$contentVersionId, occurredAt=$occurredAt, monotonicDurationSeconds=$monotonicDurationSeconds, consentScope=$consentScope, consentPolicyVersion=$consentPolicyVersion, provenance=$provenance, payload=$payload]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'schema_version'] = this.schemaVersion;
      json[r'event_id'] = this.eventId;
      json[r'event_type'] = this.eventType;
    if (this.playSessionId != null) {
      json[r'play_session_id'] = this.playSessionId;
    } else {
      json[r'play_session_id'] = null;
    }
      json[r'device_id'] = this.deviceId;
      json[r'content_version_id'] = this.contentVersionId;
      json[r'occurred_at'] = this.occurredAt;
    if (this.monotonicDurationSeconds != null) {
      json[r'monotonic_duration_seconds'] = this.monotonicDurationSeconds;
    } else {
      json[r'monotonic_duration_seconds'] = null;
    }
      json[r'consent_scope'] = this.consentScope;
      json[r'consent_policy_version'] = this.consentPolicyVersion;
      json[r'provenance'] = this.provenance;
      json[r'payload'] = this.payload;
    return json;
  }

  /// Returns a new [ActivityEventV1] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ActivityEventV1? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'schema_version'), 'Required key "ActivityEventV1[schema_version]" is missing from JSON.');
        assert(json[r'schema_version'] != null, 'Required key "ActivityEventV1[schema_version]" has a null value in JSON.');
        assert(json.containsKey(r'event_id'), 'Required key "ActivityEventV1[event_id]" is missing from JSON.');
        assert(json[r'event_id'] != null, 'Required key "ActivityEventV1[event_id]" has a null value in JSON.');
        assert(json.containsKey(r'event_type'), 'Required key "ActivityEventV1[event_type]" is missing from JSON.');
        assert(json[r'event_type'] != null, 'Required key "ActivityEventV1[event_type]" has a null value in JSON.');
        assert(json.containsKey(r'device_id'), 'Required key "ActivityEventV1[device_id]" is missing from JSON.');
        assert(json[r'device_id'] != null, 'Required key "ActivityEventV1[device_id]" has a null value in JSON.');
        assert(json.containsKey(r'content_version_id'), 'Required key "ActivityEventV1[content_version_id]" is missing from JSON.');
        assert(json[r'content_version_id'] != null, 'Required key "ActivityEventV1[content_version_id]" has a null value in JSON.');
        assert(json.containsKey(r'occurred_at'), 'Required key "ActivityEventV1[occurred_at]" is missing from JSON.');
        assert(json[r'occurred_at'] != null, 'Required key "ActivityEventV1[occurred_at]" has a null value in JSON.');
        assert(json.containsKey(r'consent_scope'), 'Required key "ActivityEventV1[consent_scope]" is missing from JSON.');
        assert(json[r'consent_scope'] != null, 'Required key "ActivityEventV1[consent_scope]" has a null value in JSON.');
        assert(json.containsKey(r'consent_policy_version'), 'Required key "ActivityEventV1[consent_policy_version]" is missing from JSON.');
        assert(json[r'consent_policy_version'] != null, 'Required key "ActivityEventV1[consent_policy_version]" has a null value in JSON.');
        assert(json.containsKey(r'provenance'), 'Required key "ActivityEventV1[provenance]" is missing from JSON.');
        assert(json[r'provenance'] != null, 'Required key "ActivityEventV1[provenance]" has a null value in JSON.');
        assert(json.containsKey(r'payload'), 'Required key "ActivityEventV1[payload]" is missing from JSON.');
        assert(json[r'payload'] != null, 'Required key "ActivityEventV1[payload]" has a null value in JSON.');
        return true;
      }());

      return ActivityEventV1(
        schemaVersion: ActivitySchemaVersion.fromJson(json[r'schema_version'])!,
        eventId: mapValueOfType<String>(json, r'event_id')!,
        eventType: ActivityEventType.fromJson(json[r'event_type'])!,
        playSessionId: mapValueOfType<String>(json, r'play_session_id'),
        deviceId: mapValueOfType<String>(json, r'device_id')!,
        contentVersionId: mapValueOfType<String>(json, r'content_version_id')!,
        occurredAt: mapValueOfType<String>(json, r'occurred_at')!,
        monotonicDurationSeconds: mapValueOfType<int>(json, r'monotonic_duration_seconds'),
        consentScope: ConsentScope.fromJson(json[r'consent_scope'])!,
        consentPolicyVersion: mapValueOfType<String>(json, r'consent_policy_version')!,
        provenance: ActivityEventProvenance.fromJson(json[r'provenance'])!,
        payload: mapCastOfType<String, Object>(json, r'payload')!,
      );
    }
    return null;
  }

  static List<ActivityEventV1> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventV1>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventV1.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ActivityEventV1> mapFromJson(dynamic json) {
    final map = <String, ActivityEventV1>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ActivityEventV1.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ActivityEventV1-objects as value to a dart map
  static Map<String, List<ActivityEventV1>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ActivityEventV1>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ActivityEventV1.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'schema_version',
    'event_id',
    'event_type',
    'device_id',
    'content_version_id',
    'occurred_at',
    'consent_scope',
    'consent_policy_version',
    'provenance',
    'payload',
  };
}

