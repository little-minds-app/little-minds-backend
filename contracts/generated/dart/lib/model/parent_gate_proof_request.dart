//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentGateProofRequest {
  /// Returns a new [ParentGateProofRequest] instance.
  ParentGateProofRequest({
    required this.provider,
    this.challengeId,
    this.code,
    this.idToken,
    this.nonce,
    this.authorizationCode,
    this.codeVerifier,
    this.redirectUri,
    this.oauthState,
  });

  ParentGateProofRequestProviderEnum provider;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? challengeId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? code;

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

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? oauthState;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentGateProofRequest &&
    other.provider == provider &&
    other.challengeId == challengeId &&
    other.code == code &&
    other.idToken == idToken &&
    other.nonce == nonce &&
    other.authorizationCode == authorizationCode &&
    other.codeVerifier == codeVerifier &&
    other.redirectUri == redirectUri &&
    other.oauthState == oauthState;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (provider.hashCode) +
    (challengeId == null ? 0 : challengeId!.hashCode) +
    (code == null ? 0 : code!.hashCode) +
    (idToken == null ? 0 : idToken!.hashCode) +
    (nonce == null ? 0 : nonce!.hashCode) +
    (authorizationCode == null ? 0 : authorizationCode!.hashCode) +
    (codeVerifier == null ? 0 : codeVerifier!.hashCode) +
    (redirectUri == null ? 0 : redirectUri!.hashCode) +
    (oauthState == null ? 0 : oauthState!.hashCode);

  @override
  String toString() => 'ParentGateProofRequest[provider=$provider, challengeId=$challengeId, code=$code, idToken=$idToken, nonce=$nonce, authorizationCode=$authorizationCode, codeVerifier=$codeVerifier, redirectUri=$redirectUri, oauthState=$oauthState]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'provider'] = this.provider;
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
    return json;
  }

  /// Returns a new [ParentGateProofRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentGateProofRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'provider'), 'Required key "ParentGateProofRequest[provider]" is missing from JSON.');
        assert(json[r'provider'] != null, 'Required key "ParentGateProofRequest[provider]" has a null value in JSON.');
        return true;
      }());

      return ParentGateProofRequest(
        provider: ParentGateProofRequestProviderEnum.fromJson(json[r'provider'])!,
        challengeId: mapValueOfType<String>(json, r'challenge_id'),
        code: mapValueOfType<String>(json, r'code'),
        idToken: mapValueOfType<String>(json, r'id_token'),
        nonce: mapValueOfType<String>(json, r'nonce'),
        authorizationCode: mapValueOfType<String>(json, r'authorization_code'),
        codeVerifier: mapValueOfType<String>(json, r'code_verifier'),
        redirectUri: mapValueOfType<String>(json, r'redirect_uri'),
        oauthState: mapValueOfType<String>(json, r'oauth_state'),
      );
    }
    return null;
  }

  static List<ParentGateProofRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateProofRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateProofRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentGateProofRequest> mapFromJson(dynamic json) {
    final map = <String, ParentGateProofRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentGateProofRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentGateProofRequest-objects as value to a dart map
  static Map<String, List<ParentGateProofRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentGateProofRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentGateProofRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'provider',
  };
}


enum ParentGateProofRequestProviderEnum {
  phone._(r'phone'),
  email._(r'email'),
  apple._(r'apple'),
  google._(r'google'),
  ;

  /// Instantiate a new enum with the provided value.
  const ParentGateProofRequestProviderEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ParentGateProofRequestProviderEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ParentGateProofRequestProviderEnum? fromJson(dynamic value) => ParentGateProofRequestProviderEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ParentGateProofRequestProviderEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ParentGateProofRequestProviderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateProofRequestProviderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateProofRequestProviderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ParentGateProofRequestProviderEnum] to String,
/// and [decode] dynamic data back to [ParentGateProofRequestProviderEnum].
class ParentGateProofRequestProviderEnumTypeTransformer {
  factory ParentGateProofRequestProviderEnumTypeTransformer() => _instance ??= const ParentGateProofRequestProviderEnumTypeTransformer._();

  const ParentGateProofRequestProviderEnumTypeTransformer._();

  String encode(ParentGateProofRequestProviderEnum data) => data._value;

  /// Returns the instance of [ParentGateProofRequestProviderEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ParentGateProofRequestProviderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ParentGateProofRequestProviderEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'phone': return ParentGateProofRequestProviderEnum.phone;
        case r'email': return ParentGateProofRequestProviderEnum.email;
        case r'apple': return ParentGateProofRequestProviderEnum.apple;
        case r'google': return ParentGateProofRequestProviderEnum.google;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ParentGateProofRequestProviderEnumTypeTransformer? _instance;
}


