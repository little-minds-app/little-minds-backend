//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SetDeviceActiveChildRequest {
  /// Returns a new [SetDeviceActiveChildRequest] instance.
  SetDeviceActiveChildRequest({
    required this.childId,
    required this.expectedBindingRevision,
  });

  /// Owned child profile to authorize on this device, or null to clear
  String? childId;

  /// Compare-and-set token from the latest binding read; rejects stale binds with 409
  ///
  /// Minimum value: 0
  int expectedBindingRevision;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SetDeviceActiveChildRequest &&
    other.childId == childId &&
    other.expectedBindingRevision == expectedBindingRevision;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (childId == null ? 0 : childId!.hashCode) +
    (expectedBindingRevision.hashCode);

  @override
  String toString() => 'SetDeviceActiveChildRequest[childId=$childId, expectedBindingRevision=$expectedBindingRevision]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.childId != null) {
      json[r'child_id'] = this.childId;
    } else {
      json[r'child_id'] = null;
    }
      json[r'expected_binding_revision'] = this.expectedBindingRevision;
    return json;
  }

  /// Returns a new [SetDeviceActiveChildRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SetDeviceActiveChildRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'child_id'), 'Required key "SetDeviceActiveChildRequest[child_id]" is missing from JSON.');
        assert(json.containsKey(r'expected_binding_revision'), 'Required key "SetDeviceActiveChildRequest[expected_binding_revision]" is missing from JSON.');
        assert(json[r'expected_binding_revision'] != null, 'Required key "SetDeviceActiveChildRequest[expected_binding_revision]" has a null value in JSON.');
        return true;
      }());

      return SetDeviceActiveChildRequest(
        childId: mapValueOfType<String>(json, r'child_id'),
        expectedBindingRevision: mapValueOfType<int>(json, r'expected_binding_revision')!,
      );
    }
    return null;
  }

  static List<SetDeviceActiveChildRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SetDeviceActiveChildRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SetDeviceActiveChildRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SetDeviceActiveChildRequest> mapFromJson(dynamic json) {
    final map = <String, SetDeviceActiveChildRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SetDeviceActiveChildRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SetDeviceActiveChildRequest-objects as value to a dart map
  static Map<String, List<SetDeviceActiveChildRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SetDeviceActiveChildRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SetDeviceActiveChildRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'child_id',
    'expected_binding_revision',
  };
}

