//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiRateMetric {
  /// Returns a new [SessionKpiRateMetric] instance.
  SessionKpiRateMetric({
    required this.availabilityStatus,
    this.value,
    this.reasonCode,
    required this.numerator,
    required this.denominator,
  });

  SessionKpiRateMetricAvailabilityStatusEnum availabilityStatus;

  /// Minimum value: 0
  /// Maximum value: 1
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? value;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? reasonCode;

  /// Minimum value: 0
  int numerator;

  /// Minimum value: 0
  int denominator;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiRateMetric &&
    other.availabilityStatus == availabilityStatus &&
    other.value == value &&
    other.reasonCode == reasonCode &&
    other.numerator == numerator &&
    other.denominator == denominator;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (availabilityStatus.hashCode) +
    (value == null ? 0 : value!.hashCode) +
    (reasonCode == null ? 0 : reasonCode!.hashCode) +
    (numerator.hashCode) +
    (denominator.hashCode);

  @override
  String toString() => 'SessionKpiRateMetric[availabilityStatus=$availabilityStatus, value=$value, reasonCode=$reasonCode, numerator=$numerator, denominator=$denominator]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'availability_status'] = this.availabilityStatus;
    if (this.value != null) {
      json[r'value'] = this.value;
    } else {
      json[r'value'] = null;
    }
    if (this.reasonCode != null) {
      json[r'reason_code'] = this.reasonCode;
    } else {
      json[r'reason_code'] = null;
    }
      json[r'numerator'] = this.numerator;
      json[r'denominator'] = this.denominator;
    return json;
  }

  /// Returns a new [SessionKpiRateMetric] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiRateMetric? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'availability_status'), 'Required key "SessionKpiRateMetric[availability_status]" is missing from JSON.');
        assert(json[r'availability_status'] != null, 'Required key "SessionKpiRateMetric[availability_status]" has a null value in JSON.');
        assert(json.containsKey(r'numerator'), 'Required key "SessionKpiRateMetric[numerator]" is missing from JSON.');
        assert(json[r'numerator'] != null, 'Required key "SessionKpiRateMetric[numerator]" has a null value in JSON.');
        assert(json.containsKey(r'denominator'), 'Required key "SessionKpiRateMetric[denominator]" is missing from JSON.');
        assert(json[r'denominator'] != null, 'Required key "SessionKpiRateMetric[denominator]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiRateMetric(
        availabilityStatus: SessionKpiRateMetricAvailabilityStatusEnum.fromJson(json[r'availability_status'])!,
        value: json[r'value'] == null
            ? null
            : num.parse('${json[r'value']}'),
        reasonCode: mapValueOfType<String>(json, r'reason_code'),
        numerator: mapValueOfType<int>(json, r'numerator')!,
        denominator: mapValueOfType<int>(json, r'denominator')!,
      );
    }
    return null;
  }

  static List<SessionKpiRateMetric> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiRateMetric>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiRateMetric.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiRateMetric> mapFromJson(dynamic json) {
    final map = <String, SessionKpiRateMetric>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiRateMetric.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiRateMetric-objects as value to a dart map
  static Map<String, List<SessionKpiRateMetric>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiRateMetric>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiRateMetric.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'availability_status',
    'numerator',
    'denominator',
  };
}


enum SessionKpiRateMetricAvailabilityStatusEnum {
  available._(r'available'),
  unavailable._(r'unavailable'),
  ;

  /// Instantiate a new enum with the provided value.
  const SessionKpiRateMetricAvailabilityStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [SessionKpiRateMetricAvailabilityStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static SessionKpiRateMetricAvailabilityStatusEnum? fromJson(dynamic value) => SessionKpiRateMetricAvailabilityStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [SessionKpiRateMetricAvailabilityStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<SessionKpiRateMetricAvailabilityStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiRateMetricAvailabilityStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiRateMetricAvailabilityStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [SessionKpiRateMetricAvailabilityStatusEnum] to String,
/// and [decode] dynamic data back to [SessionKpiRateMetricAvailabilityStatusEnum].
class SessionKpiRateMetricAvailabilityStatusEnumTypeTransformer {
  factory SessionKpiRateMetricAvailabilityStatusEnumTypeTransformer() => _instance ??= const SessionKpiRateMetricAvailabilityStatusEnumTypeTransformer._();

  const SessionKpiRateMetricAvailabilityStatusEnumTypeTransformer._();

  String encode(SessionKpiRateMetricAvailabilityStatusEnum data) => data._value;

  /// Returns the instance of [SessionKpiRateMetricAvailabilityStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  SessionKpiRateMetricAvailabilityStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is SessionKpiRateMetricAvailabilityStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'available': return SessionKpiRateMetricAvailabilityStatusEnum.available;
        case r'unavailable': return SessionKpiRateMetricAvailabilityStatusEnum.unavailable;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static SessionKpiRateMetricAvailabilityStatusEnumTypeTransformer? _instance;
}


