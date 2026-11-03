//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionStatusListResponse {
  /// Returns a new [MissionStatusListResponse] instance.
  MissionStatusListResponse({
    required this.schemaVersion,
    required this.definitionVersion,
    required this.generatedAt,
    required this.childId,
    required this.window,
    this.items = const [],
    required this.pagination,
  });

  MissionStatusListResponseSchemaVersionEnum schemaVersion;

  MissionStatusListResponseDefinitionVersionEnum definitionVersion;

  DateTime generatedAt;

  String childId;

  MissionStatusListResponseWindow window;

  List<MissionStatusOccurrenceRow> items;

  MissionStatusListResponsePagination pagination;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionStatusListResponse &&
    other.schemaVersion == schemaVersion &&
    other.definitionVersion == definitionVersion &&
    other.generatedAt == generatedAt &&
    other.childId == childId &&
    other.window == window &&
    _deepEquality.equals(other.items, items) &&
    other.pagination == pagination;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (schemaVersion.hashCode) +
    (definitionVersion.hashCode) +
    (generatedAt.hashCode) +
    (childId.hashCode) +
    (window.hashCode) +
    (items.hashCode) +
    (pagination.hashCode);

  @override
  String toString() => 'MissionStatusListResponse[schemaVersion=$schemaVersion, definitionVersion=$definitionVersion, generatedAt=$generatedAt, childId=$childId, window=$window, items=$items, pagination=$pagination]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'schema_version'] = this.schemaVersion;
      json[r'definition_version'] = this.definitionVersion;
      json[r'generated_at'] = this.generatedAt.toUtc().toIso8601String();
      json[r'child_id'] = this.childId;
      json[r'window'] = this.window;
      json[r'items'] = this.items;
      json[r'pagination'] = this.pagination;
    return json;
  }

  /// Returns a new [MissionStatusListResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionStatusListResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'schema_version'), 'Required key "MissionStatusListResponse[schema_version]" is missing from JSON.');
        assert(json[r'schema_version'] != null, 'Required key "MissionStatusListResponse[schema_version]" has a null value in JSON.');
        assert(json.containsKey(r'definition_version'), 'Required key "MissionStatusListResponse[definition_version]" is missing from JSON.');
        assert(json[r'definition_version'] != null, 'Required key "MissionStatusListResponse[definition_version]" has a null value in JSON.');
        assert(json.containsKey(r'generated_at'), 'Required key "MissionStatusListResponse[generated_at]" is missing from JSON.');
        assert(json[r'generated_at'] != null, 'Required key "MissionStatusListResponse[generated_at]" has a null value in JSON.');
        assert(json.containsKey(r'child_id'), 'Required key "MissionStatusListResponse[child_id]" is missing from JSON.');
        assert(json[r'child_id'] != null, 'Required key "MissionStatusListResponse[child_id]" has a null value in JSON.');
        assert(json.containsKey(r'window'), 'Required key "MissionStatusListResponse[window]" is missing from JSON.');
        assert(json[r'window'] != null, 'Required key "MissionStatusListResponse[window]" has a null value in JSON.');
        assert(json.containsKey(r'items'), 'Required key "MissionStatusListResponse[items]" is missing from JSON.');
        assert(json[r'items'] != null, 'Required key "MissionStatusListResponse[items]" has a null value in JSON.');
        assert(json.containsKey(r'pagination'), 'Required key "MissionStatusListResponse[pagination]" is missing from JSON.');
        assert(json[r'pagination'] != null, 'Required key "MissionStatusListResponse[pagination]" has a null value in JSON.');
        return true;
      }());

      return MissionStatusListResponse(
        schemaVersion: MissionStatusListResponseSchemaVersionEnum.fromJson(json[r'schema_version'])!,
        definitionVersion: MissionStatusListResponseDefinitionVersionEnum.fromJson(json[r'definition_version'])!,
        generatedAt: mapDateTime(json, r'generated_at', r'')!,
        childId: mapValueOfType<String>(json, r'child_id')!,
        window: MissionStatusListResponseWindow.fromJson(json[r'window'])!,
        items: MissionStatusOccurrenceRow.listFromJson(json[r'items']),
        pagination: MissionStatusListResponsePagination.fromJson(json[r'pagination'])!,
      );
    }
    return null;
  }

  static List<MissionStatusListResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusListResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusListResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionStatusListResponse> mapFromJson(dynamic json) {
    final map = <String, MissionStatusListResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionStatusListResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionStatusListResponse-objects as value to a dart map
  static Map<String, List<MissionStatusListResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionStatusListResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionStatusListResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'schema_version',
    'definition_version',
    'generated_at',
    'child_id',
    'window',
    'items',
    'pagination',
  };
}


enum MissionStatusListResponseSchemaVersionEnum {
  missionStatusV1._(r'mission-status-v1'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionStatusListResponseSchemaVersionEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionStatusListResponseSchemaVersionEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionStatusListResponseSchemaVersionEnum? fromJson(dynamic value) => MissionStatusListResponseSchemaVersionEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionStatusListResponseSchemaVersionEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionStatusListResponseSchemaVersionEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusListResponseSchemaVersionEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusListResponseSchemaVersionEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionStatusListResponseSchemaVersionEnum] to String,
/// and [decode] dynamic data back to [MissionStatusListResponseSchemaVersionEnum].
class MissionStatusListResponseSchemaVersionEnumTypeTransformer {
  factory MissionStatusListResponseSchemaVersionEnumTypeTransformer() => _instance ??= const MissionStatusListResponseSchemaVersionEnumTypeTransformer._();

  const MissionStatusListResponseSchemaVersionEnumTypeTransformer._();

  String encode(MissionStatusListResponseSchemaVersionEnum data) => data._value;

  /// Returns the instance of [MissionStatusListResponseSchemaVersionEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionStatusListResponseSchemaVersionEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionStatusListResponseSchemaVersionEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'mission-status-v1': return MissionStatusListResponseSchemaVersionEnum.missionStatusV1;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionStatusListResponseSchemaVersionEnumTypeTransformer? _instance;
}



enum MissionStatusListResponseDefinitionVersionEnum {
  missionStatusV1._(r'mission-status-v1'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionStatusListResponseDefinitionVersionEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionStatusListResponseDefinitionVersionEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionStatusListResponseDefinitionVersionEnum? fromJson(dynamic value) => MissionStatusListResponseDefinitionVersionEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionStatusListResponseDefinitionVersionEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionStatusListResponseDefinitionVersionEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusListResponseDefinitionVersionEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusListResponseDefinitionVersionEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionStatusListResponseDefinitionVersionEnum] to String,
/// and [decode] dynamic data back to [MissionStatusListResponseDefinitionVersionEnum].
class MissionStatusListResponseDefinitionVersionEnumTypeTransformer {
  factory MissionStatusListResponseDefinitionVersionEnumTypeTransformer() => _instance ??= const MissionStatusListResponseDefinitionVersionEnumTypeTransformer._();

  const MissionStatusListResponseDefinitionVersionEnumTypeTransformer._();

  String encode(MissionStatusListResponseDefinitionVersionEnum data) => data._value;

  /// Returns the instance of [MissionStatusListResponseDefinitionVersionEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionStatusListResponseDefinitionVersionEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionStatusListResponseDefinitionVersionEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'mission-status-v1': return MissionStatusListResponseDefinitionVersionEnum.missionStatusV1;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionStatusListResponseDefinitionVersionEnumTypeTransformer? _instance;
}


