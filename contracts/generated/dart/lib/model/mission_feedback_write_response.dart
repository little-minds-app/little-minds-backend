//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionFeedbackWriteResponse {
  /// Returns a new [MissionFeedbackWriteResponse] instance.
  MissionFeedbackWriteResponse({
    required this.schemaVersion,
    required this.status,
    required this.assertionId,
    required this.childId,
    required this.missionId,
    required this.occurrenceId,
    required this.reportStatus,
    required this.authoritative,
    required this.recordedAt,
    required this.revision,
    required this.actor,
    required this.source_,
  });

  MissionFeedbackWriteResponseSchemaVersionEnum schemaVersion;

  MissionFeedbackWriteResponseStatusEnum status;

  String assertionId;

  String childId;

  String missionId;

  String occurrenceId;

  MissionFeedbackWriteResponseReportStatusEnum reportStatus;

  bool authoritative;

  DateTime recordedAt;

  /// Minimum value: 1
  int revision;

  MissionFeedbackWriteResponseActorEnum actor;

  MissionFeedbackWriteResponseSource_Enum source_;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionFeedbackWriteResponse &&
    other.schemaVersion == schemaVersion &&
    other.status == status &&
    other.assertionId == assertionId &&
    other.childId == childId &&
    other.missionId == missionId &&
    other.occurrenceId == occurrenceId &&
    other.reportStatus == reportStatus &&
    other.authoritative == authoritative &&
    other.recordedAt == recordedAt &&
    other.revision == revision &&
    other.actor == actor &&
    other.source_ == source_;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (schemaVersion.hashCode) +
    (status.hashCode) +
    (assertionId.hashCode) +
    (childId.hashCode) +
    (missionId.hashCode) +
    (occurrenceId.hashCode) +
    (reportStatus.hashCode) +
    (authoritative.hashCode) +
    (recordedAt.hashCode) +
    (revision.hashCode) +
    (actor.hashCode) +
    (source_.hashCode);

  @override
  String toString() => 'MissionFeedbackWriteResponse[schemaVersion=$schemaVersion, status=$status, assertionId=$assertionId, childId=$childId, missionId=$missionId, occurrenceId=$occurrenceId, reportStatus=$reportStatus, authoritative=$authoritative, recordedAt=$recordedAt, revision=$revision, actor=$actor, source_=$source_]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'schema_version'] = this.schemaVersion;
      json[r'status'] = this.status;
      json[r'assertion_id'] = this.assertionId;
      json[r'child_id'] = this.childId;
      json[r'mission_id'] = this.missionId;
      json[r'occurrence_id'] = this.occurrenceId;
      json[r'report_status'] = this.reportStatus;
      json[r'authoritative'] = this.authoritative;
      json[r'recorded_at'] = this.recordedAt.toUtc().toIso8601String();
      json[r'revision'] = this.revision;
      json[r'actor'] = this.actor;
      json[r'source'] = this.source_;
    return json;
  }

  /// Returns a new [MissionFeedbackWriteResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionFeedbackWriteResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'schema_version'), 'Required key "MissionFeedbackWriteResponse[schema_version]" is missing from JSON.');
        assert(json[r'schema_version'] != null, 'Required key "MissionFeedbackWriteResponse[schema_version]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "MissionFeedbackWriteResponse[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "MissionFeedbackWriteResponse[status]" has a null value in JSON.');
        assert(json.containsKey(r'assertion_id'), 'Required key "MissionFeedbackWriteResponse[assertion_id]" is missing from JSON.');
        assert(json[r'assertion_id'] != null, 'Required key "MissionFeedbackWriteResponse[assertion_id]" has a null value in JSON.');
        assert(json.containsKey(r'child_id'), 'Required key "MissionFeedbackWriteResponse[child_id]" is missing from JSON.');
        assert(json[r'child_id'] != null, 'Required key "MissionFeedbackWriteResponse[child_id]" has a null value in JSON.');
        assert(json.containsKey(r'mission_id'), 'Required key "MissionFeedbackWriteResponse[mission_id]" is missing from JSON.');
        assert(json[r'mission_id'] != null, 'Required key "MissionFeedbackWriteResponse[mission_id]" has a null value in JSON.');
        assert(json.containsKey(r'occurrence_id'), 'Required key "MissionFeedbackWriteResponse[occurrence_id]" is missing from JSON.');
        assert(json[r'occurrence_id'] != null, 'Required key "MissionFeedbackWriteResponse[occurrence_id]" has a null value in JSON.');
        assert(json.containsKey(r'report_status'), 'Required key "MissionFeedbackWriteResponse[report_status]" is missing from JSON.');
        assert(json[r'report_status'] != null, 'Required key "MissionFeedbackWriteResponse[report_status]" has a null value in JSON.');
        assert(json.containsKey(r'authoritative'), 'Required key "MissionFeedbackWriteResponse[authoritative]" is missing from JSON.');
        assert(json[r'authoritative'] != null, 'Required key "MissionFeedbackWriteResponse[authoritative]" has a null value in JSON.');
        assert(json.containsKey(r'recorded_at'), 'Required key "MissionFeedbackWriteResponse[recorded_at]" is missing from JSON.');
        assert(json[r'recorded_at'] != null, 'Required key "MissionFeedbackWriteResponse[recorded_at]" has a null value in JSON.');
        assert(json.containsKey(r'revision'), 'Required key "MissionFeedbackWriteResponse[revision]" is missing from JSON.');
        assert(json[r'revision'] != null, 'Required key "MissionFeedbackWriteResponse[revision]" has a null value in JSON.');
        assert(json.containsKey(r'actor'), 'Required key "MissionFeedbackWriteResponse[actor]" is missing from JSON.');
        assert(json[r'actor'] != null, 'Required key "MissionFeedbackWriteResponse[actor]" has a null value in JSON.');
        assert(json.containsKey(r'source'), 'Required key "MissionFeedbackWriteResponse[source]" is missing from JSON.');
        assert(json[r'source'] != null, 'Required key "MissionFeedbackWriteResponse[source]" has a null value in JSON.');
        return true;
      }());

      return MissionFeedbackWriteResponse(
        schemaVersion: MissionFeedbackWriteResponseSchemaVersionEnum.fromJson(json[r'schema_version'])!,
        status: MissionFeedbackWriteResponseStatusEnum.fromJson(json[r'status'])!,
        assertionId: mapValueOfType<String>(json, r'assertion_id')!,
        childId: mapValueOfType<String>(json, r'child_id')!,
        missionId: mapValueOfType<String>(json, r'mission_id')!,
        occurrenceId: mapValueOfType<String>(json, r'occurrence_id')!,
        reportStatus: MissionFeedbackWriteResponseReportStatusEnum.fromJson(json[r'report_status'])!,
        authoritative: mapValueOfType<bool>(json, r'authoritative')!,
        recordedAt: mapDateTime(json, r'recorded_at', r'')!,
        revision: mapValueOfType<int>(json, r'revision')!,
        actor: MissionFeedbackWriteResponseActorEnum.fromJson(json[r'actor'])!,
        source_: MissionFeedbackWriteResponseSource_Enum.fromJson(json[r'source'])!,
      );
    }
    return null;
  }

  static List<MissionFeedbackWriteResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionFeedbackWriteResponse> mapFromJson(dynamic json) {
    final map = <String, MissionFeedbackWriteResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionFeedbackWriteResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionFeedbackWriteResponse-objects as value to a dart map
  static Map<String, List<MissionFeedbackWriteResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionFeedbackWriteResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionFeedbackWriteResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'schema_version',
    'status',
    'assertion_id',
    'child_id',
    'mission_id',
    'occurrence_id',
    'report_status',
    'authoritative',
    'recorded_at',
    'revision',
    'actor',
    'source',
  };
}


