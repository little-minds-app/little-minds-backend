//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiResponseWindow {
  /// Returns a new [SessionKpiResponseWindow] instance.
  SessionKpiResponseWindow({
    required this.from,
    required this.to,
    required this.timezone,
    required this.bounds,
  });

  DateTime from;

  DateTime to;

  String timezone;

  SessionKpiResponseWindowBoundsEnum bounds;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiResponseWindow &&
    other.from == from &&
    other.to == to &&
    other.timezone == timezone &&
    other.bounds == bounds;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (from.hashCode) +
    (to.hashCode) +
    (timezone.hashCode) +
    (bounds.hashCode);

  @override
  String toString() => 'SessionKpiResponseWindow[from=$from, to=$to, timezone=$timezone, bounds=$bounds]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'from'] = this.from.toUtc().toIso8601String();
      json[r'to'] = this.to.toUtc().toIso8601String();
      json[r'timezone'] = this.timezone;
      json[r'bounds'] = this.bounds;
    return json;
  }

  /// Returns a new [SessionKpiResponseWindow] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiResponseWindow? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'from'), 'Required key "SessionKpiResponseWindow[from]" is missing from JSON.');
        assert(json[r'from'] != null, 'Required key "SessionKpiResponseWindow[from]" has a null value in JSON.');
        assert(json.containsKey(r'to'), 'Required key "SessionKpiResponseWindow[to]" is missing from JSON.');
        assert(json[r'to'] != null, 'Required key "SessionKpiResponseWindow[to]" has a null value in JSON.');
        assert(json.containsKey(r'timezone'), 'Required key "SessionKpiResponseWindow[timezone]" is missing from JSON.');
        assert(json[r'timezone'] != null, 'Required key "SessionKpiResponseWindow[timezone]" has a null value in JSON.');
        assert(json.containsKey(r'bounds'), 'Required key "SessionKpiResponseWindow[bounds]" is missing from JSON.');
        assert(json[r'bounds'] != null, 'Required key "SessionKpiResponseWindow[bounds]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiResponseWindow(
        from: mapDateTime(json, r'from', r'')!,
        to: mapDateTime(json, r'to', r'')!,
        timezone: mapValueOfType<String>(json, r'timezone')!,
        bounds: SessionKpiResponseWindowBoundsEnum.fromJson(json[r'bounds'])!,
      );
    }
    return null;
  }

  static List<SessionKpiResponseWindow> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseWindow>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseWindow.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiResponseWindow> mapFromJson(dynamic json) {
    final map = <String, SessionKpiResponseWindow>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiResponseWindow.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiResponseWindow-objects as value to a dart map
  static Map<String, List<SessionKpiResponseWindow>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiResponseWindow>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiResponseWindow.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'from',
    'to',
    'timezone',
    'bounds',
  };
}


enum SessionKpiResponseWindowBoundsEnum {
  halfOpenStartedAt._(r'half_open_started_at'),
  ;

  /// Instantiate a new enum with the provided value.
  const SessionKpiResponseWindowBoundsEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [SessionKpiResponseWindowBoundsEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static SessionKpiResponseWindowBoundsEnum? fromJson(dynamic value) => SessionKpiResponseWindowBoundsEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [SessionKpiResponseWindowBoundsEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<SessionKpiResponseWindowBoundsEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseWindowBoundsEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseWindowBoundsEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [SessionKpiResponseWindowBoundsEnum] to String,
/// and [decode] dynamic data back to [SessionKpiResponseWindowBoundsEnum].
class SessionKpiResponseWindowBoundsEnumTypeTransformer {
  factory SessionKpiResponseWindowBoundsEnumTypeTransformer() => _instance ??= const SessionKpiResponseWindowBoundsEnumTypeTransformer._();

  const SessionKpiResponseWindowBoundsEnumTypeTransformer._();

  String encode(SessionKpiResponseWindowBoundsEnum data) => data._value;

  /// Returns the instance of [SessionKpiResponseWindowBoundsEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  SessionKpiResponseWindowBoundsEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is SessionKpiResponseWindowBoundsEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'half_open_started_at': return SessionKpiResponseWindowBoundsEnum.halfOpenStartedAt;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static SessionKpiResponseWindowBoundsEnumTypeTransformer? _instance;
}


