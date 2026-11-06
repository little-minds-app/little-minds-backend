//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ActivitySessionV1 {
  /// Returns a new [ActivitySessionV1] instance.
  ActivitySessionV1({
    required this.schemaVersion,
    required this.playSessionId,
    required this.deviceId,
    required this.contentVersionId,
    required this.startedAt,
    this.endedAt,
    this.monotonicDurationSeconds,
    required this.completionStatus,
    this.appBuild,
    this.locale,
    required this.consent,
    required this.provenance,
  });

  ActivitySchemaVersion schemaVersion;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String playSessionId;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String deviceId;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String contentVersionId;

  /// UTC ISO-8601 instant ending in Z
  String startedAt;

  /// UTC ISO-8601 instant ending in Z
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? endedAt;

  /// Minimum value: 0
  /// Maximum value: 86400
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  int? monotonicDurationSeconds;

  ActivitySessionV1CompletionStatusEnum completionStatus;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? appBuild;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? locale;

  ActivitySessionConsent consent;

  ActivitySessionProvenance provenance;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ActivitySessionV1 &&
    other.schemaVersion == schemaVersion &&
    other.playSessionId == playSessionId &&
    other.deviceId == deviceId &&
    other.contentVersionId == contentVersionId &&
    other.startedAt == startedAt &&
    other.endedAt == endedAt &&
    other.monotonicDurationSeconds == monotonicDurationSeconds &&
    other.completionStatus == completionStatus &&
    other.appBuild == appBuild &&
    other.locale == locale &&
    other.consent == consent &&
    other.provenance == provenance;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (schemaVersion.hashCode) +
    (playSessionId.hashCode) +
    (deviceId.hashCode) +
    (contentVersionId.hashCode) +
    (startedAt.hashCode) +
    (endedAt == null ? 0 : endedAt!.hashCode) +
    (monotonicDurationSeconds == null ? 0 : monotonicDurationSeconds!.hashCode) +
    (completionStatus.hashCode) +
    (appBuild == null ? 0 : appBuild!.hashCode) +
    (locale == null ? 0 : locale!.hashCode) +
    (consent.hashCode) +
    (provenance.hashCode);

  @override
  String toString() => 'ActivitySessionV1[schemaVersion=$schemaVersion, playSessionId=$playSessionId, deviceId=$deviceId, contentVersionId=$contentVersionId, startedAt=$startedAt, endedAt=$endedAt, monotonicDurationSeconds=$monotonicDurationSeconds, completionStatus=$completionStatus, appBuild=$appBuild, locale=$locale, consent=$consent, provenance=$provenance]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'schema_version'] = this.schemaVersion;
      json[r'play_session_id'] = this.playSessionId;
      json[r'device_id'] = this.deviceId;
      json[r'content_version_id'] = this.contentVersionId;
      json[r'started_at'] = this.startedAt;
    if (this.endedAt != null) {
      json[r'ended_at'] = this.endedAt;
    } else {
      json[r'ended_at'] = null;
    }
    if (this.monotonicDurationSeconds != null) {
      json[r'monotonic_duration_seconds'] = this.monotonicDurationSeconds;
    } else {
      json[r'monotonic_duration_seconds'] = null;
    }
      json[r'completion_status'] = this.completionStatus;
    if (this.appBuild != null) {
      json[r'app_build'] = this.appBuild;
    } else {
      json[r'app_build'] = null;
    }
    if (this.locale != null) {
      json[r'locale'] = this.locale;
    } else {
      json[r'locale'] = null;
    }
      json[r'consent'] = this.consent;
      json[r'provenance'] = this.provenance;
    return json;
  }

  /// Returns a new [ActivitySessionV1] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ActivitySessionV1? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'schema_version'), 'Required key "ActivitySessionV1[schema_version]" is missing from JSON.');
        assert(json[r'schema_version'] != null, 'Required key "ActivitySessionV1[schema_version]" has a null value in JSON.');
        assert(json.containsKey(r'play_session_id'), 'Required key "ActivitySessionV1[play_session_id]" is missing from JSON.');
        assert(json[r'play_session_id'] != null, 'Required key "ActivitySessionV1[play_session_id]" has a null value in JSON.');
        assert(json.containsKey(r'device_id'), 'Required key "ActivitySessionV1[device_id]" is missing from JSON.');
        assert(json[r'device_id'] != null, 'Required key "ActivitySessionV1[device_id]" has a null value in JSON.');
        assert(json.containsKey(r'content_version_id'), 'Required key "ActivitySessionV1[content_version_id]" is missing from JSON.');
        assert(json[r'content_version_id'] != null, 'Required key "ActivitySessionV1[content_version_id]" has a null value in JSON.');
        assert(json.containsKey(r'started_at'), 'Required key "ActivitySessionV1[started_at]" is missing from JSON.');
        assert(json[r'started_at'] != null, 'Required key "ActivitySessionV1[started_at]" has a null value in JSON.');
        assert(json.containsKey(r'completion_status'), 'Required key "ActivitySessionV1[completion_status]" is missing from JSON.');
        assert(json[r'completion_status'] != null, 'Required key "ActivitySessionV1[completion_status]" has a null value in JSON.');
        assert(json.containsKey(r'consent'), 'Required key "ActivitySessionV1[consent]" is missing from JSON.');
        assert(json[r'consent'] != null, 'Required key "ActivitySessionV1[consent]" has a null value in JSON.');
        assert(json.containsKey(r'provenance'), 'Required key "ActivitySessionV1[provenance]" is missing from JSON.');
        assert(json[r'provenance'] != null, 'Required key "ActivitySessionV1[provenance]" has a null value in JSON.');
        return true;
      }());

      return ActivitySessionV1(
        schemaVersion: ActivitySchemaVersion.fromJson(json[r'schema_version'])!,
        playSessionId: mapValueOfType<String>(json, r'play_session_id')!,
        deviceId: mapValueOfType<String>(json, r'device_id')!,
        contentVersionId: mapValueOfType<String>(json, r'content_version_id')!,
        startedAt: mapValueOfType<String>(json, r'started_at')!,
        endedAt: mapValueOfType<String>(json, r'ended_at'),
        monotonicDurationSeconds: mapValueOfType<int>(json, r'monotonic_duration_seconds'),
        completionStatus: ActivitySessionV1CompletionStatusEnum.fromJson(json[r'completion_status'])!,
        appBuild: mapValueOfType<String>(json, r'app_build'),
        locale: mapValueOfType<String>(json, r'locale'),
        consent: ActivitySessionConsent.fromJson(json[r'consent'])!,
        provenance: ActivitySessionProvenance.fromJson(json[r'provenance'])!,
      );
    }
    return null;
  }

  static List<ActivitySessionV1> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionV1>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionV1.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ActivitySessionV1> mapFromJson(dynamic json) {
    final map = <String, ActivitySessionV1>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ActivitySessionV1.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ActivitySessionV1-objects as value to a dart map
  static Map<String, List<ActivitySessionV1>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ActivitySessionV1>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ActivitySessionV1.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'schema_version',
    'play_session_id',
    'device_id',
    'content_version_id',
    'started_at',
    'completion_status',
    'consent',
    'provenance',
  };
}


