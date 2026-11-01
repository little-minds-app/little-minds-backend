//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ListChildProfiles200Response {
  /// Returns a new [ListChildProfiles200Response] instance.
  ListChildProfiles200Response({
    this.children = const [],
  });

  List<ChildProfileResponse> children;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ListChildProfiles200Response &&
    _deepEquality.equals(other.children, children);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (children.hashCode);

  @override
  String toString() => 'ListChildProfiles200Response[children=$children]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'children'] = this.children;
    return json;
  }

  /// Returns a new [ListChildProfiles200Response] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ListChildProfiles200Response? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'children'), 'Required key "ListChildProfiles200Response[children]" is missing from JSON.');
        assert(json[r'children'] != null, 'Required key "ListChildProfiles200Response[children]" has a null value in JSON.');
        return true;
      }());

      return ListChildProfiles200Response(
        children: ChildProfileResponse.listFromJson(json[r'children']),
      );
    }
    return null;
  }

  static List<ListChildProfiles200Response> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ListChildProfiles200Response>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ListChildProfiles200Response.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ListChildProfiles200Response> mapFromJson(dynamic json) {
    final map = <String, ListChildProfiles200Response>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ListChildProfiles200Response.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ListChildProfiles200Response-objects as value to a dart map
  static Map<String, List<ListChildProfiles200Response>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ListChildProfiles200Response>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ListChildProfiles200Response.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'children',
  };
}

