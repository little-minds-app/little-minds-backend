//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiActivityBreakdown {
  /// Returns a new [SessionKpiActivityBreakdown] instance.
  SessionKpiActivityBreakdown({
    required this.contentVersionId,
    required this.sessionStarts,
    required this.completedSessions,
    required this.playDurationSeconds,
  });

  String contentVersionId;

  /// Minimum value: 0
  int sessionStarts;

  /// Minimum value: 0
  int completedSessions;

  /// Minimum value: 0
  int playDurationSeconds;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiActivityBreakdown &&
    other.contentVersionId == contentVersionId &&
    other.sessionStarts == sessionStarts &&
    other.completedSessions == completedSessions &&
    other.playDurationSeconds == playDurationSeconds;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (contentVersionId.hashCode) +
    (sessionStarts.hashCode) +
    (completedSessions.hashCode) +
    (playDurationSeconds.hashCode);

  @override
  String toString() => 'SessionKpiActivityBreakdown[contentVersionId=$contentVersionId, sessionStarts=$sessionStarts, completedSessions=$completedSessions, playDurationSeconds=$playDurationSeconds]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'content_version_id'] = this.contentVersionId;
      json[r'session_starts'] = this.sessionStarts;
      json[r'completed_sessions'] = this.completedSessions;
      json[r'play_duration_seconds'] = this.playDurationSeconds;
    return json;
  }

  /// Returns a new [SessionKpiActivityBreakdown] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiActivityBreakdown? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'content_version_id'), 'Required key "SessionKpiActivityBreakdown[content_version_id]" is missing from JSON.');
        assert(json[r'content_version_id'] != null, 'Required key "SessionKpiActivityBreakdown[content_version_id]" has a null value in JSON.');
        assert(json.containsKey(r'session_starts'), 'Required key "SessionKpiActivityBreakdown[session_starts]" is missing from JSON.');
        assert(json[r'session_starts'] != null, 'Required key "SessionKpiActivityBreakdown[session_starts]" has a null value in JSON.');
        assert(json.containsKey(r'completed_sessions'), 'Required key "SessionKpiActivityBreakdown[completed_sessions]" is missing from JSON.');
        assert(json[r'completed_sessions'] != null, 'Required key "SessionKpiActivityBreakdown[completed_sessions]" has a null value in JSON.');
        assert(json.containsKey(r'play_duration_seconds'), 'Required key "SessionKpiActivityBreakdown[play_duration_seconds]" is missing from JSON.');
        assert(json[r'play_duration_seconds'] != null, 'Required key "SessionKpiActivityBreakdown[play_duration_seconds]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiActivityBreakdown(
        contentVersionId: mapValueOfType<String>(json, r'content_version_id')!,
        sessionStarts: mapValueOfType<int>(json, r'session_starts')!,
        completedSessions: mapValueOfType<int>(json, r'completed_sessions')!,
        playDurationSeconds: mapValueOfType<int>(json, r'play_duration_seconds')!,
      );
    }
    return null;
  }

  static List<SessionKpiActivityBreakdown> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiActivityBreakdown>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiActivityBreakdown.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiActivityBreakdown> mapFromJson(dynamic json) {
    final map = <String, SessionKpiActivityBreakdown>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiActivityBreakdown.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiActivityBreakdown-objects as value to a dart map
  static Map<String, List<SessionKpiActivityBreakdown>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiActivityBreakdown>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiActivityBreakdown.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'content_version_id',
    'session_starts',
    'completed_sessions',
    'play_duration_seconds',
  };
}

