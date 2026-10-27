//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class HealthStatus {
  /// Returns a new [HealthStatus] instance.
  HealthStatus({
    required this.status,
    required this.service,
    required this.timestamp,
  });

  /// Liveness indicator
  HealthStatusStatusEnum status;

  /// Stable service identifier
  HealthStatusServiceEnum service;

  /// UTC ISO-8601 timestamp when the check was produced
  DateTime timestamp;

  @override
  bool operator ==(Object other) => identical(this, other) || other is HealthStatus &&
    other.status == status &&
    other.service == service &&
    other.timestamp == timestamp;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (service.hashCode) +
    (timestamp.hashCode);

  @override
  String toString() => 'HealthStatus[status=$status, service=$service, timestamp=$timestamp]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
      json[r'service'] = this.service;
      json[r'timestamp'] = this.timestamp.toUtc().toIso8601String();
    return json;
  }

  /// Returns a new [HealthStatus] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static HealthStatus? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "HealthStatus[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "HealthStatus[status]" has a null value in JSON.');
        assert(json.containsKey(r'service'), 'Required key "HealthStatus[service]" is missing from JSON.');
        assert(json[r'service'] != null, 'Required key "HealthStatus[service]" has a null value in JSON.');
        assert(json.containsKey(r'timestamp'), 'Required key "HealthStatus[timestamp]" is missing from JSON.');
        assert(json[r'timestamp'] != null, 'Required key "HealthStatus[timestamp]" has a null value in JSON.');
        return true;
      }());

      return HealthStatus(
        status: HealthStatusStatusEnum.fromJson(json[r'status'])!,
        service: HealthStatusServiceEnum.fromJson(json[r'service'])!,
        timestamp: mapDateTime(json, r'timestamp', r'')!,
      );
    }
    return null;
  }

  static List<HealthStatus> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <HealthStatus>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = HealthStatus.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, HealthStatus> mapFromJson(dynamic json) {
    final map = <String, HealthStatus>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = HealthStatus.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of HealthStatus-objects as value to a dart map
  static Map<String, List<HealthStatus>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<HealthStatus>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = HealthStatus.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'service',
    'timestamp',
  };
}

/// Liveness indicator
enum HealthStatusStatusEnum {
  ok._(r'ok'),
  ;

  /// Instantiate a new enum with the provided value.
  const HealthStatusStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [HealthStatusStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static HealthStatusStatusEnum? fromJson(dynamic value) => HealthStatusStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [HealthStatusStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<HealthStatusStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <HealthStatusStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = HealthStatusStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [HealthStatusStatusEnum] to String,
/// and [decode] dynamic data back to [HealthStatusStatusEnum].
class HealthStatusStatusEnumTypeTransformer {
  factory HealthStatusStatusEnumTypeTransformer() => _instance ??= const HealthStatusStatusEnumTypeTransformer._();

  const HealthStatusStatusEnumTypeTransformer._();

  String encode(HealthStatusStatusEnum data) => data._value;

  /// Returns the instance of [HealthStatusStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  HealthStatusStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is HealthStatusStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'ok': return HealthStatusStatusEnum.ok;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static HealthStatusStatusEnumTypeTransformer? _instance;
}


/// Stable service identifier
enum HealthStatusServiceEnum {
  littleMindsBackend._(r'little-minds-backend'),
  ;

  /// Instantiate a new enum with the provided value.
  const HealthStatusServiceEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [HealthStatusServiceEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static HealthStatusServiceEnum? fromJson(dynamic value) => HealthStatusServiceEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [HealthStatusServiceEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<HealthStatusServiceEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <HealthStatusServiceEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = HealthStatusServiceEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [HealthStatusServiceEnum] to String,
/// and [decode] dynamic data back to [HealthStatusServiceEnum].
class HealthStatusServiceEnumTypeTransformer {
  factory HealthStatusServiceEnumTypeTransformer() => _instance ??= const HealthStatusServiceEnumTypeTransformer._();

  const HealthStatusServiceEnumTypeTransformer._();

  String encode(HealthStatusServiceEnum data) => data._value;

  /// Returns the instance of [HealthStatusServiceEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  HealthStatusServiceEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is HealthStatusServiceEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'little-minds-backend': return HealthStatusServiceEnum.littleMindsBackend;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static HealthStatusServiceEnumTypeTransformer? _instance;
}


