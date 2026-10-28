//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ReadinessStatus {
  /// Returns a new [ReadinessStatus] instance.
  ReadinessStatus({
    required this.status,
    required this.service,
    required this.timestamp,
    required this.checks,
  });

  /// Readiness indicator (not_ready → HTTP 503)
  ReadinessStatusStatusEnum status;

  /// Stable service identifier
  ReadinessStatusServiceEnum service;

  /// UTC ISO-8601 timestamp when the check was produced
  DateTime timestamp;

  ReadinessStatusChecks checks;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ReadinessStatus &&
    other.status == status &&
    other.service == service &&
    other.timestamp == timestamp &&
    other.checks == checks;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (service.hashCode) +
    (timestamp.hashCode) +
    (checks.hashCode);

  @override
  String toString() => 'ReadinessStatus[status=$status, service=$service, timestamp=$timestamp, checks=$checks]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
      json[r'service'] = this.service;
      json[r'timestamp'] = this.timestamp.toUtc().toIso8601String();
      json[r'checks'] = this.checks;
    return json;
  }

  /// Returns a new [ReadinessStatus] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ReadinessStatus? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "ReadinessStatus[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "ReadinessStatus[status]" has a null value in JSON.');
        assert(json.containsKey(r'service'), 'Required key "ReadinessStatus[service]" is missing from JSON.');
        assert(json[r'service'] != null, 'Required key "ReadinessStatus[service]" has a null value in JSON.');
        assert(json.containsKey(r'timestamp'), 'Required key "ReadinessStatus[timestamp]" is missing from JSON.');
        assert(json[r'timestamp'] != null, 'Required key "ReadinessStatus[timestamp]" has a null value in JSON.');
        assert(json.containsKey(r'checks'), 'Required key "ReadinessStatus[checks]" is missing from JSON.');
        assert(json[r'checks'] != null, 'Required key "ReadinessStatus[checks]" has a null value in JSON.');
        return true;
      }());

      return ReadinessStatus(
        status: ReadinessStatusStatusEnum.fromJson(json[r'status'])!,
        service: ReadinessStatusServiceEnum.fromJson(json[r'service'])!,
        timestamp: mapDateTime(json, r'timestamp', r'')!,
        checks: ReadinessStatusChecks.fromJson(json[r'checks'])!,
      );
    }
    return null;
  }

  static List<ReadinessStatus> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ReadinessStatus>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ReadinessStatus.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ReadinessStatus> mapFromJson(dynamic json) {
    final map = <String, ReadinessStatus>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ReadinessStatus.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ReadinessStatus-objects as value to a dart map
  static Map<String, List<ReadinessStatus>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ReadinessStatus>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ReadinessStatus.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'service',
    'timestamp',
    'checks',
  };
}

/// Readiness indicator (not_ready → HTTP 503)
enum ReadinessStatusStatusEnum {
  ok._(r'ok'),
  notReady._(r'not_ready'),
  ;

  /// Instantiate a new enum with the provided value.
  const ReadinessStatusStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ReadinessStatusStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ReadinessStatusStatusEnum? fromJson(dynamic value) => ReadinessStatusStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ReadinessStatusStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ReadinessStatusStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ReadinessStatusStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ReadinessStatusStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ReadinessStatusStatusEnum] to String,
/// and [decode] dynamic data back to [ReadinessStatusStatusEnum].
class ReadinessStatusStatusEnumTypeTransformer {
  factory ReadinessStatusStatusEnumTypeTransformer() => _instance ??= const ReadinessStatusStatusEnumTypeTransformer._();

  const ReadinessStatusStatusEnumTypeTransformer._();

  String encode(ReadinessStatusStatusEnum data) => data._value;

  /// Returns the instance of [ReadinessStatusStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ReadinessStatusStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ReadinessStatusStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'ok': return ReadinessStatusStatusEnum.ok;
        case r'not_ready': return ReadinessStatusStatusEnum.notReady;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ReadinessStatusStatusEnumTypeTransformer? _instance;
}


/// Stable service identifier
enum ReadinessStatusServiceEnum {
  littleMindsBackend._(r'little-minds-backend'),
  ;

  /// Instantiate a new enum with the provided value.
  const ReadinessStatusServiceEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ReadinessStatusServiceEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ReadinessStatusServiceEnum? fromJson(dynamic value) => ReadinessStatusServiceEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ReadinessStatusServiceEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ReadinessStatusServiceEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ReadinessStatusServiceEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ReadinessStatusServiceEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ReadinessStatusServiceEnum] to String,
/// and [decode] dynamic data back to [ReadinessStatusServiceEnum].
class ReadinessStatusServiceEnumTypeTransformer {
  factory ReadinessStatusServiceEnumTypeTransformer() => _instance ??= const ReadinessStatusServiceEnumTypeTransformer._();

  const ReadinessStatusServiceEnumTypeTransformer._();

  String encode(ReadinessStatusServiceEnum data) => data._value;

  /// Returns the instance of [ReadinessStatusServiceEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ReadinessStatusServiceEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ReadinessStatusServiceEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'little-minds-backend': return ReadinessStatusServiceEnum.littleMindsBackend;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ReadinessStatusServiceEnumTypeTransformer? _instance;
}


