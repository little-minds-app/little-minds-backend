//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class LinkIdentityRequest {
  /// Returns a new [LinkIdentityRequest] instance.
  LinkIdentityRequest({
    required this.stepUpToken,
    required this.provider,
    this.idToken,
    this.nonce,
    this.authorizationCode,
    this.codeVerifier,
    this.redirectUri,
    this.oauthState,
    this.challengeId,
    this.code,
  });

  /// Opaque one-time token from POST /v1/auth/identities/step-up
  String stepUpToken;

  /// Provider to link; proof fields must match provider
  LinkIdentityRequestProviderEnum provider;

  /// Apple or Google ID token (nonce path)
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? idToken;

  /// Server-issued nonce (Apple/Google nonce path)
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? nonce;

  /// Google authorization code (PKCE path)
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

  /// Server-issued oauth_state from google/pkce/start
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? oauthState;

  /// Email or phone OTP challenge id
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? challengeId;

  /// Email or phone OTP code
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? code;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LinkIdentityRequest &&
    other.stepUpToken == stepUpToken &&
    other.provider == provider &&
    other.idToken == idToken &&
    other.nonce == nonce &&
    other.authorizationCode == authorizationCode &&
    other.codeVerifier == codeVerifier &&
    other.redirectUri == redirectUri &&
    other.oauthState == oauthState &&
    other.challengeId == challengeId &&
    other.code == code;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (stepUpToken.hashCode) +
    (provider.hashCode) +
    (idToken == null ? 0 : idToken!.hashCode) +
    (nonce == null ? 0 : nonce!.hashCode) +
    (authorizationCode == null ? 0 : authorizationCode!.hashCode) +
    (codeVerifier == null ? 0 : codeVerifier!.hashCode) +
    (redirectUri == null ? 0 : redirectUri!.hashCode) +
    (oauthState == null ? 0 : oauthState!.hashCode) +
    (challengeId == null ? 0 : challengeId!.hashCode) +
    (code == null ? 0 : code!.hashCode);

  @override
  String toString() => 'LinkIdentityRequest[stepUpToken=$stepUpToken, provider=$provider, idToken=$idToken, nonce=$nonce, authorizationCode=$authorizationCode, codeVerifier=$codeVerifier, redirectUri=$redirectUri, oauthState=$oauthState, challengeId=$challengeId, code=$code]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'step_up_token'] = this.stepUpToken;
      json[r'provider'] = this.provider;
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
    if (this.challengeId != null) {
      json[r'challenge_id'] = this.challengeId;
    } else {
      json[r'challenge_id'] = null;
    }
    if (this.code != null) {
      json[r'code'] = this.code;
    } else {
      json[r'code'] = null;
    }
    return json;
  }

  /// Returns a new [LinkIdentityRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LinkIdentityRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'step_up_token'), 'Required key "LinkIdentityRequest[step_up_token]" is missing from JSON.');
        assert(json[r'step_up_token'] != null, 'Required key "LinkIdentityRequest[step_up_token]" has a null value in JSON.');
        assert(json.containsKey(r'provider'), 'Required key "LinkIdentityRequest[provider]" is missing from JSON.');
        assert(json[r'provider'] != null, 'Required key "LinkIdentityRequest[provider]" has a null value in JSON.');
        return true;
      }());

      return LinkIdentityRequest(
        stepUpToken: mapValueOfType<String>(json, r'step_up_token')!,
        provider: LinkIdentityRequestProviderEnum.fromJson(json[r'provider'])!,
        idToken: mapValueOfType<String>(json, r'id_token'),
        nonce: mapValueOfType<String>(json, r'nonce'),
        authorizationCode: mapValueOfType<String>(json, r'authorization_code'),
        codeVerifier: mapValueOfType<String>(json, r'code_verifier'),
        redirectUri: mapValueOfType<String>(json, r'redirect_uri'),
        oauthState: mapValueOfType<String>(json, r'oauth_state'),
        challengeId: mapValueOfType<String>(json, r'challenge_id'),
        code: mapValueOfType<String>(json, r'code'),
      );
    }
    return null;
  }

  static List<LinkIdentityRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LinkIdentityRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LinkIdentityRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LinkIdentityRequest> mapFromJson(dynamic json) {
    final map = <String, LinkIdentityRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LinkIdentityRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LinkIdentityRequest-objects as value to a dart map
  static Map<String, List<LinkIdentityRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LinkIdentityRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LinkIdentityRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'step_up_token',
    'provider',
  };
}

/// Provider to link; proof fields must match provider
enum LinkIdentityRequestProviderEnum {
  apple._(r'apple'),
  google._(r'google'),
  email._(r'email'),
  phone._(r'phone'),
  ;

  /// Instantiate a new enum with the provided value.
  const LinkIdentityRequestProviderEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [LinkIdentityRequestProviderEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static LinkIdentityRequestProviderEnum? fromJson(dynamic value) => LinkIdentityRequestProviderEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [LinkIdentityRequestProviderEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<LinkIdentityRequestProviderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LinkIdentityRequestProviderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LinkIdentityRequestProviderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [LinkIdentityRequestProviderEnum] to String,
/// and [decode] dynamic data back to [LinkIdentityRequestProviderEnum].
class LinkIdentityRequestProviderEnumTypeTransformer {
  factory LinkIdentityRequestProviderEnumTypeTransformer() => _instance ??= const LinkIdentityRequestProviderEnumTypeTransformer._();

  const LinkIdentityRequestProviderEnumTypeTransformer._();

  String encode(LinkIdentityRequestProviderEnum data) => data._value;

  /// Returns the instance of [LinkIdentityRequestProviderEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  LinkIdentityRequestProviderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is LinkIdentityRequestProviderEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'apple': return LinkIdentityRequestProviderEnum.apple;
        case r'google': return LinkIdentityRequestProviderEnum.google;
        case r'email': return LinkIdentityRequestProviderEnum.email;
        case r'phone': return LinkIdentityRequestProviderEnum.phone;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static LinkIdentityRequestProviderEnumTypeTransformer? _instance;
}


