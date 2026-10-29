//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class StepUpResponse {
  /// Returns a new [StepUpResponse] instance.
  StepUpResponse({
    required this.stepUpToken,
    required this.expiresIn,
    required this.purpose,
  });

  /// Opaque one-time token; present on link within TTL
  String stepUpToken;

  StepUpResponseExpiresInEnum expiresIn;

  StepUpResponsePurposeEnum purpose;

  @override
  bool operator ==(Object other) => identical(this, other) || other is StepUpResponse &&
    other.stepUpToken == stepUpToken &&
    other.expiresIn == expiresIn &&
    other.purpose == purpose;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (stepUpToken.hashCode) +
    (expiresIn.hashCode) +
    (purpose.hashCode);

  @override
  String toString() => 'StepUpResponse[stepUpToken=$stepUpToken, expiresIn=$expiresIn, purpose=$purpose]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'step_up_token'] = this.stepUpToken;
      json[r'expires_in'] = this.expiresIn;
      json[r'purpose'] = this.purpose;
    return json;
  }

  /// Returns a new [StepUpResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static StepUpResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'step_up_token'), 'Required key "StepUpResponse[step_up_token]" is missing from JSON.');
        assert(json[r'step_up_token'] != null, 'Required key "StepUpResponse[step_up_token]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "StepUpResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "StepUpResponse[expires_in]" has a null value in JSON.');
        assert(json.containsKey(r'purpose'), 'Required key "StepUpResponse[purpose]" is missing from JSON.');
        assert(json[r'purpose'] != null, 'Required key "StepUpResponse[purpose]" has a null value in JSON.');
        return true;
      }());

      return StepUpResponse(
        stepUpToken: mapValueOfType<String>(json, r'step_up_token')!,
        expiresIn: StepUpResponseExpiresInEnum.fromJson(json[r'expires_in'])!,
        purpose: StepUpResponsePurposeEnum.fromJson(json[r'purpose'])!,
      );
    }
    return null;
  }

  static List<StepUpResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <StepUpResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = StepUpResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, StepUpResponse> mapFromJson(dynamic json) {
    final map = <String, StepUpResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = StepUpResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of StepUpResponse-objects as value to a dart map
  static Map<String, List<StepUpResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<StepUpResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = StepUpResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'step_up_token',
    'expires_in',
    'purpose',
  };
}


enum StepUpResponseExpiresInEnum {
  number300._(300),
  ;

  /// Instantiate a new enum with the provided value.
  const StepUpResponseExpiresInEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [StepUpResponseExpiresInEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static StepUpResponseExpiresInEnum? fromJson(dynamic value) => StepUpResponseExpiresInEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [StepUpResponseExpiresInEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<StepUpResponseExpiresInEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <StepUpResponseExpiresInEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = StepUpResponseExpiresInEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [StepUpResponseExpiresInEnum] to int,
/// and [decode] dynamic data back to [StepUpResponseExpiresInEnum].
class StepUpResponseExpiresInEnumTypeTransformer {
  factory StepUpResponseExpiresInEnumTypeTransformer() => _instance ??= const StepUpResponseExpiresInEnumTypeTransformer._();

  const StepUpResponseExpiresInEnumTypeTransformer._();

  int encode(StepUpResponseExpiresInEnum data) => data._value;

  /// Returns the instance of [StepUpResponseExpiresInEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  StepUpResponseExpiresInEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is StepUpResponseExpiresInEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 300: return StepUpResponseExpiresInEnum.number300;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static StepUpResponseExpiresInEnumTypeTransformer? _instance;
}



enum StepUpResponsePurposeEnum {
  identityLink._(r'identity_link'),
  ;

  /// Instantiate a new enum with the provided value.
  const StepUpResponsePurposeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [StepUpResponsePurposeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static StepUpResponsePurposeEnum? fromJson(dynamic value) => StepUpResponsePurposeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [StepUpResponsePurposeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<StepUpResponsePurposeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <StepUpResponsePurposeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = StepUpResponsePurposeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [StepUpResponsePurposeEnum] to String,
/// and [decode] dynamic data back to [StepUpResponsePurposeEnum].
class StepUpResponsePurposeEnumTypeTransformer {
  factory StepUpResponsePurposeEnumTypeTransformer() => _instance ??= const StepUpResponsePurposeEnumTypeTransformer._();

  const StepUpResponsePurposeEnumTypeTransformer._();

  String encode(StepUpResponsePurposeEnum data) => data._value;

  /// Returns the instance of [StepUpResponsePurposeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  StepUpResponsePurposeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is StepUpResponsePurposeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'identity_link': return StepUpResponsePurposeEnum.identityLink;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static StepUpResponsePurposeEnumTypeTransformer? _instance;
}


