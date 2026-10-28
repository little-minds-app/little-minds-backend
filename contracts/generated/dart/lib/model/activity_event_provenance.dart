//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ActivityEventProvenance {
  /// Returns a new [ActivityEventProvenance] instance.
  ActivityEventProvenance({
    required this.emitter,
    required this.actorScope,
    required this.source_,
    required this.clockTrust,
  });

  ActivityEventProvenanceEmitterEnum emitter;

  ActivityEventProvenanceActorScopeEnum actorScope;

  ActivityEventProvenanceSource_Enum source_;

  ActivityEventProvenanceClockTrustEnum clockTrust;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ActivityEventProvenance &&
    other.emitter == emitter &&
    other.actorScope == actorScope &&
    other.source_ == source_ &&
    other.clockTrust == clockTrust;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (emitter.hashCode) +
    (actorScope.hashCode) +
    (source_.hashCode) +
    (clockTrust.hashCode);

  @override
  String toString() => 'ActivityEventProvenance[emitter=$emitter, actorScope=$actorScope, source_=$source_, clockTrust=$clockTrust]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'emitter'] = this.emitter;
      json[r'actor_scope'] = this.actorScope;
      json[r'source'] = this.source_;
      json[r'clock_trust'] = this.clockTrust;
    return json;
  }

  /// Returns a new [ActivityEventProvenance] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ActivityEventProvenance? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'emitter'), 'Required key "ActivityEventProvenance[emitter]" is missing from JSON.');
        assert(json[r'emitter'] != null, 'Required key "ActivityEventProvenance[emitter]" has a null value in JSON.');
        assert(json.containsKey(r'actor_scope'), 'Required key "ActivityEventProvenance[actor_scope]" is missing from JSON.');
        assert(json[r'actor_scope'] != null, 'Required key "ActivityEventProvenance[actor_scope]" has a null value in JSON.');
        assert(json.containsKey(r'source'), 'Required key "ActivityEventProvenance[source]" is missing from JSON.');
        assert(json[r'source'] != null, 'Required key "ActivityEventProvenance[source]" has a null value in JSON.');
        assert(json.containsKey(r'clock_trust'), 'Required key "ActivityEventProvenance[clock_trust]" is missing from JSON.');
        assert(json[r'clock_trust'] != null, 'Required key "ActivityEventProvenance[clock_trust]" has a null value in JSON.');
        return true;
      }());

      return ActivityEventProvenance(
        emitter: ActivityEventProvenanceEmitterEnum.fromJson(json[r'emitter'])!,
        actorScope: ActivityEventProvenanceActorScopeEnum.fromJson(json[r'actor_scope'])!,
        source_: ActivityEventProvenanceSource_Enum.fromJson(json[r'source'])!,
        clockTrust: ActivityEventProvenanceClockTrustEnum.fromJson(json[r'clock_trust'])!,
      );
    }
    return null;
  }

  static List<ActivityEventProvenance> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventProvenance>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventProvenance.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ActivityEventProvenance> mapFromJson(dynamic json) {
    final map = <String, ActivityEventProvenance>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ActivityEventProvenance.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ActivityEventProvenance-objects as value to a dart map
  static Map<String, List<ActivityEventProvenance>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ActivityEventProvenance>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ActivityEventProvenance.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'emitter',
    'actor_scope',
    'source',
    'clock_trust',
  };
}


enum ActivityEventProvenanceEmitterEnum {
  kidsModeClient._(r'kids_mode_client'),
  parentDashboard._(r'parent_dashboard'),
  syncWorker._(r'sync_worker'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivityEventProvenanceEmitterEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivityEventProvenanceEmitterEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivityEventProvenanceEmitterEnum? fromJson(dynamic value) => ActivityEventProvenanceEmitterEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivityEventProvenanceEmitterEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivityEventProvenanceEmitterEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventProvenanceEmitterEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventProvenanceEmitterEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivityEventProvenanceEmitterEnum] to String,
/// and [decode] dynamic data back to [ActivityEventProvenanceEmitterEnum].
class ActivityEventProvenanceEmitterEnumTypeTransformer {
  factory ActivityEventProvenanceEmitterEnumTypeTransformer() => _instance ??= const ActivityEventProvenanceEmitterEnumTypeTransformer._();

  const ActivityEventProvenanceEmitterEnumTypeTransformer._();

  String encode(ActivityEventProvenanceEmitterEnum data) => data._value;

