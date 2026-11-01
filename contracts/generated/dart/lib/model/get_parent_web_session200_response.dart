//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GetParentWebSession200Response {
  /// Returns a new [GetParentWebSession200Response] instance.
  GetParentWebSession200Response({
    required this.parentId,
    required this.locale,
    required this.timezone,
  });

  String parentId;

  String locale;

  String timezone;

  @override
  bool operator ==(Object other) => identical(this, other) || other is GetParentWebSession200Response &&
    other.parentId == parentId &&
    other.locale == locale &&
    other.timezone == timezone;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (parentId.hashCode) +
    (locale.hashCode) +
    (timezone.hashCode);

  @override
  String toString() => 'GetParentWebSession200Response[parentId=$parentId, locale=$locale, timezone=$timezone]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'parent_id'] = this.parentId;
      json[r'locale'] = this.locale;
      json[r'timezone'] = this.timezone;
    return json;
  }

  /// Returns a new [GetParentWebSession200Response] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GetParentWebSession200Response? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'parent_id'), 'Required key "GetParentWebSession200Response[parent_id]" is missing from JSON.');
        assert(json[r'parent_id'] != null, 'Required key "GetParentWebSession200Response[parent_id]" has a null value in JSON.');
        assert(json.containsKey(r'locale'), 'Required key "GetParentWebSession200Response[locale]" is missing from JSON.');
        assert(json[r'locale'] != null, 'Required key "GetParentWebSession200Response[locale]" has a null value in JSON.');
        assert(json.containsKey(r'timezone'), 'Required key "GetParentWebSession200Response[timezone]" is missing from JSON.');
        assert(json[r'timezone'] != null, 'Required key "GetParentWebSession200Response[timezone]" has a null value in JSON.');
        return true;
      }());

      return GetParentWebSession200Response(
        parentId: mapValueOfType<String>(json, r'parent_id')!,
        locale: mapValueOfType<String>(json, r'locale')!,
        timezone: mapValueOfType<String>(json, r'timezone')!,
      );
    }
    return null;
  }

  static List<GetParentWebSession200Response> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GetParentWebSession200Response>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GetParentWebSession200Response.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GetParentWebSession200Response> mapFromJson(dynamic json) {
    final map = <String, GetParentWebSession200Response>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GetParentWebSession200Response.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GetParentWebSession200Response-objects as value to a dart map
  static Map<String, List<GetParentWebSession200Response>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GetParentWebSession200Response>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GetParentWebSession200Response.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'parent_id',
    'locale',
    'timezone',
  };
}

