//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class PhoneOtpStartResponse {
  /// Returns a new [PhoneOtpStartResponse] instance.
  PhoneOtpStartResponse({
    required this.challengeId,
    required this.expiresIn,
    required this.resendAfter,
  });

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String challengeId;

  PhoneOtpStartResponseExpiresInEnum expiresIn;

  PhoneOtpStartResponseResendAfterEnum resendAfter;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PhoneOtpStartResponse &&
    other.challengeId == challengeId &&
    other.expiresIn == expiresIn &&
    other.resendAfter == resendAfter;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (challengeId.hashCode) +
    (expiresIn.hashCode) +
    (resendAfter.hashCode);

  @override
  String toString() => 'PhoneOtpStartResponse[challengeId=$challengeId, expiresIn=$expiresIn, resendAfter=$resendAfter]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'challenge_id'] = this.challengeId;
      json[r'expires_in'] = this.expiresIn;
      json[r'resend_after'] = this.resendAfter;
    return json;
  }

  /// Returns a new [PhoneOtpStartResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PhoneOtpStartResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'challenge_id'), 'Required key "PhoneOtpStartResponse[challenge_id]" is missing from JSON.');
        assert(json[r'challenge_id'] != null, 'Required key "PhoneOtpStartResponse[challenge_id]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "PhoneOtpStartResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "PhoneOtpStartResponse[expires_in]" has a null value in JSON.');
        assert(json.containsKey(r'resend_after'), 'Required key "PhoneOtpStartResponse[resend_after]" is missing from JSON.');
        assert(json[r'resend_after'] != null, 'Required key "PhoneOtpStartResponse[resend_after]" has a null value in JSON.');
        return true;
      }());

      return PhoneOtpStartResponse(
        challengeId: mapValueOfType<String>(json, r'challenge_id')!,
        expiresIn: PhoneOtpStartResponseExpiresInEnum.fromJson(json[r'expires_in'])!,
        resendAfter: PhoneOtpStartResponseResendAfterEnum.fromJson(json[r'resend_after'])!,
      );
    }
    return null;
  }

  static List<PhoneOtpStartResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PhoneOtpStartResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PhoneOtpStartResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PhoneOtpStartResponse> mapFromJson(dynamic json) {
    final map = <String, PhoneOtpStartResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PhoneOtpStartResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PhoneOtpStartResponse-objects as value to a dart map
  static Map<String, List<PhoneOtpStartResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PhoneOtpStartResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PhoneOtpStartResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'challenge_id',
    'expires_in',
    'resend_after',
  };
}


enum PhoneOtpStartResponseExpiresInEnum {
  number300._(300),
  ;

  /// Instantiate a new enum with the provided value.
  const PhoneOtpStartResponseExpiresInEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [PhoneOtpStartResponseExpiresInEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static PhoneOtpStartResponseExpiresInEnum? fromJson(dynamic value) => PhoneOtpStartResponseExpiresInEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [PhoneOtpStartResponseExpiresInEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<PhoneOtpStartResponseExpiresInEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PhoneOtpStartResponseExpiresInEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PhoneOtpStartResponseExpiresInEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [PhoneOtpStartResponseExpiresInEnum] to int,
/// and [decode] dynamic data back to [PhoneOtpStartResponseExpiresInEnum].
class PhoneOtpStartResponseExpiresInEnumTypeTransformer {
  factory PhoneOtpStartResponseExpiresInEnumTypeTransformer() => _instance ??= const PhoneOtpStartResponseExpiresInEnumTypeTransformer._();

  const PhoneOtpStartResponseExpiresInEnumTypeTransformer._();

  int encode(PhoneOtpStartResponseExpiresInEnum data) => data._value;

  /// Returns the instance of [PhoneOtpStartResponseExpiresInEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  PhoneOtpStartResponseExpiresInEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is PhoneOtpStartResponseExpiresInEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 300: return PhoneOtpStartResponseExpiresInEnum.number300;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static PhoneOtpStartResponseExpiresInEnumTypeTransformer? _instance;
}



enum PhoneOtpStartResponseResendAfterEnum {
  number60._(60),
  ;

  /// Instantiate a new enum with the provided value.
  const PhoneOtpStartResponseResendAfterEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [PhoneOtpStartResponseResendAfterEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static PhoneOtpStartResponseResendAfterEnum? fromJson(dynamic value) => PhoneOtpStartResponseResendAfterEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [PhoneOtpStartResponseResendAfterEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<PhoneOtpStartResponseResendAfterEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PhoneOtpStartResponseResendAfterEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PhoneOtpStartResponseResendAfterEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [PhoneOtpStartResponseResendAfterEnum] to int,
/// and [decode] dynamic data back to [PhoneOtpStartResponseResendAfterEnum].
class PhoneOtpStartResponseResendAfterEnumTypeTransformer {
  factory PhoneOtpStartResponseResendAfterEnumTypeTransformer() => _instance ??= const PhoneOtpStartResponseResendAfterEnumTypeTransformer._();

  const PhoneOtpStartResponseResendAfterEnumTypeTransformer._();

  int encode(PhoneOtpStartResponseResendAfterEnum data) => data._value;

  /// Returns the instance of [PhoneOtpStartResponseResendAfterEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  PhoneOtpStartResponseResendAfterEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is PhoneOtpStartResponseResendAfterEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 60: return PhoneOtpStartResponseResendAfterEnum.number60;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static PhoneOtpStartResponseResendAfterEnumTypeTransformer? _instance;
}


