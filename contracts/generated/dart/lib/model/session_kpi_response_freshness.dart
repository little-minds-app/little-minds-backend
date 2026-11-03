//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiResponseFreshness {
  /// Returns a new [SessionKpiResponseFreshness] instance.
  SessionKpiResponseFreshness({
    required this.status,
    required this.staleThresholdSeconds,
    required this.dataCompleteness,
  });

  SessionKpiResponseFreshnessStatusEnum status;

  /// Minimum value: 1
  int staleThresholdSeconds;

  SessionKpiResponseFreshnessDataCompletenessEnum dataCompleteness;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiResponseFreshness &&
    other.status == status &&
    other.staleThresholdSeconds == staleThresholdSeconds &&
    other.dataCompleteness == dataCompleteness;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (staleThresholdSeconds.hashCode) +
    (dataCompleteness.hashCode);

  @override
  String toString() => 'SessionKpiResponseFreshness[status=$status, staleThresholdSeconds=$staleThresholdSeconds, dataCompleteness=$dataCompleteness]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
      json[r'stale_threshold_seconds'] = this.staleThresholdSeconds;
      json[r'data_completeness'] = this.dataCompleteness;
    return json;
  }

  /// Returns a new [SessionKpiResponseFreshness] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiResponseFreshness? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "SessionKpiResponseFreshness[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "SessionKpiResponseFreshness[status]" has a null value in JSON.');
        assert(json.containsKey(r'stale_threshold_seconds'), 'Required key "SessionKpiResponseFreshness[stale_threshold_seconds]" is missing from JSON.');
        assert(json[r'stale_threshold_seconds'] != null, 'Required key "SessionKpiResponseFreshness[stale_threshold_seconds]" has a null value in JSON.');
        assert(json.containsKey(r'data_completeness'), 'Required key "SessionKpiResponseFreshness[data_completeness]" is missing from JSON.');
        assert(json[r'data_completeness'] != null, 'Required key "SessionKpiResponseFreshness[data_completeness]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiResponseFreshness(
        status: SessionKpiResponseFreshnessStatusEnum.fromJson(json[r'status'])!,
        staleThresholdSeconds: mapValueOfType<int>(json, r'stale_threshold_seconds')!,
        dataCompleteness: SessionKpiResponseFreshnessDataCompletenessEnum.fromJson(json[r'data_completeness'])!,
      );
    }
    return null;
  }

  static List<SessionKpiResponseFreshness> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseFreshness>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseFreshness.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiResponseFreshness> mapFromJson(dynamic json) {
    final map = <String, SessionKpiResponseFreshness>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiResponseFreshness.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiResponseFreshness-objects as value to a dart map
  static Map<String, List<SessionKpiResponseFreshness>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiResponseFreshness>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiResponseFreshness.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'stale_threshold_seconds',
    'data_completeness',
  };
}


enum SessionKpiResponseFreshnessStatusEnum {
  fresh._(r'fresh'),
  stale._(r'stale'),
  noData._(r'no_data'),
  unknown._(r'unknown'),
  ;

  /// Instantiate a new enum with the provided value.
  const SessionKpiResponseFreshnessStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [SessionKpiResponseFreshnessStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static SessionKpiResponseFreshnessStatusEnum? fromJson(dynamic value) => SessionKpiResponseFreshnessStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [SessionKpiResponseFreshnessStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<SessionKpiResponseFreshnessStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseFreshnessStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseFreshnessStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [SessionKpiResponseFreshnessStatusEnum] to String,
/// and [decode] dynamic data back to [SessionKpiResponseFreshnessStatusEnum].
class SessionKpiResponseFreshnessStatusEnumTypeTransformer {
  factory SessionKpiResponseFreshnessStatusEnumTypeTransformer() => _instance ??= const SessionKpiResponseFreshnessStatusEnumTypeTransformer._();

  const SessionKpiResponseFreshnessStatusEnumTypeTransformer._();

  String encode(SessionKpiResponseFreshnessStatusEnum data) => data._value;

  /// Returns the instance of [SessionKpiResponseFreshnessStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  SessionKpiResponseFreshnessStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is SessionKpiResponseFreshnessStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'fresh': return SessionKpiResponseFreshnessStatusEnum.fresh;
        case r'stale': return SessionKpiResponseFreshnessStatusEnum.stale;
        case r'no_data': return SessionKpiResponseFreshnessStatusEnum.noData;
        case r'unknown': return SessionKpiResponseFreshnessStatusEnum.unknown;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static SessionKpiResponseFreshnessStatusEnumTypeTransformer? _instance;
}



enum SessionKpiResponseFreshnessDataCompletenessEnum {
  complete._(r'complete'),
  partial._(r'partial'),
  unknown._(r'unknown'),
  ;

  /// Instantiate a new enum with the provided value.
  const SessionKpiResponseFreshnessDataCompletenessEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [SessionKpiResponseFreshnessDataCompletenessEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static SessionKpiResponseFreshnessDataCompletenessEnum? fromJson(dynamic value) => SessionKpiResponseFreshnessDataCompletenessEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [SessionKpiResponseFreshnessDataCompletenessEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<SessionKpiResponseFreshnessDataCompletenessEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseFreshnessDataCompletenessEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseFreshnessDataCompletenessEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [SessionKpiResponseFreshnessDataCompletenessEnum] to String,
/// and [decode] dynamic data back to [SessionKpiResponseFreshnessDataCompletenessEnum].
class SessionKpiResponseFreshnessDataCompletenessEnumTypeTransformer {
  factory SessionKpiResponseFreshnessDataCompletenessEnumTypeTransformer() => _instance ??= const SessionKpiResponseFreshnessDataCompletenessEnumTypeTransformer._();

  const SessionKpiResponseFreshnessDataCompletenessEnumTypeTransformer._();

  String encode(SessionKpiResponseFreshnessDataCompletenessEnum data) => data._value;

  /// Returns the instance of [SessionKpiResponseFreshnessDataCompletenessEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  SessionKpiResponseFreshnessDataCompletenessEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is SessionKpiResponseFreshnessDataCompletenessEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'complete': return SessionKpiResponseFreshnessDataCompletenessEnum.complete;
        case r'partial': return SessionKpiResponseFreshnessDataCompletenessEnum.partial;
        case r'unknown': return SessionKpiResponseFreshnessDataCompletenessEnum.unknown;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static SessionKpiResponseFreshnessDataCompletenessEnumTypeTransformer? _instance;
}


