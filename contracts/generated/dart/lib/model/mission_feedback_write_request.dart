//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionFeedbackWriteRequest {
  /// Returns a new [MissionFeedbackWriteRequest] instance.
  MissionFeedbackWriteRequest({
    required this.schemaVersion,
    required this.idempotencyKey,
    required this.occurrenceId,
    required this.status,
  });

  MissionFeedbackWriteRequestSchemaVersionEnum schemaVersion;

  String idempotencyKey;

  String occurrenceId;

  MissionFeedbackWriteRequestStatusEnum status;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionFeedbackWriteRequest &&
    other.schemaVersion == schemaVersion &&
    other.idempotencyKey == idempotencyKey &&
    other.occurrenceId == occurrenceId &&
    other.status == status;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (schemaVersion.hashCode) +
    (idempotencyKey.hashCode) +
    (occurrenceId.hashCode) +
    (status.hashCode);

  @override
  String toString() => 'MissionFeedbackWriteRequest[schemaVersion=$schemaVersion, idempotencyKey=$idempotencyKey, occurrenceId=$occurrenceId, status=$status]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'schema_version'] = this.schemaVersion;
      json[r'idempotency_key'] = this.idempotencyKey;
      json[r'occurrence_id'] = this.occurrenceId;
      json[r'status'] = this.status;
    return json;
  }

  /// Returns a new [MissionFeedbackWriteRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionFeedbackWriteRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'schema_version'), 'Required key "MissionFeedbackWriteRequest[schema_version]" is missing from JSON.');
        assert(json[r'schema_version'] != null, 'Required key "MissionFeedbackWriteRequest[schema_version]" has a null value in JSON.');
        assert(json.containsKey(r'idempotency_key'), 'Required key "MissionFeedbackWriteRequest[idempotency_key]" is missing from JSON.');
        assert(json[r'idempotency_key'] != null, 'Required key "MissionFeedbackWriteRequest[idempotency_key]" has a null value in JSON.');
        assert(json.containsKey(r'occurrence_id'), 'Required key "MissionFeedbackWriteRequest[occurrence_id]" is missing from JSON.');
        assert(json[r'occurrence_id'] != null, 'Required key "MissionFeedbackWriteRequest[occurrence_id]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "MissionFeedbackWriteRequest[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "MissionFeedbackWriteRequest[status]" has a null value in JSON.');
        return true;
      }());

      return MissionFeedbackWriteRequest(
        schemaVersion: MissionFeedbackWriteRequestSchemaVersionEnum.fromJson(json[r'schema_version'])!,
        idempotencyKey: mapValueOfType<String>(json, r'idempotency_key')!,
        occurrenceId: mapValueOfType<String>(json, r'occurrence_id')!,
        status: MissionFeedbackWriteRequestStatusEnum.fromJson(json[r'status'])!,
      );
    }
    return null;
  }

  static List<MissionFeedbackWriteRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionFeedbackWriteRequest> mapFromJson(dynamic json) {
    final map = <String, MissionFeedbackWriteRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionFeedbackWriteRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionFeedbackWriteRequest-objects as value to a dart map
  static Map<String, List<MissionFeedbackWriteRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionFeedbackWriteRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionFeedbackWriteRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'schema_version',
    'idempotency_key',
    'occurrence_id',
    'status',
  };
}


enum MissionFeedbackWriteRequestSchemaVersionEnum {
  missionStatusV1._(r'mission-status-v1'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteRequestSchemaVersionEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteRequestSchemaVersionEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteRequestSchemaVersionEnum? fromJson(dynamic value) => MissionFeedbackWriteRequestSchemaVersionEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteRequestSchemaVersionEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteRequestSchemaVersionEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteRequestSchemaVersionEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteRequestSchemaVersionEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteRequestSchemaVersionEnum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteRequestSchemaVersionEnum].
class MissionFeedbackWriteRequestSchemaVersionEnumTypeTransformer {
  factory MissionFeedbackWriteRequestSchemaVersionEnumTypeTransformer() => _instance ??= const MissionFeedbackWriteRequestSchemaVersionEnumTypeTransformer._();

  const MissionFeedbackWriteRequestSchemaVersionEnumTypeTransformer._();

  String encode(MissionFeedbackWriteRequestSchemaVersionEnum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteRequestSchemaVersionEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteRequestSchemaVersionEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteRequestSchemaVersionEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'mission-status-v1': return MissionFeedbackWriteRequestSchemaVersionEnum.missionStatusV1;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteRequestSchemaVersionEnumTypeTransformer? _instance;
}



enum MissionFeedbackWriteRequestStatusEnum {
  completed._(r'completed'),
  skipped._(r'skipped'),
  notNow._(r'not_now'),
  partial._(r'partial'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionFeedbackWriteRequestStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionFeedbackWriteRequestStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionFeedbackWriteRequestStatusEnum? fromJson(dynamic value) => MissionFeedbackWriteRequestStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionFeedbackWriteRequestStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionFeedbackWriteRequestStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionFeedbackWriteRequestStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionFeedbackWriteRequestStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionFeedbackWriteRequestStatusEnum] to String,
/// and [decode] dynamic data back to [MissionFeedbackWriteRequestStatusEnum].
class MissionFeedbackWriteRequestStatusEnumTypeTransformer {
  factory MissionFeedbackWriteRequestStatusEnumTypeTransformer() => _instance ??= const MissionFeedbackWriteRequestStatusEnumTypeTransformer._();

  const MissionFeedbackWriteRequestStatusEnumTypeTransformer._();

  String encode(MissionFeedbackWriteRequestStatusEnum data) => data._value;

  /// Returns the instance of [MissionFeedbackWriteRequestStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionFeedbackWriteRequestStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionFeedbackWriteRequestStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'completed': return MissionFeedbackWriteRequestStatusEnum.completed;
        case r'skipped': return MissionFeedbackWriteRequestStatusEnum.skipped;
        case r'not_now': return MissionFeedbackWriteRequestStatusEnum.notNow;
        case r'partial': return MissionFeedbackWriteRequestStatusEnum.partial;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionFeedbackWriteRequestStatusEnumTypeTransformer? _instance;
}


