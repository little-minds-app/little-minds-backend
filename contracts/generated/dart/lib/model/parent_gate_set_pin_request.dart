//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentGateSetPinRequest {
  /// Returns a new [ParentGateSetPinRequest] instance.
  ParentGateSetPinRequest({
    required this.pin,
    required this.confirmation,
    required this.stepUpToken,
  });

  String pin;

  String confirmation;

  String stepUpToken;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentGateSetPinRequest &&
    other.pin == pin &&
    other.confirmation == confirmation &&
    other.stepUpToken == stepUpToken;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (pin.hashCode) +
    (confirmation.hashCode) +
    (stepUpToken.hashCode);

  @override
  String toString() => 'ParentGateSetPinRequest[pin=$pin, confirmation=$confirmation, stepUpToken=$stepUpToken]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'pin'] = this.pin;
      json[r'confirmation'] = this.confirmation;
      json[r'step_up_token'] = this.stepUpToken;
    return json;
  }

  /// Returns a new [ParentGateSetPinRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentGateSetPinRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'pin'), 'Required key "ParentGateSetPinRequest[pin]" is missing from JSON.');
        assert(json[r'pin'] != null, 'Required key "ParentGateSetPinRequest[pin]" has a null value in JSON.');
        assert(json.containsKey(r'confirmation'), 'Required key "ParentGateSetPinRequest[confirmation]" is missing from JSON.');
        assert(json[r'confirmation'] != null, 'Required key "ParentGateSetPinRequest[confirmation]" has a null value in JSON.');
        assert(json.containsKey(r'step_up_token'), 'Required key "ParentGateSetPinRequest[step_up_token]" is missing from JSON.');
        assert(json[r'step_up_token'] != null, 'Required key "ParentGateSetPinRequest[step_up_token]" has a null value in JSON.');
        return true;
      }());

      return ParentGateSetPinRequest(
        pin: mapValueOfType<String>(json, r'pin')!,
        confirmation: mapValueOfType<String>(json, r'confirmation')!,
        stepUpToken: mapValueOfType<String>(json, r'step_up_token')!,
      );
    }
    return null;
  }

  static List<ParentGateSetPinRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateSetPinRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateSetPinRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentGateSetPinRequest> mapFromJson(dynamic json) {
    final map = <String, ParentGateSetPinRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentGateSetPinRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentGateSetPinRequest-objects as value to a dart map
  static Map<String, List<ParentGateSetPinRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentGateSetPinRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentGateSetPinRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'pin',
    'confirmation',
    'step_up_token',
  };
}

