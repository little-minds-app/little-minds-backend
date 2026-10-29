//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class AppleAuthRequest {
  /// Returns a new [AppleAuthRequest] instance.
  AppleAuthRequest({
    required this.idToken,
    required this.nonce,
    required this.noticeVersion,
    required this.noticeLocale,
    this.clientSurface,
    this.deviceId,
  });

  String idToken;

  String nonce;

  String noticeVersion;

  String noticeLocale;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? clientSurface;

  /// RFC 4122 UUID with version nibble 4 or 7
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? deviceId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is AppleAuthRequest &&
    other.idToken == idToken &&
    other.nonce == nonce &&
    other.noticeVersion == noticeVersion &&
    other.noticeLocale == noticeLocale &&
    other.clientSurface == clientSurface &&
    other.deviceId == deviceId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (idToken.hashCode) +
    (nonce.hashCode) +
    (noticeVersion.hashCode) +
    (noticeLocale.hashCode) +
    (clientSurface == null ? 0 : clientSurface!.hashCode) +
    (deviceId == null ? 0 : deviceId!.hashCode);

  @override
  String toString() => 'AppleAuthRequest[idToken=$idToken, nonce=$nonce, noticeVersion=$noticeVersion, noticeLocale=$noticeLocale, clientSurface=$clientSurface, deviceId=$deviceId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id_token'] = this.idToken;
      json[r'nonce'] = this.nonce;
      json[r'notice_version'] = this.noticeVersion;
      json[r'notice_locale'] = this.noticeLocale;
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

  /// Returns a new [AppleAuthRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static AppleAuthRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id_token'), 'Required key "AppleAuthRequest[id_token]" is missing from JSON.');
        assert(json[r'id_token'] != null, 'Required key "AppleAuthRequest[id_token]" has a null value in JSON.');
        assert(json.containsKey(r'nonce'), 'Required key "AppleAuthRequest[nonce]" is missing from JSON.');
        assert(json[r'nonce'] != null, 'Required key "AppleAuthRequest[nonce]" has a null value in JSON.');
        assert(json.containsKey(r'notice_version'), 'Required key "AppleAuthRequest[notice_version]" is missing from JSON.');
        assert(json[r'notice_version'] != null, 'Required key "AppleAuthRequest[notice_version]" has a null value in JSON.');
        assert(json.containsKey(r'notice_locale'), 'Required key "AppleAuthRequest[notice_locale]" is missing from JSON.');
        assert(json[r'notice_locale'] != null, 'Required key "AppleAuthRequest[notice_locale]" has a null value in JSON.');
        return true;
      }());

      return AppleAuthRequest(
        idToken: mapValueOfType<String>(json, r'id_token')!,
        nonce: mapValueOfType<String>(json, r'nonce')!,
        noticeVersion: mapValueOfType<String>(json, r'notice_version')!,
        noticeLocale: mapValueOfType<String>(json, r'notice_locale')!,
        clientSurface: mapValueOfType<String>(json, r'client_surface'),
        deviceId: mapValueOfType<String>(json, r'device_id'),
      );
    }
    return null;
  }

  static List<AppleAuthRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <AppleAuthRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = AppleAuthRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, AppleAuthRequest> mapFromJson(dynamic json) {
    final map = <String, AppleAuthRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = AppleAuthRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of AppleAuthRequest-objects as value to a dart map
  static Map<String, List<AppleAuthRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<AppleAuthRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = AppleAuthRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id_token',
    'nonce',
    'notice_version',
    'notice_locale',
  };
}

