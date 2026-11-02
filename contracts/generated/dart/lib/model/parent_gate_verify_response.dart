//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentGateVerifyResponse {
  /// Returns a new [ParentGateVerifyResponse] instance.
  ParentGateVerifyResponse({
    required this.gateToken,
    required this.expiresIn,
  });

  String gateToken;

  int expiresIn;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentGateVerifyResponse &&
    other.gateToken == gateToken &&
    other.expiresIn == expiresIn;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (gateToken.hashCode) +
    (expiresIn.hashCode);

  @override
  String toString() => 'ParentGateVerifyResponse[gateToken=$gateToken, expiresIn=$expiresIn]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'gate_token'] = this.gateToken;
      json[r'expires_in'] = this.expiresIn;
    return json;
  }

  /// Returns a new [ParentGateVerifyResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentGateVerifyResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'gate_token'), 'Required key "ParentGateVerifyResponse[gate_token]" is missing from JSON.');
        assert(json[r'gate_token'] != null, 'Required key "ParentGateVerifyResponse[gate_token]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "ParentGateVerifyResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "ParentGateVerifyResponse[expires_in]" has a null value in JSON.');
        return true;
      }());

      return ParentGateVerifyResponse(
        gateToken: mapValueOfType<String>(json, r'gate_token')!,
        expiresIn: mapValueOfType<int>(json, r'expires_in')!,
      );
    }
    return null;
  }

  static List<ParentGateVerifyResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateVerifyResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateVerifyResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentGateVerifyResponse> mapFromJson(dynamic json) {
    final map = <String, ParentGateVerifyResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentGateVerifyResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentGateVerifyResponse-objects as value to a dart map
  static Map<String, List<ParentGateVerifyResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentGateVerifyResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentGateVerifyResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'gate_token',
    'expires_in',
  };
}

