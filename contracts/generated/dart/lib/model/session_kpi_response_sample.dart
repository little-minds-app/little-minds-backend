//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiResponseSample {
  /// Returns a new [SessionKpiResponseSample] instance.
  SessionKpiResponseSample({
    required this.eligibleSessions,
    required this.terminalSessions,
    required this.excludedUnsupportedSchema,
    required this.excludedConsent,
  });

  /// Minimum value: 0
  int eligibleSessions;

  /// Minimum value: 0
  int terminalSessions;

  /// Minimum value: 0
  int excludedUnsupportedSchema;

  /// Minimum value: 0
  int excludedConsent;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiResponseSample &&
    other.eligibleSessions == eligibleSessions &&
    other.terminalSessions == terminalSessions &&
    other.excludedUnsupportedSchema == excludedUnsupportedSchema &&
    other.excludedConsent == excludedConsent;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (eligibleSessions.hashCode) +
    (terminalSessions.hashCode) +
    (excludedUnsupportedSchema.hashCode) +
    (excludedConsent.hashCode);

  @override
  String toString() => 'SessionKpiResponseSample[eligibleSessions=$eligibleSessions, terminalSessions=$terminalSessions, excludedUnsupportedSchema=$excludedUnsupportedSchema, excludedConsent=$excludedConsent]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'eligible_sessions'] = this.eligibleSessions;
      json[r'terminal_sessions'] = this.terminalSessions;
      json[r'excluded_unsupported_schema'] = this.excludedUnsupportedSchema;
      json[r'excluded_consent'] = this.excludedConsent;
    return json;
  }

  /// Returns a new [SessionKpiResponseSample] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiResponseSample? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'eligible_sessions'), 'Required key "SessionKpiResponseSample[eligible_sessions]" is missing from JSON.');
        assert(json[r'eligible_sessions'] != null, 'Required key "SessionKpiResponseSample[eligible_sessions]" has a null value in JSON.');
        assert(json.containsKey(r'terminal_sessions'), 'Required key "SessionKpiResponseSample[terminal_sessions]" is missing from JSON.');
        assert(json[r'terminal_sessions'] != null, 'Required key "SessionKpiResponseSample[terminal_sessions]" has a null value in JSON.');
        assert(json.containsKey(r'excluded_unsupported_schema'), 'Required key "SessionKpiResponseSample[excluded_unsupported_schema]" is missing from JSON.');
        assert(json[r'excluded_unsupported_schema'] != null, 'Required key "SessionKpiResponseSample[excluded_unsupported_schema]" has a null value in JSON.');
        assert(json.containsKey(r'excluded_consent'), 'Required key "SessionKpiResponseSample[excluded_consent]" is missing from JSON.');
        assert(json[r'excluded_consent'] != null, 'Required key "SessionKpiResponseSample[excluded_consent]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiResponseSample(
        eligibleSessions: mapValueOfType<int>(json, r'eligible_sessions')!,
        terminalSessions: mapValueOfType<int>(json, r'terminal_sessions')!,
        excludedUnsupportedSchema: mapValueOfType<int>(json, r'excluded_unsupported_schema')!,
        excludedConsent: mapValueOfType<int>(json, r'excluded_consent')!,
      );
    }
    return null;
  }

  static List<SessionKpiResponseSample> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseSample>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseSample.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiResponseSample> mapFromJson(dynamic json) {
    final map = <String, SessionKpiResponseSample>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiResponseSample.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiResponseSample-objects as value to a dart map
  static Map<String, List<SessionKpiResponseSample>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiResponseSample>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiResponseSample.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'eligible_sessions',
    'terminal_sessions',
    'excluded_unsupported_schema',
    'excluded_consent',
  };
}