enum MissionFeedbackWriteResponseSchemaVersionEnum {
  missionStatusV1._(r'mission-status-v1'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteResponseSchemaVersionEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteResponseSchemaVersionEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteResponseSchemaVersionEnum? fromJson(dynamic value) => MissionFeedbackWriteResponseSchemaVersionEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteResponseSchemaVersionEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteResponseSchemaVersionEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteResponseSchemaVersionEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteResponseSchemaVersionEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteResponseSchemaVersionEnum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteResponseSchemaVersionEnum].
class MissionFeedbackWriteResponseSchemaVersionEnumTypeTransformer {
  factory MissionFeedbackWriteResponseSchemaVersionEnumTypeTransformer() => _instance ??= const MissionFeedbackWriteResponseSchemaVersionEnumTypeTransformer._();

  const MissionFeedbackWriteResponseSchemaVersionEnumTypeTransformer._();

  String encode(MissionFeedbackWriteResponseSchemaVersionEnum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteResponseSchemaVersionEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteResponseSchemaVersionEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteResponseSchemaVersionEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'mission-status-v1': return MissionFeedbackWriteResponseSchemaVersionEnum.missionStatusV1;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteResponseSchemaVersionEnumTypeTransformer? _instance;
}



enum MissionFeedbackWriteResponseStatusEnum {
  accepted._(r'accepted'),
  duplicateNoop._(r'duplicate_noop'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteResponseStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteResponseStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteResponseStatusEnum? fromJson(dynamic value) => MissionFeedbackWriteResponseStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteResponseStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteResponseStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteResponseStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteResponseStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteResponseStatusEnum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteResponseStatusEnum].
class MissionFeedbackWriteResponseStatusEnumTypeTransformer {
  factory MissionFeedbackWriteResponseStatusEnumTypeTransformer() => _instance ??= const MissionFeedbackWriteResponseStatusEnumTypeTransformer._();

