//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiResponseMetrics {
  /// Returns a new [SessionKpiResponseMetrics] instance.
  SessionKpiResponseMetrics({
    required this.eligibleSessionCount,
    required this.completedSessionCount,
    required this.interruptedSessionCount,
    required this.abandonedSessionCount,
    required this.inProgressSessionCount,
    required this.totalPlayDurationSeconds,
    required this.completedSessionRate,
    required this.distinctPlayDays,
    this.byActivity = const [],
    required this.firstAttemptAccuracy,
  });

  /// Minimum value: 0
  int eligibleSessionCount;

  /// Minimum value: 0
  int completedSessionCount;

  /// Minimum value: 0
  int interruptedSessionCount;

  /// Minimum value: 0
  int abandonedSessionCount;

  /// Minimum value: 0
  int inProgressSessionCount;

  /// Minimum value: 0
  int totalPlayDurationSeconds;

  SessionKpiRateMetric completedSessionRate;

  /// Minimum value: 0
  int distinctPlayDays;

  List<SessionKpiActivityBreakdown> byActivity;

  SessionKpiRateMetric firstAttemptAccuracy;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiResponseMetrics &&
    other.eligibleSessionCount == eligibleSessionCount &&
    other.completedSessionCount == completedSessionCount &&
    other.interruptedSessionCount == interruptedSessionCount &&
    other.abandonedSessionCount == abandonedSessionCount &&
    other.inProgressSessionCount == inProgressSessionCount &&
    other.totalPlayDurationSeconds == totalPlayDurationSeconds &&
    other.completedSessionRate == completedSessionRate &&
    other.distinctPlayDays == distinctPlayDays &&
    _deepEquality.equals(other.byActivity, byActivity) &&
    other.firstAttemptAccuracy == firstAttemptAccuracy;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (eligibleSessionCount.hashCode) +
    (completedSessionCount.hashCode) +
    (interruptedSessionCount.hashCode) +
    (abandonedSessionCount.hashCode) +
    (inProgressSessionCount.hashCode) +
    (totalPlayDurationSeconds.hashCode) +
    (completedSessionRate.hashCode) +
    (distinctPlayDays.hashCode) +
    (byActivity.hashCode) +
    (firstAttemptAccuracy.hashCode);

  @override
  String toString() => 'SessionKpiResponseMetrics[eligibleSessionCount=$eligibleSessionCount, completedSessionCount=$completedSessionCount, interruptedSessionCount=$interruptedSessionCount, abandonedSessionCount=$abandonedSessionCount, inProgressSessionCount=$inProgressSessionCount, totalPlayDurationSeconds=$totalPlayDurationSeconds, completedSessionRate=$completedSessionRate, distinctPlayDays=$distinctPlayDays, byActivity=$byActivity, firstAttemptAccuracy=$firstAttemptAccuracy]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'eligible_session_count'] = this.eligibleSessionCount;
      json[r'completed_session_count'] = this.completedSessionCount;
      json[r'interrupted_session_count'] = this.interruptedSessionCount;
      json[r'abandoned_session_count'] = this.abandonedSessionCount;
      json[r'in_progress_session_count'] = this.inProgressSessionCount;
      json[r'total_play_duration_seconds'] = this.totalPlayDurationSeconds;
      json[r'completed_session_rate'] = this.completedSessionRate;
      json[r'distinct_play_days'] = this.distinctPlayDays;
      json[r'by_activity'] = this.byActivity;
      json[r'first_attempt_accuracy'] = this.firstAttemptAccuracy;
    return json;
  }

  /// Returns a new [SessionKpiResponseMetrics] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiResponseMetrics? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'eligible_session_count'), 'Required key "SessionKpiResponseMetrics[eligible_session_count]" is missing from JSON.');
        assert(json[r'eligible_session_count'] != null, 'Required key "SessionKpiResponseMetrics[eligible_session_count]" has a null value in JSON.');
        assert(json.containsKey(r'completed_session_count'), 'Required key "SessionKpiResponseMetrics[completed_session_count]" is missing from JSON.');
        assert(json[r'completed_session_count'] != null, 'Required key "SessionKpiResponseMetrics[completed_session_count]" has a null value in JSON.');
        assert(json.containsKey(r'interrupted_session_count'), 'Required key "SessionKpiResponseMetrics[interrupted_session_count]" is missing from JSON.');
        assert(json[r'interrupted_session_count'] != null, 'Required key "SessionKpiResponseMetrics[interrupted_session_count]" has a null value in JSON.');
        assert(json.containsKey(r'abandoned_session_count'), 'Required key "SessionKpiResponseMetrics[abandoned_session_count]" is missing from JSON.');
        assert(json[r'abandoned_session_count'] != null, 'Required key "SessionKpiResponseMetrics[abandoned_session_count]" has a null value in JSON.');
        assert(json.containsKey(r'in_progress_session_count'), 'Required key "SessionKpiResponseMetrics[in_progress_session_count]" is missing from JSON.');
        assert(json[r'in_progress_session_count'] != null, 'Required key "SessionKpiResponseMetrics[in_progress_session_count]" has a null value in JSON.');
        assert(json.containsKey(r'total_play_duration_seconds'), 'Required key "SessionKpiResponseMetrics[total_play_duration_seconds]" is missing from JSON.');
        assert(json[r'total_play_duration_seconds'] != null, 'Required key "SessionKpiResponseMetrics[total_play_duration_seconds]" has a null value in JSON.');
        assert(json.containsKey(r'completed_session_rate'), 'Required key "SessionKpiResponseMetrics[completed_session_rate]" is missing from JSON.');
        assert(json[r'completed_session_rate'] != null, 'Required key "SessionKpiResponseMetrics[completed_session_rate]" has a null value in JSON.');
        assert(json.containsKey(r'distinct_play_days'), 'Required key "SessionKpiResponseMetrics[distinct_play_days]" is missing from JSON.');
        assert(json[r'distinct_play_days'] != null, 'Required key "SessionKpiResponseMetrics[distinct_play_days]" has a null value in JSON.');
        assert(json.containsKey(r'by_activity'), 'Required key "SessionKpiResponseMetrics[by_activity]" is missing from JSON.');
        assert(json[r'by_activity'] != null, 'Required key "SessionKpiResponseMetrics[by_activity]" has a null value in JSON.');
        assert(json.containsKey(r'first_attempt_accuracy'), 'Required key "SessionKpiResponseMetrics[first_attempt_accuracy]" is missing from JSON.');
        assert(json[r'first_attempt_accuracy'] != null, 'Required key "SessionKpiResponseMetrics[first_attempt_accuracy]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiResponseMetrics(
        eligibleSessionCount: mapValueOfType<int>(json, r'eligible_session_count')!,
        completedSessionCount: mapValueOfType<int>(json, r'completed_session_count')!,
        interruptedSessionCount: mapValueOfType<int>(json, r'interrupted_session_count')!,
        abandonedSessionCount: mapValueOfType<int>(json, r'abandoned_session_count')!,
        inProgressSessionCount: mapValueOfType<int>(json, r'in_progress_session_count')!,
        totalPlayDurationSeconds: mapValueOfType<int>(json, r'total_play_duration_seconds')!,
        completedSessionRate: SessionKpiRateMetric.fromJson(json[r'completed_session_rate'])!,
        distinctPlayDays: mapValueOfType<int>(json, r'distinct_play_days')!,
        byActivity: SessionKpiActivityBreakdown.listFromJson(json[r'by_activity']),
        firstAttemptAccuracy: SessionKpiRateMetric.fromJson(json[r'first_attempt_accuracy'])!,
      );
    }
    return null;
  }

  static List<SessionKpiResponseMetrics> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseMetrics>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseMetrics.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiResponseMetrics> mapFromJson(dynamic json) {
    final map = <String, SessionKpiResponseMetrics>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiResponseMetrics.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiResponseMetrics-objects as value to a dart map
  static Map<String, List<SessionKpiResponseMetrics>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiResponseMetrics>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiResponseMetrics.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'eligible_session_count',
    'completed_session_count',
    'interrupted_session_count',
    'abandoned_session_count',
    'in_progress_session_count',
    'total_play_duration_seconds',
    'completed_session_rate',
    'distinct_play_days',
    'by_activity',
    'first_attempt_accuracy',
  };
}

