//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DeviceActiveChildBinding {
  /// Returns a new [DeviceActiveChildBinding] instance.
  DeviceActiveChildBinding({
    required this.deviceId,
    required this.installationId,
    required this.childId,
    required this.bindingRevision,
    required this.updatedAt,
  });

  /// Parent-scoped database devices.id (server-derived)
  String deviceId;

  /// Client installation UUID echoed for correlation
  String installationId;

  /// Active child authorized for ingest on this device; null when unassigned
  String? childId;

  /// Server-authoritative monotonic revision; send as expected_binding_revision on PUT
  ///
  /// Minimum value: 0
  int bindingRevision;

  /// UTC timestamp of the last binding mutation
  DateTime updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DeviceActiveChildBinding &&
    other.deviceId == deviceId &&
    other.installationId == installationId &&
    other.childId == childId &&
    other.bindingRevision == bindingRevision &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (deviceId.hashCode) +
    (installationId.hashCode) +
    (childId == null ? 0 : childId!.hashCode) +
    (bindingRevision.hashCode) +
    (updatedAt.hashCode);

  @override
  String toString() => 'DeviceActiveChildBinding[deviceId=$deviceId, installationId=$installationId, childId=$childId, bindingRevision=$bindingRevision, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'device_id'] = this.deviceId;
      json[r'installation_id'] = this.installationId;
    if (this.childId != null) {
      json[r'child_id'] = this.childId;
    } else {
      json[r'child_id'] = null;
    }
      json[r'binding_revision'] = this.bindingRevision;
      json[r'updated_at'] = this.updatedAt.toUtc().toIso8601String();
    return json;
  }

  /// Returns a new [DeviceActiveChildBinding] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DeviceActiveChildBinding? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'device_id'), 'Required key "DeviceActiveChildBinding[device_id]" is missing from JSON.');
        assert(json[r'device_id'] != null, 'Required key "DeviceActiveChildBinding[device_id]" has a null value in JSON.');
        assert(json.containsKey(r'installation_id'), 'Required key "DeviceActiveChildBinding[installation_id]" is missing from JSON.');
        assert(json[r'installation_id'] != null, 'Required key "DeviceActiveChildBinding[installation_id]" has a null value in JSON.');
        assert(json.containsKey(r'child_id'), 'Required key "DeviceActiveChildBinding[child_id]" is missing from JSON.');
        assert(json.containsKey(r'binding_revision'), 'Required key "DeviceActiveChildBinding[binding_revision]" is missing from JSON.');
        assert(json[r'binding_revision'] != null, 'Required key "DeviceActiveChildBinding[binding_revision]" has a null value in JSON.');
        assert(json.containsKey(r'updated_at'), 'Required key "DeviceActiveChildBinding[updated_at]" is missing from JSON.');
        assert(json[r'updated_at'] != null, 'Required key "DeviceActiveChildBinding[updated_at]" has a null value in JSON.');
        return true;
      }());

      return DeviceActiveChildBinding(
        deviceId: mapValueOfType<String>(json, r'device_id')!,
        installationId: mapValueOfType<String>(json, r'installation_id')!,
        childId: mapValueOfType<String>(json, r'child_id'),
        bindingRevision: mapValueOfType<int>(json, r'binding_revision')!,
        updatedAt: mapDateTime(json, r'updated_at', r'')!,
      );
    }
    return null;
  }

  static List<DeviceActiveChildBinding> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DeviceActiveChildBinding>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DeviceActiveChildBinding.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DeviceActiveChildBinding> mapFromJson(dynamic json) {
    final map = <String, DeviceActiveChildBinding>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DeviceActiveChildBinding.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DeviceActiveChildBinding-objects as value to a dart map
  static Map<String, List<DeviceActiveChildBinding>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DeviceActiveChildBinding>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DeviceActiveChildBinding.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'device_id',
    'installation_id',
    'child_id',
    'binding_revision',
    'updated_at',
  };
}

