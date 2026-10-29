//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GooglePkceStartResponse {
  /// Returns a new [GooglePkceStartResponse] instance.
  GooglePkceStartResponse({
    required this.state,
    required this.expiresIn,
    required this.clientId,
  });

  /// Opaque one-time oauth_state for POST /v1/auth/google
  String state;

  GooglePkceStartResponseExpiresInEnum expiresIn;

  /// Bound Google OAuth client_id for this transaction
  String clientId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is GooglePkceStartResponse &&
    other.state == state &&
    other.expiresIn == expiresIn &&
    other.clientId == clientId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (state.hashCode) +
    (expiresIn.hashCode) +
    (clientId.hashCode);

  @override
  String toString() => 'GooglePkceStartResponse[state=$state, expiresIn=$expiresIn, clientId=$clientId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'state'] = this.state;
      json[r'expires_in'] = this.expiresIn;
      json[r'client_id'] = this.clientId;
    return json;
  }

  /// Returns a new [GooglePkceStartResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GooglePkceStartResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'state'), 'Required key "GooglePkceStartResponse[state]" is missing from JSON.');
        assert(json[r'state'] != null, 'Required key "GooglePkceStartResponse[state]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "GooglePkceStartResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "GooglePkceStartResponse[expires_in]" has a null value in JSON.');
        assert(json.containsKey(r'client_id'), 'Required key "GooglePkceStartResponse[client_id]" is missing from JSON.');
        assert(json[r'client_id'] != null, 'Required key "GooglePkceStartResponse[client_id]" has a null value in JSON.');
        return true;
      }());

      return GooglePkceStartResponse(
        state: mapValueOfType<String>(json, r'state')!,
        expiresIn: GooglePkceStartResponseExpiresInEnum.fromJson(json[r'expires_in'])!,
        clientId: mapValueOfType<String>(json, r'client_id')!,
      );
    }
    return null;
  }

  static List<GooglePkceStartResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GooglePkceStartResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GooglePkceStartResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GooglePkceStartResponse> mapFromJson(dynamic json) {
    final map = <String, GooglePkceStartResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GooglePkceStartResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GooglePkceStartResponse-objects as value to a dart map
  static Map<String, List<GooglePkceStartResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GooglePkceStartResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GooglePkceStartResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'state',
    'expires_in',
    'client_id',
  };
}


enum GooglePkceStartResponseExpiresInEnum {
  number600._(600),
  ;

  /// Instantiate a new enum with the provided value.
  const GooglePkceStartResponseExpiresInEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [GooglePkceStartResponseExpiresInEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static GooglePkceStartResponseExpiresInEnum? fromJson(dynamic value) => GooglePkceStartResponseExpiresInEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [GooglePkceStartResponseExpiresInEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<GooglePkceStartResponseExpiresInEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GooglePkceStartResponseExpiresInEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GooglePkceStartResponseExpiresInEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [GooglePkceStartResponseExpiresInEnum] to int,
/// and [decode] dynamic data back to [GooglePkceStartResponseExpiresInEnum].
class GooglePkceStartResponseExpiresInEnumTypeTransformer {
  factory GooglePkceStartResponseExpiresInEnumTypeTransformer() => _instance ??= const GooglePkceStartResponseExpiresInEnumTypeTransformer._();

  const GooglePkceStartResponseExpiresInEnumTypeTransformer._();

  int encode(GooglePkceStartResponseExpiresInEnum data) => data._value;

  /// Returns the instance of [GooglePkceStartResponseExpiresInEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  GooglePkceStartResponseExpiresInEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is GooglePkceStartResponseExpiresInEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 600: return GooglePkceStartResponseExpiresInEnum.number600;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static GooglePkceStartResponseExpiresInEnumTypeTransformer? _instance;
}


