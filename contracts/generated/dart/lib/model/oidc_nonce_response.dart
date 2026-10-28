//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class OidcNonceResponse {
  /// Returns a new [OidcNonceResponse] instance.
  OidcNonceResponse({
    required this.nonce,
    required this.expiresIn,
  });

  String nonce;

  OidcNonceResponseExpiresInEnum expiresIn;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OidcNonceResponse &&
    other.nonce == nonce &&
    other.expiresIn == expiresIn;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (nonce.hashCode) +
    (expiresIn.hashCode);

  @override
  String toString() => 'OidcNonceResponse[nonce=$nonce, expiresIn=$expiresIn]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'nonce'] = this.nonce;
      json[r'expires_in'] = this.expiresIn;
    return json;
  }

  /// Returns a new [OidcNonceResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OidcNonceResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'nonce'), 'Required key "OidcNonceResponse[nonce]" is missing from JSON.');
        assert(json[r'nonce'] != null, 'Required key "OidcNonceResponse[nonce]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "OidcNonceResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "OidcNonceResponse[expires_in]" has a null value in JSON.');
        return true;
      }());

      return OidcNonceResponse(
        nonce: mapValueOfType<String>(json, r'nonce')!,
        expiresIn: OidcNonceResponseExpiresInEnum.fromJson(json[r'expires_in'])!,
      );
    }
    return null;
  }

  static List<OidcNonceResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OidcNonceResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OidcNonceResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OidcNonceResponse> mapFromJson(dynamic json) {
    final map = <String, OidcNonceResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OidcNonceResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OidcNonceResponse-objects as value to a dart map
  static Map<String, List<OidcNonceResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OidcNonceResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OidcNonceResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'nonce',
    'expires_in',
  };
}


enum OidcNonceResponseExpiresInEnum {
  number600._(600),
  ;

  /// Instantiate a new enum with the provided value.
  const OidcNonceResponseExpiresInEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [OidcNonceResponseExpiresInEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static OidcNonceResponseExpiresInEnum? fromJson(dynamic value) => OidcNonceResponseExpiresInEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [OidcNonceResponseExpiresInEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<OidcNonceResponseExpiresInEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OidcNonceResponseExpiresInEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OidcNonceResponseExpiresInEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [OidcNonceResponseExpiresInEnum] to int,
/// and [decode] dynamic data back to [OidcNonceResponseExpiresInEnum].
class OidcNonceResponseExpiresInEnumTypeTransformer {
  factory OidcNonceResponseExpiresInEnumTypeTransformer() => _instance ??= const OidcNonceResponseExpiresInEnumTypeTransformer._();

  const OidcNonceResponseExpiresInEnumTypeTransformer._();

  int encode(OidcNonceResponseExpiresInEnum data) => data._value;

  /// Returns the instance of [OidcNonceResponseExpiresInEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  OidcNonceResponseExpiresInEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is OidcNonceResponseExpiresInEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 600: return OidcNonceResponseExpiresInEnum.number600;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static OidcNonceResponseExpiresInEnumTypeTransformer? _instance;
}


