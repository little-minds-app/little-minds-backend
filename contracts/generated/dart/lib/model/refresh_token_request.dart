//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class RefreshTokenRequest {
  /// Returns a new [RefreshTokenRequest] instance.
  RefreshTokenRequest({
    required this.refreshToken,
  });

  String refreshToken;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RefreshTokenRequest &&
    other.refreshToken == refreshToken;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (refreshToken.hashCode);

  @override
  String toString() => 'RefreshTokenRequest[refreshToken=$refreshToken]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'refresh_token'] = this.refreshToken;
    return json;
  }

  /// Returns a new [RefreshTokenRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RefreshTokenRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'refresh_token'), 'Required key "RefreshTokenRequest[refresh_token]" is missing from JSON.');
        assert(json[r'refresh_token'] != null, 'Required key "RefreshTokenRequest[refresh_token]" has a null value in JSON.');
        return true;
      }());

      return RefreshTokenRequest(
        refreshToken: mapValueOfType<String>(json, r'refresh_token')!,
      );
    }
    return null;
  }

  static List<RefreshTokenRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RefreshTokenRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RefreshTokenRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RefreshTokenRequest> mapFromJson(dynamic json) {
    final map = <String, RefreshTokenRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RefreshTokenRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RefreshTokenRequest-objects as value to a dart map
  static Map<String, List<RefreshTokenRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RefreshTokenRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RefreshTokenRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'refresh_token',
  };
}

