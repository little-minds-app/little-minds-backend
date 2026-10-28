//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ActivitySessionProvenance {
  /// Returns a new [ActivitySessionProvenance] instance.
  ActivitySessionProvenance({
    required this.emitter,
    required this.captureChannel,
    required this.clockTrust,
  });

  ActivitySessionProvenanceEmitterEnum emitter;

  ActivitySessionProvenanceCaptureChannelEnum captureChannel;

  ActivitySessionProvenanceClockTrustEnum clockTrust;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ActivitySessionProvenance &&
    other.emitter == emitter &&
    other.captureChannel == captureChannel &&
    other.clockTrust == clockTrust;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (emitter.hashCode) +
    (captureChannel.hashCode) +
    (clockTrust.hashCode);

  @override
  String toString() => 'ActivitySessionProvenance[emitter=$emitter, captureChannel=$captureChannel, clockTrust=$clockTrust]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'emitter'] = this.emitter;
      json[r'capture_channel'] = this.captureChannel;
      json[r'clock_trust'] = this.clockTrust;
    return json;
  }

  /// Returns a new [ActivitySessionProvenance] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ActivitySessionProvenance? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'emitter'), 'Required key "ActivitySessionProvenance[emitter]" is missing from JSON.');
        assert(json[r'emitter'] != null, 'Required key "ActivitySessionProvenance[emitter]" has a null value in JSON.');
        assert(json.containsKey(r'capture_channel'), 'Required key "ActivitySessionProvenance[capture_channel]" is missing from JSON.');
        assert(json[r'capture_channel'] != null, 'Required key "ActivitySessionProvenance[capture_channel]" has a null value in JSON.');
        assert(json.containsKey(r'clock_trust'), 'Required key "ActivitySessionProvenance[clock_trust]" is missing from JSON.');
        assert(json[r'clock_trust'] != null, 'Required key "ActivitySessionProvenance[clock_trust]" has a null value in JSON.');
        return true;
      }());

      return ActivitySessionProvenance(
        emitter: ActivitySessionProvenanceEmitterEnum.fromJson(json[r'emitter'])!,
        captureChannel: ActivitySessionProvenanceCaptureChannelEnum.fromJson(json[r'capture_channel'])!,
        clockTrust: ActivitySessionProvenanceClockTrustEnum.fromJson(json[r'clock_trust'])!,
      );
    }
    return null;
  }

  static List<ActivitySessionProvenance> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionProvenance>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionProvenance.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ActivitySessionProvenance> mapFromJson(dynamic json) {
    final map = <String, ActivitySessionProvenance>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ActivitySessionProvenance.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ActivitySessionProvenance-objects as value to a dart map
  static Map<String, List<ActivitySessionProvenance>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ActivitySessionProvenance>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ActivitySessionProvenance.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'emitter',
    'capture_channel',
    'clock_trust',
  };
}


enum ActivitySessionProvenanceEmitterEnum {
  kidsModeClient._(r'kids_mode_client'),
  parentDashboard._(r'parent_dashboard'),
  syncWorker._(r'sync_worker'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivitySessionProvenanceEmitterEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivitySessionProvenanceEmitterEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivitySessionProvenanceEmitterEnum? fromJson(dynamic value) => ActivitySessionProvenanceEmitterEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivitySessionProvenanceEmitterEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivitySessionProvenanceEmitterEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionProvenanceEmitterEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionProvenanceEmitterEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivitySessionProvenanceEmitterEnum] to String,
/// and [decode] dynamic data back to [ActivitySessionProvenanceEmitterEnum].
class ActivitySessionProvenanceEmitterEnumTypeTransformer {
  factory ActivitySessionProvenanceEmitterEnumTypeTransformer() => _instance ??= const ActivitySessionProvenanceEmitterEnumTypeTransformer._();

  const ActivitySessionProvenanceEmitterEnumTypeTransformer._();

  String encode(ActivitySessionProvenanceEmitterEnum data) => data._value;

