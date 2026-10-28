//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DevSessionRequest {
  /// Returns a new [DevSessionRequest] instance.
  DevSessionRequest({
    required this.parentId,
    this.clientSurface,
    this.deviceId,
  });

  /// RFC 4122 UUID with version nibble 4 or 7
  String parentId;

  DevSessionRequestClientSurfaceEnum? clientSurface;

  /// RFC 4122 UUID with version nibble 4 or 7
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? deviceId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DevSessionRequest &&
    other.parentId == parentId &&
    other.clientSurface == clientSurface &&
    other.deviceId == deviceId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (parentId.hashCode) +
    (clientSurface == null ? 0 : clientSurface!.hashCode) +
    (deviceId == null ? 0 : deviceId!.hashCode);

  @override
  String toString() => 'DevSessionRequest[parentId=$parentId, clientSurface=$clientSurface, deviceId=$deviceId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'parent_id'] = this.parentId;
    if (this.clientSurface != null) {
      json[r'client_surface'] = this.clientSurface;
    } else {
      json[r'client_surface'] = null;
    }
    if (this.deviceId != null) {
      json[r'device_id'] = this.deviceId;
    } else {
      json[r'device_id'] = null;
    }
    return json;
  }

  /// Returns a new [DevSessionRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DevSessionRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'parent_id'), 'Required key "DevSessionRequest[parent_id]" is missing from JSON.');
        assert(json[r'parent_id'] != null, 'Required key "DevSessionRequest[parent_id]" has a null value in JSON.');
        return true;
      }());

      return DevSessionRequest(
        parentId: mapValueOfType<String>(json, r'parent_id')!,
        clientSurface: DevSessionRequestClientSurfaceEnum.fromJson(json[r'client_surface']),
        deviceId: mapValueOfType<String>(json, r'device_id'),
      );
    }
    return null;
  }

  static List<DevSessionRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DevSessionRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DevSessionRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DevSessionRequest> mapFromJson(dynamic json) {
    final map = <String, DevSessionRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DevSessionRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DevSessionRequest-objects as value to a dart map
  static Map<String, List<DevSessionRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DevSessionRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DevSessionRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'parent_id',
  };
}


enum DevSessionRequestClientSurfaceEnum {
  ios._(r'ios'),
  android._(r'android'),
  web._(r'web'),
  unknown._(r'unknown'),
  ;

  /// Instantiate a new enum with the provided value.
  const DevSessionRequestClientSurfaceEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [DevSessionRequestClientSurfaceEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static DevSessionRequestClientSurfaceEnum? fromJson(dynamic value) => DevSessionRequestClientSurfaceEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [DevSessionRequestClientSurfaceEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<DevSessionRequestClientSurfaceEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DevSessionRequestClientSurfaceEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DevSessionRequestClientSurfaceEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [DevSessionRequestClientSurfaceEnum] to String,
/// and [decode] dynamic data back to [DevSessionRequestClientSurfaceEnum].
class DevSessionRequestClientSurfaceEnumTypeTransformer {
  factory DevSessionRequestClientSurfaceEnumTypeTransformer() => _instance ??= const DevSessionRequestClientSurfaceEnumTypeTransformer._();

  const DevSessionRequestClientSurfaceEnumTypeTransformer._();

  String encode(DevSessionRequestClientSurfaceEnum data) => data._value;

  /// Returns the instance of [DevSessionRequestClientSurfaceEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  DevSessionRequestClientSurfaceEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is DevSessionRequestClientSurfaceEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'ios': return DevSessionRequestClientSurfaceEnum.ios;
        case r'android': return DevSessionRequestClientSurfaceEnum.android;
        case r'web': return DevSessionRequestClientSurfaceEnum.web;
        case r'unknown': return DevSessionRequestClientSurfaceEnum.unknown;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static DevSessionRequestClientSurfaceEnumTypeTransformer? _instance;
}


