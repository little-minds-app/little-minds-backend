//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GooglePkceStartRequest {
  /// Returns a new [GooglePkceStartRequest] instance.
  GooglePkceStartRequest({
    required this.redirectUri,
    required this.codeChallenge,
    this.codeChallengeMethod,
    this.clientId,
  });

  /// Must be in GOOGLE_REDIRECT_URIS allowlist
  String redirectUri;

  /// S256 code_challenge (base64url SHA-256 of verifier)
  String codeChallenge;

  /// Only S256 is accepted; defaults to S256
  GooglePkceStartRequestCodeChallengeMethodEnum? codeChallengeMethod;

  /// Optional; must be in GOOGLE_CLIENT_IDS when provided
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? clientId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is GooglePkceStartRequest &&
    other.redirectUri == redirectUri &&
    other.codeChallenge == codeChallenge &&
    other.codeChallengeMethod == codeChallengeMethod &&
    other.clientId == clientId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (redirectUri.hashCode) +
    (codeChallenge.hashCode) +
    (codeChallengeMethod == null ? 0 : codeChallengeMethod!.hashCode) +
    (clientId == null ? 0 : clientId!.hashCode);

  @override
  String toString() => 'GooglePkceStartRequest[redirectUri=$redirectUri, codeChallenge=$codeChallenge, codeChallengeMethod=$codeChallengeMethod, clientId=$clientId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'redirect_uri'] = this.redirectUri;
      json[r'code_challenge'] = this.codeChallenge;
    if (this.codeChallengeMethod != null) {
      json[r'code_challenge_method'] = this.codeChallengeMethod;
    } else {
      json[r'code_challenge_method'] = null;
    }
    if (this.clientId != null) {
      json[r'client_id'] = this.clientId;
    } else {
      json[r'client_id'] = null;
    }
    return json;
  }

  /// Returns a new [GooglePkceStartRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GooglePkceStartRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'redirect_uri'), 'Required key "GooglePkceStartRequest[redirect_uri]" is missing from JSON.');
        assert(json[r'redirect_uri'] != null, 'Required key "GooglePkceStartRequest[redirect_uri]" has a null value in JSON.');
        assert(json.containsKey(r'code_challenge'), 'Required key "GooglePkceStartRequest[code_challenge]" is missing from JSON.');
        assert(json[r'code_challenge'] != null, 'Required key "GooglePkceStartRequest[code_challenge]" has a null value in JSON.');
        return true;
      }());

      return GooglePkceStartRequest(
        redirectUri: mapValueOfType<String>(json, r'redirect_uri')!,
        codeChallenge: mapValueOfType<String>(json, r'code_challenge')!,
        codeChallengeMethod: GooglePkceStartRequestCodeChallengeMethodEnum.fromJson(json[r'code_challenge_method']),
        clientId: mapValueOfType<String>(json, r'client_id'),
      );
    }
    return null;
  }

  static List<GooglePkceStartRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GooglePkceStartRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GooglePkceStartRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GooglePkceStartRequest> mapFromJson(dynamic json) {
    final map = <String, GooglePkceStartRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GooglePkceStartRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GooglePkceStartRequest-objects as value to a dart map
  static Map<String, List<GooglePkceStartRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GooglePkceStartRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GooglePkceStartRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'redirect_uri',
    'code_challenge',
  };
}

/// Only S256 is accepted; defaults to S256
enum GooglePkceStartRequestCodeChallengeMethodEnum {
  S256._(r'S256'),
  ;

  /// Instantiate a new enum with the provided value.
  const GooglePkceStartRequestCodeChallengeMethodEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [GooglePkceStartRequestCodeChallengeMethodEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static GooglePkceStartRequestCodeChallengeMethodEnum? fromJson(dynamic value) => GooglePkceStartRequestCodeChallengeMethodEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [GooglePkceStartRequestCodeChallengeMethodEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<GooglePkceStartRequestCodeChallengeMethodEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GooglePkceStartRequestCodeChallengeMethodEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GooglePkceStartRequestCodeChallengeMethodEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [GooglePkceStartRequestCodeChallengeMethodEnum] to String,
/// and [decode] dynamic data back to [GooglePkceStartRequestCodeChallengeMethodEnum].
class GooglePkceStartRequestCodeChallengeMethodEnumTypeTransformer {
  factory GooglePkceStartRequestCodeChallengeMethodEnumTypeTransformer() => _instance ??= const GooglePkceStartRequestCodeChallengeMethodEnumTypeTransformer._();

  const GooglePkceStartRequestCodeChallengeMethodEnumTypeTransformer._();

  String encode(GooglePkceStartRequestCodeChallengeMethodEnum data) => data._value;

  /// Returns the instance of [GooglePkceStartRequestCodeChallengeMethodEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  GooglePkceStartRequestCodeChallengeMethodEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is GooglePkceStartRequestCodeChallengeMethodEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'S256': return GooglePkceStartRequestCodeChallengeMethodEnum.S256;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static GooglePkceStartRequestCodeChallengeMethodEnumTypeTransformer? _instance;
}


