//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class EmailOtpStartResponse {
  /// Returns a new [EmailOtpStartResponse] instance.
  EmailOtpStartResponse({
    required this.challengeId,
    required this.expiresIn,
    required this.resendAfter,
  });

  /// RFC 4122 UUID with version nibble 4 or 7
  String challengeId;

  EmailOtpStartResponseExpiresInEnum expiresIn;

  EmailOtpStartResponseResendAfterEnum resendAfter;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EmailOtpStartResponse &&
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
  String toString() => 'EmailOtpStartResponse[challengeId=$challengeId, expiresIn=$expiresIn, resendAfter=$resendAfter]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'challenge_id'] = this.challengeId;
      json[r'expires_in'] = this.expiresIn;
      json[r'resend_after'] = this.resendAfter;
    return json;
  }

  /// Returns a new [EmailOtpStartResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EmailOtpStartResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'challenge_id'), 'Required key "EmailOtpStartResponse[challenge_id]" is missing from JSON.');
        assert(json[r'challenge_id'] != null, 'Required key "EmailOtpStartResponse[challenge_id]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "EmailOtpStartResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "EmailOtpStartResponse[expires_in]" has a null value in JSON.');
        assert(json.containsKey(r'resend_after'), 'Required key "EmailOtpStartResponse[resend_after]" is missing from JSON.');
        assert(json[r'resend_after'] != null, 'Required key "EmailOtpStartResponse[resend_after]" has a null value in JSON.');
        return true;
      }());

      return EmailOtpStartResponse(
        challengeId: mapValueOfType<String>(json, r'challenge_id')!,
        expiresIn: EmailOtpStartResponseExpiresInEnum.fromJson(json[r'expires_in'])!,
        resendAfter: EmailOtpStartResponseResendAfterEnum.fromJson(json[r'resend_after'])!,
      );
    }
    return null;
  }

  static List<EmailOtpStartResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EmailOtpStartResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EmailOtpStartResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EmailOtpStartResponse> mapFromJson(dynamic json) {
    final map = <String, EmailOtpStartResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EmailOtpStartResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EmailOtpStartResponse-objects as value to a dart map
  static Map<String, List<EmailOtpStartResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EmailOtpStartResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EmailOtpStartResponse.listFromJson(entry.value, growable: growable,);
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


enum EmailOtpStartResponseExpiresInEnum {
  number600._(600),
  ;

  /// Instantiate a new enum with the provided value.
  const EmailOtpStartResponseExpiresInEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [EmailOtpStartResponseExpiresInEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EmailOtpStartResponseExpiresInEnum? fromJson(dynamic value) => EmailOtpStartResponseExpiresInEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EmailOtpStartResponseExpiresInEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EmailOtpStartResponseExpiresInEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EmailOtpStartResponseExpiresInEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EmailOtpStartResponseExpiresInEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EmailOtpStartResponseExpiresInEnum] to int,
/// and [decode] dynamic data back to [EmailOtpStartResponseExpiresInEnum].
class EmailOtpStartResponseExpiresInEnumTypeTransformer {
  factory EmailOtpStartResponseExpiresInEnumTypeTransformer() => _instance ??= const EmailOtpStartResponseExpiresInEnumTypeTransformer._();

  const EmailOtpStartResponseExpiresInEnumTypeTransformer._();

  int encode(EmailOtpStartResponseExpiresInEnum data) => data._value;

  /// Returns the instance of [EmailOtpStartResponseExpiresInEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EmailOtpStartResponseExpiresInEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EmailOtpStartResponseExpiresInEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 600: return EmailOtpStartResponseExpiresInEnum.number600;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EmailOtpStartResponseExpiresInEnumTypeTransformer? _instance;
}



enum EmailOtpStartResponseResendAfterEnum {
  number60._(60),
  ;

  /// Instantiate a new enum with the provided value.
  const EmailOtpStartResponseResendAfterEnum._(this._value);

  /// The underlying value of this enum member.
  final int _value;

  @override
  String toString() => _value.toString();

  /// Encodes this enum as a value suitable for JSON.
  int toJson() => _value;

  /// Returns the instance of [EmailOtpStartResponseResendAfterEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EmailOtpStartResponseResendAfterEnum? fromJson(dynamic value) => EmailOtpStartResponseResendAfterEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EmailOtpStartResponseResendAfterEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EmailOtpStartResponseResendAfterEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EmailOtpStartResponseResendAfterEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EmailOtpStartResponseResendAfterEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EmailOtpStartResponseResendAfterEnum] to int,
/// and [decode] dynamic data back to [EmailOtpStartResponseResendAfterEnum].
class EmailOtpStartResponseResendAfterEnumTypeTransformer {
  factory EmailOtpStartResponseResendAfterEnumTypeTransformer() => _instance ??= const EmailOtpStartResponseResendAfterEnumTypeTransformer._();

  const EmailOtpStartResponseResendAfterEnumTypeTransformer._();

  int encode(EmailOtpStartResponseResendAfterEnum data) => data._value;

  /// Returns the instance of [EmailOtpStartResponseResendAfterEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EmailOtpStartResponseResendAfterEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EmailOtpStartResponseResendAfterEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case 60: return EmailOtpStartResponseResendAfterEnum.number60;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EmailOtpStartResponseResendAfterEnumTypeTransformer? _instance;
}


