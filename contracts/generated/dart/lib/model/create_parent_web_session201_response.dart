//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateParentWebSession201Response {
  /// Returns a new [CreateParentWebSession201Response] instance.
  CreateParentWebSession201Response({
    required this.handle,
    required this.expiresAt,
  });

  String handle;

  DateTime expiresAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateParentWebSession201Response &&
    other.handle == handle &&
    other.expiresAt == expiresAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (handle.hashCode) +
    (expiresAt.hashCode);

  @override
  String toString() => 'CreateParentWebSession201Response[handle=$handle, expiresAt=$expiresAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'handle'] = this.handle;
      json[r'expires_at'] = this.expiresAt.toUtc().toIso8601String();
    return json;
  }

  /// Returns a new [CreateParentWebSession201Response] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateParentWebSession201Response? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'handle'), 'Required key "CreateParentWebSession201Response[handle]" is missing from JSON.');
        assert(json[r'handle'] != null, 'Required key "CreateParentWebSession201Response[handle]" has a null value in JSON.');
        assert(json.containsKey(r'expires_at'), 'Required key "CreateParentWebSession201Response[expires_at]" is missing from JSON.');
        assert(json[r'expires_at'] != null, 'Required key "CreateParentWebSession201Response[expires_at]" has a null value in JSON.');
        return true;
      }());

      return CreateParentWebSession201Response(
        handle: mapValueOfType<String>(json, r'handle')!,
        expiresAt: mapDateTime(json, r'expires_at', r'')!,
      );
    }
    return null;
  }

  static List<CreateParentWebSession201Response> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateParentWebSession201Response>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateParentWebSession201Response.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateParentWebSession201Response> mapFromJson(dynamic json) {
    final map = <String, CreateParentWebSession201Response>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateParentWebSession201Response.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateParentWebSession201Response-objects as value to a dart map
  static Map<String, List<CreateParentWebSession201Response>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateParentWebSession201Response>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateParentWebSession201Response.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'handle',
    'expires_at',
  };
}