enum ActivitySessionV1CompletionStatusEnum {
  started._(r'started'),
  completed._(r'completed'),
  abandoned._(r'abandoned'),
  interrupted._(r'interrupted'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivitySessionV1CompletionStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivitySessionV1CompletionStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivitySessionV1CompletionStatusEnum? fromJson(dynamic value) => ActivitySessionV1CompletionStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivitySessionV1CompletionStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivitySessionV1CompletionStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionV1CompletionStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionV1CompletionStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivitySessionV1CompletionStatusEnum] to String,
/// and [decode] dynamic data back to [ActivitySessionV1CompletionStatusEnum].
class ActivitySessionV1CompletionStatusEnumTypeTransformer {
  factory ActivitySessionV1CompletionStatusEnumTypeTransformer() => _instance ??= const ActivitySessionV1CompletionStatusEnumTypeTransformer._();

  const ActivitySessionV1CompletionStatusEnumTypeTransformer._();

  String encode(ActivitySessionV1CompletionStatusEnum data) => data._value;

  /// Returns the instance of [ActivitySessionV1CompletionStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivitySessionV1CompletionStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivitySessionV1CompletionStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'started': return ActivitySessionV1CompletionStatusEnum.started;
        case r'completed': return ActivitySessionV1CompletionStatusEnum.completed;
        case r'abandoned': return ActivitySessionV1CompletionStatusEnum.abandoned;
        case r'interrupted': return ActivitySessionV1CompletionStatusEnum.interrupted;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivitySessionV1CompletionStatusEnumTypeTransformer? _instance;
}


