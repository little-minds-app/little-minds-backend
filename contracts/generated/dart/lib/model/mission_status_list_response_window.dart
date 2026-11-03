//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionStatusListResponseWindow {
  /// Returns a new [MissionStatusListResponseWindow] instance.
  MissionStatusListResponseWindow({
    required this.from,
    required this.to,
    required this.bounds,
  });

  DateTime? from;

  DateTime? to;

  MissionStatusListResponseWindowBoundsEnum bounds;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionStatusListResponseWindow &&
    other.from == from &&
    other.to == to &&
    other.bounds == bounds;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (from == null ? 0 : from!.hashCode) +
    (to == null ? 0 : to!.hashCode) +
    (bounds.hashCode);

  @override
  String toString() => 'MissionStatusListResponseWindow[from=$from, to=$to, bounds=$bounds]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.from != null) {
      json[r'from'] = this.from!.toUtc().toIso8601String();
    } else {
      json[r'from'] = null;
    }
    if (this.to != null) {
      json[r'to'] = this.to!.toUtc().toIso8601String();
    } else {
      json[r'to'] = null;
    }
      json[r'bounds'] = this.bounds;
    return json;
  }

  /// Returns a new [MissionStatusListResponseWindow] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionStatusListResponseWindow? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'from'), 'Required key "MissionStatusListResponseWindow[from]" is missing from JSON.');
        assert(json.containsKey(r'to'), 'Required key "MissionStatusListResponseWindow[to]" is missing from JSON.');
        assert(json.containsKey(r'bounds'), 'Required key "MissionStatusListResponseWindow[bounds]" is missing from JSON.');
        assert(json[r'bounds'] != null, 'Required key "MissionStatusListResponseWindow[bounds]" has a null value in JSON.');
        return true;
      }());

      return MissionStatusListResponseWindow(
        from: mapDateTime(json, r'from', r''),
        to: mapDateTime(json, r'to', r''),
        bounds: MissionStatusListResponseWindowBoundsEnum.fromJson(json[r'bounds'])!,
      );
    }
    return null;
  }

  static List<MissionStatusListResponseWindow> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusListResponseWindow>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusListResponseWindow.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionStatusListResponseWindow> mapFromJson(dynamic json) {
    final map = <String, MissionStatusListResponseWindow>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionStatusListResponseWindow.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionStatusListResponseWindow-objects as value to a dart map
  static Map<String, List<MissionStatusListResponseWindow>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionStatusListResponseWindow>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionStatusListResponseWindow.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'from',
    'to',
    'bounds',
  };
}


enum MissionStatusListResponseWindowBoundsEnum {
  halfOpenRecordedAt._(r'half_open_recorded_at'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionStatusListResponseWindowBoundsEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionStatusListResponseWindowBoundsEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionStatusListResponseWindowBoundsEnum? fromJson(dynamic value) => MissionStatusListResponseWindowBoundsEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionStatusListResponseWindowBoundsEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionStatusListResponseWindowBoundsEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusListResponseWindowBoundsEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusListResponseWindowBoundsEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionStatusListResponseWindowBoundsEnum] to String,
/// and [decode] dynamic data back to [MissionStatusListResponseWindowBoundsEnum].
class MissionStatusListResponseWindowBoundsEnumTypeTransformer {
  factory MissionStatusListResponseWindowBoundsEnumTypeTransformer() => _instance ??= const MissionStatusListResponseWindowBoundsEnumTypeTransformer._();

  const MissionStatusListResponseWindowBoundsEnumTypeTransformer._();

  String encode(MissionStatusListResponseWindowBoundsEnum data) => data._value;

  /// Returns the instance of [MissionStatusListResponseWindowBoundsEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionStatusListResponseWindowBoundsEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionStatusListResponseWindowBoundsEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'half_open_recorded_at': return MissionStatusListResponseWindowBoundsEnum.halfOpenRecordedAt;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionStatusListResponseWindowBoundsEnumTypeTransformer? _instance;
}


