//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class TokenPairResponse {
  /// Returns a new [TokenPairResponse] instance.
  TokenPairResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
    required this.sessionId,
    required this.parentId,
  });

  String accessToken;

  String refreshToken;

  TokenPairResponseTokenTypeEnum tokenType;

  TokenPairResponseExpiresInEnum expiresIn;

  /// RFC 4122 UUID with version nibble 4 or 7
  String sessionId;

  /// RFC 4122 UUID with version nibble 4 or 7
  String parentId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is TokenPairResponse &&
    other.accessToken == accessToken &&
    other.refreshToken == refreshToken &&
    other.tokenType == tokenType &&
    other.expiresIn == expiresIn &&
    other.sessionId == sessionId &&
    other.parentId == parentId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (accessToken.hashCode) +
    (refreshToken.hashCode) +
    (tokenType.hashCode) +
    (expiresIn.hashCode) +
    (sessionId.hashCode) +
    (parentId.hashCode);

  @override
  String toString() => 'TokenPairResponse[accessToken=$accessToken, refreshToken=$refreshToken, tokenType=$tokenType, expiresIn=$expiresIn, sessionId=$sessionId, parentId=$parentId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'access_token'] = this.accessToken;
      json[r'refresh_token'] = this.refreshToken;
      json[r'token_type'] = this.tokenType;
      json[r'expires_in'] = this.expiresIn;
      json[r'session_id'] = this.sessionId;
      json[r'parent_id'] = this.parentId;
    return json;
  }

  /// Returns a new [TokenPairResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static TokenPairResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'access_token'), 'Required key "TokenPairResponse[access_token]" is missing from JSON.');
        assert(json[r'access_token'] != null, 'Required key "TokenPairResponse[access_token]" has a null value in JSON.');
        assert(json.containsKey(r'refresh_token'), 'Required key "TokenPairResponse[refresh_token]" is missing from JSON.');
        assert(json[r'refresh_token'] != null, 'Required key "TokenPairResponse[refresh_token]" has a null value in JSON.');
        assert(json.containsKey(r'token_type'), 'Required key "TokenPairResponse[token_type]" is missing from JSON.');
        assert(json[r'token_type'] != null, 'Required key "TokenPairResponse[token_type]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "TokenPairResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "TokenPairResponse[expires_in]" has a null value in JSON.');
        assert(json.containsKey(r'session_id'), 'Required key "TokenPairResponse[session_id]" is missing from JSON.');
        assert(json[r'session_id'] != null, 'Required key "TokenPairResponse[session_id]" has a null value in JSON.');
        assert(json.containsKey(r'parent_id'), 'Required key "TokenPairResponse[parent_id]" is missing from JSON.');
        assert(json[r'parent_id'] != null, 'Required key "TokenPairResponse[parent_id]" has a null value in JSON.');
        return true;
      }());

      return TokenPairResponse(
        accessToken: mapValueOfType<String>(json, r'access_token')!,
        refreshToken: mapValueOfType<String>(json, r'refresh_token')!,
        tokenType: TokenPairResponseTokenTypeEnum.fromJson(json[r'token_type'])!,
        expiresIn: TokenPairResponseExpiresInEnum.fromJson(json[r'expires_in'])!,
        sessionId: mapValueOfType<String>(json, r'session_id')!,
        parentId: mapValueOfType<String>(json, r'parent_id')!,
      );
    }
    return null;
  }

  static List<TokenPairResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <TokenPairResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = TokenPairResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, TokenPairResponse> mapFromJson(dynamic json) {
    final map = <String, TokenPairResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = TokenPairResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of TokenPairResponse-objects as value to a dart map
  static Map<String, List<TokenPairResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<TokenPairResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = TokenPairResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'access_token',
    'refresh_token',
    'token_type',
    'expires_in',
    'session_id',
    'parent_id',
  };
}


enum TokenPairResponseTokenTypeEnum {
  bearer._(r'Bearer'),
  ;

  /// Instantiate a new enum with the provided value.
  const TokenPairResponseTokenTypeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [TokenPairResponseTokenTypeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static TokenPairResponseTokenTypeEnum? fromJson(dynamic value) => TokenPairResponseTokenTypeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [TokenPairResponseTokenTypeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<TokenPairResponseTokenTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <TokenPairResponseTokenTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = TokenPairResponseTokenTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [TokenPairResponseTokenTypeEnum] to String,
/// and [decode] dynamic data back to [TokenPairResponseTokenTypeEnum].
class TokenPairResponseTokenTypeEnumTypeTransformer {
  factory TokenPairResponseTokenTypeEnumTypeTransformer() => _instance ??= const TokenPairResponseTokenTypeEnumTypeTransformer._();

  const TokenPairResponseTokenTypeEnumTypeTransformer._();

  String encode(TokenPairResponseTokenTypeEnum data) => data._value;

  /// Returns the instance of [TokenPairResponseTokenTypeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  TokenPairResponseTokenTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is TokenPairResponseTokenTypeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Bearer': return TokenPairResponseTokenTypeEnum.bearer;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static TokenPairResponseTokenTypeEnumTypeTransformer? _instance;
}



enum TokenPairResponseExpiresInEnum {
  number900._(900),
  ;

  /// Instantiate a new enum with the provided value.
  const TokenPairResponseExpiresInEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [TokenPairResponseExpiresInEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static TokenPairResponseExpiresInEnum? fromJson(dynamic value) => TokenPairResponseExpiresInEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [TokenPairResponseExpiresInEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<TokenPairResponseExpiresInEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <TokenPairResponseExpiresInEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = TokenPairResponseExpiresInEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [TokenPairResponseExpiresInEnum] to int,
/// and [decode] dynamic data back to [TokenPairResponseExpiresInEnum].
class TokenPairResponseExpiresInEnumTypeTransformer {
  factory TokenPairResponseExpiresInEnumTypeTransformer() => _instance ??= const TokenPairResponseExpiresInEnumTypeTransformer._();

  const TokenPairResponseExpiresInEnumTypeTransformer._();

  int encode(TokenPairResponseExpiresInEnum data) => data._value;

  /// Returns the instance of [TokenPairResponseExpiresInEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  TokenPairResponseExpiresInEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is TokenPairResponseExpiresInEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 900: return TokenPairResponseExpiresInEnum.number900;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static TokenPairResponseExpiresInEnumTypeTransformer? _instance;
}


