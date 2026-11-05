//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class PhoneOtpVerifyRequest {
  /// Returns a new [PhoneOtpVerifyRequest] instance.
  PhoneOtpVerifyRequest({
    required this.challengeId,
    required this.code,
    this.clientSurface,
    this.deviceId,
  });

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String challengeId;

  String code;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? clientSurface;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? deviceId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PhoneOtpVerifyRequest &&
    other.challengeId == challengeId &&
    other.code == code &&
    other.clientSurface == clientSurface &&
    other.deviceId == deviceId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (challengeId.hashCode) +
    (code.hashCode) +
    (clientSurface == null ? 0 : clientSurface!.hashCode) +
    (deviceId == null ? 0 : deviceId!.hashCode);

  @override
  String toString() => 'PhoneOtpVerifyRequest[challengeId=$challengeId, code=$code, clientSurface=$clientSurface, deviceId=$deviceId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'challenge_id'] = this.challengeId;
      json[r'code'] = this.code;
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

  /// Returns a new [PhoneOtpVerifyRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PhoneOtpVerifyRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'challenge_id'), 'Required key "PhoneOtpVerifyRequest[challenge_id]" is missing from JSON.');
        assert(json[r'challenge_id'] != null, 'Required key "PhoneOtpVerifyRequest[challenge_id]" has a null value in JSON.');
        assert(json.containsKey(r'code'), 'Required key "PhoneOtpVerifyRequest[code]" is missing from JSON.');
        assert(json[r'code'] != null, 'Required key "PhoneOtpVerifyRequest[code]" has a null value in JSON.');
        return true;
      }());

      return PhoneOtpVerifyRequest(
        challengeId: mapValueOfType<String>(json, r'challenge_id')!,
        code: mapValueOfType<String>(json, r'code')!,
        clientSurface: mapValueOfType<String>(json, r'client_surface'),
        deviceId: mapValueOfType<String>(json, r'device_id'),
      );
    }
    return null;
  }

  static List<PhoneOtpVerifyRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PhoneOtpVerifyRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PhoneOtpVerifyRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PhoneOtpVerifyRequest> mapFromJson(dynamic json) {
    final map = <String, PhoneOtpVerifyRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PhoneOtpVerifyRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PhoneOtpVerifyRequest-objects as value to a dart map
  static Map<String, List<PhoneOtpVerifyRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PhoneOtpVerifyRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PhoneOtpVerifyRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'challenge_id',
    'code',
  };
}

