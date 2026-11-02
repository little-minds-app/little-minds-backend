//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentGateStatus {
  /// Returns a new [ParentGateStatus] instance.
  ParentGateStatus({
    required this.configured,
  });

  bool configured;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentGateStatus &&
    other.configured == configured;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (configured.hashCode);

  @override
  String toString() => 'ParentGateStatus[configured=$configured]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'configured'] = this.configured;
    return json;
  }

  /// Returns a new [ParentGateStatus] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentGateStatus? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'configured'), 'Required key "ParentGateStatus[configured]" is missing from JSON.');
        assert(json[r'configured'] != null, 'Required key "ParentGateStatus[configured]" has a null value in JSON.');
        return true;
      }());

      return ParentGateStatus(
        configured: mapValueOfType<bool>(json, r'configured')!,
      );
    }
    return null;
  }

  static List<ParentGateStatus> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateStatus>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateStatus.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentGateStatus> mapFromJson(dynamic json) {
    final map = <String, ParentGateStatus>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentGateStatus.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentGateStatus-objects as value to a dart map
  static Map<String, List<ParentGateStatus>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentGateStatus>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentGateStatus.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'configured',
  };
}

