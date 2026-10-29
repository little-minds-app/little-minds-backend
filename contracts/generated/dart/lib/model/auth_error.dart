//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class AuthError {
  /// Returns a new [AuthError] instance.
  AuthError({
    required this.error,
    required this.message,
  });

  AuthErrorErrorEnum error;

  String message;

  @override
  bool operator ==(Object other) => identical(this, other) || other is AuthError &&
    other.error == error &&
    other.message == message;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (error.hashCode) +
    (message.hashCode);

  @override
  String toString() => 'AuthError[error=$error, message=$message]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'error'] = this.error;
      json[r'message'] = this.message;
    return json;
  }

  /// Returns a new [AuthError] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static AuthError? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'error'), 'Required key "AuthError[error]" is missing from JSON.');
        assert(json[r'error'] != null, 'Required key "AuthError[error]" has a null value in JSON.');
        assert(json.containsKey(r'message'), 'Required key "AuthError[message]" is missing from JSON.');
        assert(json[r'message'] != null, 'Required key "AuthError[message]" has a null value in JSON.');
        return true;
      }());

      return AuthError(
        error: AuthErrorErrorEnum.fromJson(json[r'error'])!,
        message: mapValueOfType<String>(json, r'message')!,
      );
    }
    return null;
  }

  static List<AuthError> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <AuthError>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = AuthError.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, AuthError> mapFromJson(dynamic json) {
    final map = <String, AuthError>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = AuthError.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of AuthError-objects as value to a dart map
  static Map<String, List<AuthError>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<AuthError>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = AuthError.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'error',
    'message',
  };
}


enum AuthErrorErrorEnum {
  invalidRequest._(r'invalid_request'),
  invalidToken._(r'invalid_token'),
  expiredToken._(r'expired_token'),
  revokedSession._(r'revoked_session'),
  refreshReuse._(r'refresh_reuse'),
  rateLimited._(r'rate_limited'),
  sessionLimitExceeded._(r'session_limit_exceeded'),
  bootstrapDisabled._(r'bootstrap_disabled'),
  otpInvalid._(r'otp_invalid'),
  otpCooldown._(r'otp_cooldown'),
  smsUnavailable._(r'sms_unavailable'),
  mailUnavailable._(r'mail_unavailable'),
  identityCollision._(r'identity_collision'),
  ;

  /// Instantiate a new enum with the provided value.
  const AuthErrorErrorEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [AuthErrorErrorEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static AuthErrorErrorEnum? fromJson(dynamic value) => AuthErrorErrorEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [AuthErrorErrorEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<AuthErrorErrorEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <AuthErrorErrorEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = AuthErrorErrorEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [AuthErrorErrorEnum] to String,
/// and [decode] dynamic data back to [AuthErrorErrorEnum].
class AuthErrorErrorEnumTypeTransformer {
  factory AuthErrorErrorEnumTypeTransformer() => _instance ??= const AuthErrorErrorEnumTypeTransformer._();

  const AuthErrorErrorEnumTypeTransformer._();

  String encode(AuthErrorErrorEnum data) => data._value;

  /// Returns the instance of [AuthErrorErrorEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  AuthErrorErrorEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is AuthErrorErrorEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'invalid_request': return AuthErrorErrorEnum.invalidRequest;
        case r'invalid_token': return AuthErrorErrorEnum.invalidToken;
        case r'expired_token': return AuthErrorErrorEnum.expiredToken;
        case r'revoked_session': return AuthErrorErrorEnum.revokedSession;
        case r'refresh_reuse': return AuthErrorErrorEnum.refreshReuse;
        case r'rate_limited': return AuthErrorErrorEnum.rateLimited;
        case r'session_limit_exceeded': return AuthErrorErrorEnum.sessionLimitExceeded;
        case r'bootstrap_disabled': return AuthErrorErrorEnum.bootstrapDisabled;
        case r'otp_invalid': return AuthErrorErrorEnum.otpInvalid;
        case r'otp_cooldown': return AuthErrorErrorEnum.otpCooldown;
        case r'sms_unavailable': return AuthErrorErrorEnum.smsUnavailable;
        case r'mail_unavailable': return AuthErrorErrorEnum.mailUnavailable;
        case r'identity_collision': return AuthErrorErrorEnum.identityCollision;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static AuthErrorErrorEnumTypeTransformer? _instance;
}


