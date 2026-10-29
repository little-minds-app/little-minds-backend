//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GoogleAuthRequest {
  /// Returns a new [GoogleAuthRequest] instance.
  GoogleAuthRequest({
    this.idToken,
    this.nonce,
    this.authorizationCode,
    this.codeVerifier,
    this.redirectUri,
    this.oauthState,
    required this.noticeVersion,
    required this.noticeLocale,
    this.clientSurface,
    this.deviceId,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? idToken;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? nonce;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? authorizationCode;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? codeVerifier;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? redirectUri;

  /// Server-issued state from POST /v1/auth/google/pkce/start
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? oauthState;

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
  bool operator ==(Object other) => identical(this, other) || other is GoogleAuthRequest &&
    other.idToken == idToken &&
    other.nonce == nonce &&
    other.authorizationCode == authorizationCode &&
    other.codeVerifier == codeVerifier &&
    other.redirectUri == redirectUri &&
    other.oauthState == oauthState &&
    other.noticeVersion == noticeVersion &&
    other.noticeLocale == noticeLocale &&
    other.clientSurface == clientSurface &&
    other.deviceId == deviceId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (idToken == null ? 0 : idToken!.hashCode) +
    (nonce == null ? 0 : nonce!.hashCode) +
    (authorizationCode == null ? 0 : authorizationCode!.hashCode) +
    (codeVerifier == null ? 0 : codeVerifier!.hashCode) +
    (redirectUri == null ? 0 : redirectUri!.hashCode) +
    (oauthState == null ? 0 : oauthState!.hashCode) +
    (noticeVersion.hashCode) +
    (noticeLocale.hashCode) +
    (clientSurface == null ? 0 : clientSurface!.hashCode) +
    (deviceId == null ? 0 : deviceId!.hashCode);

  @override
  String toString() => 'GoogleAuthRequest[idToken=$idToken, nonce=$nonce, authorizationCode=$authorizationCode, codeVerifier=$codeVerifier, redirectUri=$redirectUri, oauthState=$oauthState, noticeVersion=$noticeVersion, noticeLocale=$noticeLocale, clientSurface=$clientSurface, deviceId=$deviceId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.idToken != null) {
      json[r'id_token'] = this.idToken;
    } else {
      json[r'id_token'] = null;
    }
    if (this.nonce != null) {
      json[r'nonce'] = this.nonce;
    } else {
      json[r'nonce'] = null;
    }
    if (this.authorizationCode != null) {
      json[r'authorization_code'] = this.authorizationCode;
    } else {
      json[r'authorization_code'] = null;
    }
    if (this.codeVerifier != null) {
      json[r'code_verifier'] = this.codeVerifier;
    } else {
      json[r'code_verifier'] = null;
    }
    if (this.redirectUri != null) {
      json[r'redirect_uri'] = this.redirectUri;
    } else {
      json[r'redirect_uri'] = null;
    }
    if (this.oauthState != null) {
      json[r'oauth_state'] = this.oauthState;
    } else {
      json[r'oauth_state'] = null;
    }
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

  /// Returns a new [GoogleAuthRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GoogleAuthRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'notice_version'), 'Required key "GoogleAuthRequest[notice_version]" is missing from JSON.');
        assert(json[r'notice_version'] != null, 'Required key "GoogleAuthRequest[notice_version]" has a null value in JSON.');
        assert(json.containsKey(r'notice_locale'), 'Required key "GoogleAuthRequest[notice_locale]" is missing from JSON.');
        assert(json[r'notice_locale'] != null, 'Required key "GoogleAuthRequest[notice_locale]" has a null value in JSON.');
        return true;
      }());

      return GoogleAuthRequest(
        idToken: mapValueOfType<String>(json, r'id_token'),
        nonce: mapValueOfType<String>(json, r'nonce'),
        authorizationCode: mapValueOfType<String>(json, r'authorization_code'),
        codeVerifier: mapValueOfType<String>(json, r'code_verifier'),
        redirectUri: mapValueOfType<String>(json, r'redirect_uri'),
        oauthState: mapValueOfType<String>(json, r'oauth_state'),
        noticeVersion: mapValueOfType<String>(json, r'notice_version')!,
        noticeLocale: mapValueOfType<String>(json, r'notice_locale')!,
        clientSurface: mapValueOfType<String>(json, r'client_surface'),
        deviceId: mapValueOfType<String>(json, r'device_id'),
      );
    }
    return null;
  }

  static List<GoogleAuthRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GoogleAuthRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GoogleAuthRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GoogleAuthRequest> mapFromJson(dynamic json) {
    final map = <String, GoogleAuthRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GoogleAuthRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GoogleAuthRequest-objects as value to a dart map
  static Map<String, List<GoogleAuthRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GoogleAuthRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GoogleAuthRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'notice_version',
    'notice_locale',
  };
}

