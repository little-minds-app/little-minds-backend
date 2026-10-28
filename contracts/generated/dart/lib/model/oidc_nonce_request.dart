//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class OidcNonceRequest {
  /// Returns a new [OidcNonceRequest] instance.
  OidcNonceRequest({
    required this.provider,
  });

  /// Provider binding; cross-provider consume is rejected
  OidcNonceRequestProviderEnum provider;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OidcNonceRequest &&
    other.provider == provider;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (provider.hashCode);

  @override
  String toString() => 'OidcNonceRequest[provider=$provider]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'provider'] = this.provider;
    return json;
  }

  /// Returns a new [OidcNonceRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OidcNonceRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'provider'), 'Required key "OidcNonceRequest[provider]" is missing from JSON.');
        assert(json[r'provider'] != null, 'Required key "OidcNonceRequest[provider]" has a null value in JSON.');
        return true;
      }());

      return OidcNonceRequest(
        provider: OidcNonceRequestProviderEnum.fromJson(json[r'provider'])!,
      );
    }
    return null;
  }

  static List<OidcNonceRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OidcNonceRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OidcNonceRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OidcNonceRequest> mapFromJson(dynamic json) {
    final map = <String, OidcNonceRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OidcNonceRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OidcNonceRequest-objects as value to a dart map
  static Map<String, List<OidcNonceRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OidcNonceRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OidcNonceRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'provider',
  };
}

/// Provider binding; cross-provider consume is rejected
enum OidcNonceRequestProviderEnum {
  apple._(r'apple'),
  google._(r'google'),
  ;

  /// Instantiate a new enum with the provided value.
  const OidcNonceRequestProviderEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [OidcNonceRequestProviderEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static OidcNonceRequestProviderEnum? fromJson(dynamic value) => OidcNonceRequestProviderEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [OidcNonceRequestProviderEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<OidcNonceRequestProviderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OidcNonceRequestProviderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OidcNonceRequestProviderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [OidcNonceRequestProviderEnum] to String,
/// and [decode] dynamic data back to [OidcNonceRequestProviderEnum].
class OidcNonceRequestProviderEnumTypeTransformer {
  factory OidcNonceRequestProviderEnumTypeTransformer() => _instance ??= const OidcNonceRequestProviderEnumTypeTransformer._();

  const OidcNonceRequestProviderEnumTypeTransformer._();

  String encode(OidcNonceRequestProviderEnum data) => data._value;

  /// Returns the instance of [OidcNonceRequestProviderEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  OidcNonceRequestProviderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is OidcNonceRequestProviderEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'apple': return OidcNonceRequestProviderEnum.apple;
        case r'google': return OidcNonceRequestProviderEnum.google;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static OidcNonceRequestProviderEnumTypeTransformer? _instance;
}