  const MissionFeedbackWriteResponseStatusEnumTypeTransformer._();

  String encode(MissionFeedbackWriteResponseStatusEnum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteResponseStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteResponseStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteResponseStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'accepted': return MissionFeedbackWriteResponseStatusEnum.accepted;
        case r'duplicate_noop': return MissionFeedbackWriteResponseStatusEnum.duplicateNoop;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteResponseStatusEnumTypeTransformer? _instance;
}



enum MissionFeedbackWriteResponseReportStatusEnum {
  completed._(r'completed'),
  skipped._(r'skipped'),
  notNow._(r'not_now'),
  partial._(r'partial'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteResponseReportStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteResponseReportStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteResponseReportStatusEnum? fromJson(dynamic value) => MissionFeedbackWriteResponseReportStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteResponseReportStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteResponseReportStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteResponseReportStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteResponseReportStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteResponseReportStatusEnum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteResponseReportStatusEnum].
class MissionFeedbackWriteResponseReportStatusEnumTypeTransformer {
  factory MissionFeedbackWriteResponseReportStatusEnumTypeTransformer() => _instance ??= const MissionFeedbackWriteResponseReportStatusEnumTypeTransformer._();

  const MissionFeedbackWriteResponseReportStatusEnumTypeTransformer._();

  String encode(MissionFeedbackWriteResponseReportStatusEnum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteResponseReportStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteResponseReportStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteResponseReportStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'completed': return MissionFeedbackWriteResponseReportStatusEnum.completed;
        case r'skipped': return MissionFeedbackWriteResponseReportStatusEnum.skipped;
        case r'not_now': return MissionFeedbackWriteResponseReportStatusEnum.notNow;
        case r'partial': return MissionFeedbackWriteResponseReportStatusEnum.partial;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteResponseReportStatusEnumTypeTransformer? _instance;
}



enum MissionFeedbackWriteResponseActorEnum {
  parent._(r'parent'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteResponseActorEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteResponseActorEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteResponseActorEnum? fromJson(dynamic value) => MissionFeedbackWriteResponseActorEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteResponseActorEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteResponseActorEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteResponseActorEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteResponseActorEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteResponseActorEnum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteResponseActorEnum].
class MissionFeedbackWriteResponseActorEnumTypeTransformer {
  factory MissionFeedbackWriteResponseActorEnumTypeTransformer() => _instance ??= const MissionFeedbackWriteResponseActorEnumTypeTransformer._();

  const MissionFeedbackWriteResponseActorEnumTypeTransformer._();

  String encode(MissionFeedbackWriteResponseActorEnum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteResponseActorEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteResponseActorEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteResponseActorEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'parent': return MissionFeedbackWriteResponseActorEnum.parent;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteResponseActorEnumTypeTransformer? _instance;
}



enum MissionFeedbackWriteResponseSource_Enum {
  caregiverReport._(r'caregiver_report'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteResponseSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteResponseSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteResponseSource_Enum? fromJson(dynamic value) => MissionFeedbackWriteResponseSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteResponseSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteResponseSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteResponseSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteResponseSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteResponseSource_Enum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteResponseSource_Enum].
class MissionFeedbackWriteResponseSource_EnumTypeTransformer {
  factory MissionFeedbackWriteResponseSource_EnumTypeTransformer() => _instance ??= const MissionFeedbackWriteResponseSource_EnumTypeTransformer._();

  const MissionFeedbackWriteResponseSource_EnumTypeTransformer._();

  String encode(MissionFeedbackWriteResponseSource_Enum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteResponseSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteResponseSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteResponseSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'caregiver_report': return MissionFeedbackWriteResponseSource_Enum.caregiverReport;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteResponseSource_EnumTypeTransformer? _instance;
}


