//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentSessionListResponse {
  /// Returns a new [ParentSessionListResponse] instance.
  ParentSessionListResponse({
    this.sessions = const [],
  });

  List<ParentSessionSummary> sessions;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentSessionListResponse &&
    _deepEquality.equals(other.sessions, sessions);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (sessions.hashCode);

  @override
  String toString() => 'ParentSessionListResponse[sessions=$sessions]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'sessions'] = this.sessions;
    return json;
  }

  /// Returns a new [ParentSessionListResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentSessionListResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'sessions'), 'Required key "ParentSessionListResponse[sessions]" is missing from JSON.');
        assert(json[r'sessions'] != null, 'Required key "ParentSessionListResponse[sessions]" has a null value in JSON.');
        return true;
      }());

      return ParentSessionListResponse(
        sessions: ParentSessionSummary.listFromJson(json[r'sessions']),
      );
    }
    return null;
  }

  static List<ParentSessionListResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentSessionListResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentSessionListResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentSessionListResponse> mapFromJson(dynamic json) {
    final map = <String, ParentSessionListResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentSessionListResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentSessionListResponse-objects as value to a dart map
  static Map<String, List<ParentSessionListResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentSessionListResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentSessionListResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'sessions',
  };
}