  /// Returns the instance of [ActivitySessionProvenanceEmitterEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivitySessionProvenanceEmitterEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivitySessionProvenanceEmitterEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'kids_mode_client': return ActivitySessionProvenanceEmitterEnum.kidsModeClient;
        case r'parent_dashboard': return ActivitySessionProvenanceEmitterEnum.parentDashboard;
        case r'sync_worker': return ActivitySessionProvenanceEmitterEnum.syncWorker;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivitySessionProvenanceEmitterEnumTypeTransformer? _instance;
}



enum ActivitySessionProvenanceCaptureChannelEnum {
  offlineQueue._(r'offline_queue'),
  onlineDirect._(r'online_direct'),
  replayBackfill._(r'replay_backfill'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivitySessionProvenanceCaptureChannelEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivitySessionProvenanceCaptureChannelEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivitySessionProvenanceCaptureChannelEnum? fromJson(dynamic value) => ActivitySessionProvenanceCaptureChannelEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivitySessionProvenanceCaptureChannelEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivitySessionProvenanceCaptureChannelEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionProvenanceCaptureChannelEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionProvenanceCaptureChannelEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivitySessionProvenanceCaptureChannelEnum] to String,
/// and [decode] dynamic data back to [ActivitySessionProvenanceCaptureChannelEnum].
class ActivitySessionProvenanceCaptureChannelEnumTypeTransformer {
  factory ActivitySessionProvenanceCaptureChannelEnumTypeTransformer() => _instance ??= const ActivitySessionProvenanceCaptureChannelEnumTypeTransformer._();

  const ActivitySessionProvenanceCaptureChannelEnumTypeTransformer._();

  String encode(ActivitySessionProvenanceCaptureChannelEnum data) => data._value;

  /// Returns the instance of [ActivitySessionProvenanceCaptureChannelEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivitySessionProvenanceCaptureChannelEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivitySessionProvenanceCaptureChannelEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'offline_queue': return ActivitySessionProvenanceCaptureChannelEnum.offlineQueue;
        case r'online_direct': return ActivitySessionProvenanceCaptureChannelEnum.onlineDirect;
        case r'replay_backfill': return ActivitySessionProvenanceCaptureChannelEnum.replayBackfill;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivitySessionProvenanceCaptureChannelEnumTypeTransformer? _instance;
}



enum ActivitySessionProvenanceClockTrustEnum {
  monotonicWithinBoot._(r'monotonic_within_boot'),
  wallClockOnly._(r'wall_clock_only'),
  unknown._(r'unknown'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivitySessionProvenanceClockTrustEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivitySessionProvenanceClockTrustEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivitySessionProvenanceClockTrustEnum? fromJson(dynamic value) => ActivitySessionProvenanceClockTrustEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivitySessionProvenanceClockTrustEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivitySessionProvenanceClockTrustEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionProvenanceClockTrustEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionProvenanceClockTrustEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivitySessionProvenanceClockTrustEnum] to String,
/// and [decode] dynamic data back to [ActivitySessionProvenanceClockTrustEnum].
class ActivitySessionProvenanceClockTrustEnumTypeTransformer {
  factory ActivitySessionProvenanceClockTrustEnumTypeTransformer() => _instance ??= const ActivitySessionProvenanceClockTrustEnumTypeTransformer._();

  const ActivitySessionProvenanceClockTrustEnumTypeTransformer._();

  String encode(ActivitySessionProvenanceClockTrustEnum data) => data._value;

  /// Returns the instance of [ActivitySessionProvenanceClockTrustEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivitySessionProvenanceClockTrustEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivitySessionProvenanceClockTrustEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'monotonic_within_boot': return ActivitySessionProvenanceClockTrustEnum.monotonicWithinBoot;
        case r'wall_clock_only': return ActivitySessionProvenanceClockTrustEnum.wallClockOnly;
        case r'unknown': return ActivitySessionProvenanceClockTrustEnum.unknown;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivitySessionProvenanceClockTrustEnumTypeTransformer? _instance;
}


