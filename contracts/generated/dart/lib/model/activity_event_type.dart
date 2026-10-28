//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

/// Blueprint §14.1 allowlist
enum ActivityEventType {
  activityStarted._(r'activity_started'),
  activityAttempted._(r'activity_attempted'),
  activityHintUsed._(r'activity_hint_used'),
  activityCompleted._(r'activity_completed'),
  activityAbandoned._(r'activity_abandoned'),
  childModeForegroundStarted._(r'child_mode_foreground_started'),
  childModeForegroundEnded._(r'child_mode_foreground_ended'),
  realWorldMissionOffered._(r'real_world_mission_offered'),
  realWorldMissionOpened._(r'real_world_mission_opened'),
  missionFeedbackSubmitted._(r'mission_feedback_submitted'),
  mentorCardOpened._(r'mentor_card_opened'),
  screenLimitReached._(r'screen_limit_reached'),
  contentPackDownloaded._(r'content_pack_downloaded'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivityEventType._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivityEventType] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivityEventType? fromJson(dynamic value) => ActivityEventTypeTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivityEventType]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivityEventType> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventType>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventType.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivityEventType] to String,
/// and [decode] dynamic data back to [ActivityEventType].
class ActivityEventTypeTypeTransformer {
  factory ActivityEventTypeTypeTransformer() => _instance ??= const ActivityEventTypeTypeTransformer._();

  const ActivityEventTypeTypeTransformer._();

  /// Encodes this enum as a value suitable for JSON.
  String encode(ActivityEventType data) => data._value;

  /// Returns the instance of [ActivityEventType] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivityEventType? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivityEventType) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'activity_started': return ActivityEventType.activityStarted;
        case r'activity_attempted': return ActivityEventType.activityAttempted;
        case r'activity_hint_used': return ActivityEventType.activityHintUsed;
        case r'activity_completed': return ActivityEventType.activityCompleted;
        case r'activity_abandoned': return ActivityEventType.activityAbandoned;
        case r'child_mode_foreground_started': return ActivityEventType.childModeForegroundStarted;
        case r'child_mode_foreground_ended': return ActivityEventType.childModeForegroundEnded;
        case r'real_world_mission_offered': return ActivityEventType.realWorldMissionOffered;
        case r'real_world_mission_opened': return ActivityEventType.realWorldMissionOpened;
        case r'mission_feedback_submitted': return ActivityEventType.missionFeedbackSubmitted;
        case r'mentor_card_opened': return ActivityEventType.mentorCardOpened;
        case r'screen_limit_reached': return ActivityEventType.screenLimitReached;
        case r'content_pack_downloaded': return ActivityEventType.contentPackDownloaded;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivityEventTypeTypeTransformer? _instance;
}