  /// Returns the instance of [ActivityEventProvenanceEmitterEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivityEventProvenanceEmitterEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivityEventProvenanceEmitterEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'kids_mode_client': return ActivityEventProvenanceEmitterEnum.kidsModeClient;
        case r'parent_dashboard': return ActivityEventProvenanceEmitterEnum.parentDashboard;
        case r'sync_worker': return ActivityEventProvenanceEmitterEnum.syncWorker;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivityEventProvenanceEmitterEnumTypeTransformer? _instance;
}



enum ActivityEventProvenanceActorScopeEnum {
  childPlay._(r'child_play'),
  parent._(r'parent'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivityEventProvenanceActorScopeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivityEventProvenanceActorScopeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivityEventProvenanceActorScopeEnum? fromJson(dynamic value) => ActivityEventProvenanceActorScopeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivityEventProvenanceActorScopeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivityEventProvenanceActorScopeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventProvenanceActorScopeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventProvenanceActorScopeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivityEventProvenanceActorScopeEnum] to String,
/// and [decode] dynamic data back to [ActivityEventProvenanceActorScopeEnum].
class ActivityEventProvenanceActorScopeEnumTypeTransformer {
  factory ActivityEventProvenanceActorScopeEnumTypeTransformer() => _instance ??= const ActivityEventProvenanceActorScopeEnumTypeTransformer._();

  const ActivityEventProvenanceActorScopeEnumTypeTransformer._();

  String encode(ActivityEventProvenanceActorScopeEnum data) => data._value;

  /// Returns the instance of [ActivityEventProvenanceActorScopeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivityEventProvenanceActorScopeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivityEventProvenanceActorScopeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'child_play': return ActivityEventProvenanceActorScopeEnum.childPlay;
        case r'parent': return ActivityEventProvenanceActorScopeEnum.parent;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivityEventProvenanceActorScopeEnumTypeTransformer? _instance;
}



enum ActivityEventProvenanceSource_Enum {
  instrumented._(r'instrumented'),
  caregiverReport._(r'caregiver_report'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivityEventProvenanceSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivityEventProvenanceSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivityEventProvenanceSource_Enum? fromJson(dynamic value) => ActivityEventProvenanceSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivityEventProvenanceSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivityEventProvenanceSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventProvenanceSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventProvenanceSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivityEventProvenanceSource_Enum] to String,
/// and [decode] dynamic data back to [ActivityEventProvenanceSource_Enum].
class ActivityEventProvenanceSource_EnumTypeTransformer {
  factory ActivityEventProvenanceSource_EnumTypeTransformer() => _instance ??= const ActivityEventProvenanceSource_EnumTypeTransformer._();

  const ActivityEventProvenanceSource_EnumTypeTransformer._();

  String encode(ActivityEventProvenanceSource_Enum data) => data._value;

  /// Returns the instance of [ActivityEventProvenanceSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivityEventProvenanceSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivityEventProvenanceSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'instrumented': return ActivityEventProvenanceSource_Enum.instrumented;
        case r'caregiver_report': return ActivityEventProvenanceSource_Enum.caregiverReport;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivityEventProvenanceSource_EnumTypeTransformer? _instance;
}



enum ActivityEventProvenanceClockTrustEnum {
  monotonicWithinBoot._(r'monotonic_within_boot'),
  wallClockOnly._(r'wall_clock_only'),
  unknown._(r'unknown'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivityEventProvenanceClockTrustEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivityEventProvenanceClockTrustEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivityEventProvenanceClockTrustEnum? fromJson(dynamic value) => ActivityEventProvenanceClockTrustEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivityEventProvenanceClockTrustEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivityEventProvenanceClockTrustEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivityEventProvenanceClockTrustEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivityEventProvenanceClockTrustEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivityEventProvenanceClockTrustEnum] to String,
/// and [decode] dynamic data back to [ActivityEventProvenanceClockTrustEnum].
class ActivityEventProvenanceClockTrustEnumTypeTransformer {
  factory ActivityEventProvenanceClockTrustEnumTypeTransformer() => _instance ??= const ActivityEventProvenanceClockTrustEnumTypeTransformer._();

  const ActivityEventProvenanceClockTrustEnumTypeTransformer._();

  String encode(ActivityEventProvenanceClockTrustEnum data) => data._value;

  /// Returns the instance of [ActivityEventProvenanceClockTrustEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivityEventProvenanceClockTrustEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivityEventProvenanceClockTrustEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'monotonic_within_boot': return ActivityEventProvenanceClockTrustEnum.monotonicWithinBoot;
        case r'wall_clock_only': return ActivityEventProvenanceClockTrustEnum.wallClockOnly;
        case r'unknown': return ActivityEventProvenanceClockTrustEnum.unknown;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivityEventProvenanceClockTrustEnumTypeTransformer? _instance;
}


