//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentGateVerifyRequest {
  /// Returns a new [ParentGateVerifyRequest] instance.
  ParentGateVerifyRequest({
    required this.pin,
  });

  String pin;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentGateVerifyRequest &&
    other.pin == pin;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (pin.hashCode);

  @override
  String toString() => 'ParentGateVerifyRequest[pin=$pin]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'pin'] = this.pin;
    return json;
  }

  /// Returns a new [ParentGateVerifyRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentGateVerifyRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'pin'), 'Required key "ParentGateVerifyRequest[pin]" is missing from JSON.');
        assert(json[r'pin'] != null, 'Required key "ParentGateVerifyRequest[pin]" has a null value in JSON.');
        return true;
      }());

      return ParentGateVerifyRequest(
        pin: mapValueOfType<String>(json, r'pin')!,
      );
    }
    return null;
  }

  static List<ParentGateVerifyRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateVerifyRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateVerifyRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentGateVerifyRequest> mapFromJson(dynamic json) {
    final map = <String, ParentGateVerifyRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentGateVerifyRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentGateVerifyRequest-objects as value to a dart map
  static Map<String, List<ParentGateVerifyRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentGateVerifyRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentGateVerifyRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'pin',
  };
}

