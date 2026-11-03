//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionStatusListResponsePagination {
  /// Returns a new [MissionStatusListResponsePagination] instance.
  MissionStatusListResponsePagination({
    required this.limit,
    required this.truncated,
  });

  /// Minimum value: 1
  int limit;

  bool truncated;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionStatusListResponsePagination &&
    other.limit == limit &&
    other.truncated == truncated;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (limit.hashCode) +
    (truncated.hashCode);

  @override
  String toString() => 'MissionStatusListResponsePagination[limit=$limit, truncated=$truncated]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'limit'] = this.limit;
      json[r'truncated'] = this.truncated;
    return json;
  }

  /// Returns a new [MissionStatusListResponsePagination] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionStatusListResponsePagination? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'limit'), 'Required key "MissionStatusListResponsePagination[limit]" is missing from JSON.');
        assert(json[r'limit'] != null, 'Required key "MissionStatusListResponsePagination[limit]" has a null value in JSON.');
        assert(json.containsKey(r'truncated'), 'Required key "MissionStatusListResponsePagination[truncated]" is missing from JSON.');
        assert(json[r'truncated'] != null, 'Required key "MissionStatusListResponsePagination[truncated]" has a null value in JSON.');
        return true;
      }());

      return MissionStatusListResponsePagination(
        limit: mapValueOfType<int>(json, r'limit')!,
        truncated: mapValueOfType<bool>(json, r'truncated')!,
      );
    }
    return null;
  }

  static List<MissionStatusListResponsePagination> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusListResponsePagination>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusListResponsePagination.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionStatusListResponsePagination> mapFromJson(dynamic json) {
    final map = <String, MissionStatusListResponsePagination>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionStatusListResponsePagination.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionStatusListResponsePagination-objects as value to a dart map
  static Map<String, List<MissionStatusListResponsePagination>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionStatusListResponsePagination>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionStatusListResponsePagination.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'limit',
    'truncated',
  };
}

