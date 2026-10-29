//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class EmailOtpStartRequest {
  /// Returns a new [EmailOtpStartRequest] instance.
  EmailOtpStartRequest({
    required this.email,
    required this.noticeVersion,
    required this.noticeLocale,
    this.clientSurface,
  });

  String email;

  String noticeVersion;

  String noticeLocale;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? clientSurface;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EmailOtpStartRequest &&
    other.email == email &&
    other.noticeVersion == noticeVersion &&
    other.noticeLocale == noticeLocale &&
    other.clientSurface == clientSurface;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (email.hashCode) +
    (noticeVersion.hashCode) +
    (noticeLocale.hashCode) +
    (clientSurface == null ? 0 : clientSurface!.hashCode);

  @override
  String toString() => 'EmailOtpStartRequest[email=$email, noticeVersion=$noticeVersion, noticeLocale=$noticeLocale, clientSurface=$clientSurface]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'email'] = this.email;
      json[r'notice_version'] = this.noticeVersion;
      json[r'notice_locale'] = this.noticeLocale;
    if (this.clientSurface != null) {
      json[r'client_surface'] = this.clientSurface;
    } else {
      json[r'client_surface'] = null;
    }
    return json;
  }

  /// Returns a new [EmailOtpStartRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EmailOtpStartRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'email'), 'Required key "EmailOtpStartRequest[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "EmailOtpStartRequest[email]" has a null value in JSON.');
        assert(json.containsKey(r'notice_version'), 'Required key "EmailOtpStartRequest[notice_version]" is missing from JSON.');
        assert(json[r'notice_version'] != null, 'Required key "EmailOtpStartRequest[notice_version]" has a null value in JSON.');
        assert(json.containsKey(r'notice_locale'), 'Required key "EmailOtpStartRequest[notice_locale]" is missing from JSON.');
        assert(json[r'notice_locale'] != null, 'Required key "EmailOtpStartRequest[notice_locale]" has a null value in JSON.');
        return true;
      }());

      return EmailOtpStartRequest(
        email: mapValueOfType<String>(json, r'email')!,
        noticeVersion: mapValueOfType<String>(json, r'notice_version')!,
        noticeLocale: mapValueOfType<String>(json, r'notice_locale')!,
        clientSurface: mapValueOfType<String>(json, r'client_surface'),
      );
    }
    return null;
  }

  static List<EmailOtpStartRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EmailOtpStartRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EmailOtpStartRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EmailOtpStartRequest> mapFromJson(dynamic json) {
    final map = <String, EmailOtpStartRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EmailOtpStartRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EmailOtpStartRequest-objects as value to a dart map
  static Map<String, List<EmailOtpStartRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EmailOtpStartRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EmailOtpStartRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'email',
    'notice_version',
    'notice_locale',
  };
}

