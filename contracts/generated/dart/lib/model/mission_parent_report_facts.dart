//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionParentReportFacts {
  /// Returns a new [MissionParentReportFacts] instance.
  MissionParentReportFacts({
    required this.availability,
    required this.status,
    required this.authoritative,
    required this.recordedAt,
    required this.assertionId,
    required this.revision,
    required this.actor,
    required this.source_,
  });

  MissionParentReportFactsAvailabilityEnum availability;

  MissionParentReportFactsStatusEnum? status;

  bool authoritative;

  DateTime? recordedAt;

  String? assertionId;

  int? revision;

  MissionParentReportFactsActorEnum actor;

  MissionParentReportFactsSource_Enum source_;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionParentReportFacts &&
    other.availability == availability &&
    other.status == status &&
    other.authoritative == authoritative &&
    other.recordedAt == recordedAt &&
    other.assertionId == assertionId &&
    other.revision == revision &&
    other.actor == actor &&
    other.source_ == source_;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (availability.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (authoritative.hashCode) +
    (recordedAt == null ? 0 : recordedAt!.hashCode) +
    (assertionId == null ? 0 : assertionId!.hashCode) +
    (revision == null ? 0 : revision!.hashCode) +
    (actor.hashCode) +
    (source_.hashCode);

  @override
  String toString() => 'MissionParentReportFacts[availability=$availability, status=$status, authoritative=$authoritative, recordedAt=$recordedAt, assertionId=$assertionId, revision=$revision, actor=$actor, source_=$source_]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'availability'] = this.availability;
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
      json[r'authoritative'] = this.authoritative;
    if (this.recordedAt != null) {
      json[r'recorded_at'] = this.recordedAt!.toUtc().toIso8601String();
    } else {
      json[r'recorded_at'] = null;
    }
    if (this.assertionId != null) {
      json[r'assertion_id'] = this.assertionId;
    } else {
      json[r'assertion_id'] = null;
    }
    if (this.revision != null) {
      json[r'revision'] = this.revision;
    } else {
      json[r'revision'] = null;
    }
      json[r'actor'] = this.actor;
      json[r'source'] = this.source_;
    return json;
  }

  /// Returns a new [MissionParentReportFacts] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionParentReportFacts? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'availability'), 'Required key "MissionParentReportFacts[availability]" is missing from JSON.');
        assert(json[r'availability'] != null, 'Required key "MissionParentReportFacts[availability]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "MissionParentReportFacts[status]" is missing from JSON.');
        assert(json.containsKey(r'authoritative'), 'Required key "MissionParentReportFacts[authoritative]" is missing from JSON.');
        assert(json[r'authoritative'] != null, 'Required key "MissionParentReportFacts[authoritative]" has a null value in JSON.');
        assert(json.containsKey(r'recorded_at'), 'Required key "MissionParentReportFacts[recorded_at]" is missing from JSON.');
        assert(json.containsKey(r'assertion_id'), 'Required key "MissionParentReportFacts[assertion_id]" is missing from JSON.');
        assert(json.containsKey(r'revision'), 'Required key "MissionParentReportFacts[revision]" is missing from JSON.');
        assert(json.containsKey(r'actor'), 'Required key "MissionParentReportFacts[actor]" is missing from JSON.');
        assert(json[r'actor'] != null, 'Required key "MissionParentReportFacts[actor]" has a null value in JSON.');
        assert(json.containsKey(r'source'), 'Required key "MissionParentReportFacts[source]" is missing from JSON.');
        assert(json[r'source'] != null, 'Required key "MissionParentReportFacts[source]" has a null value in JSON.');
        return true;
      }());

      return MissionParentReportFacts(
        availability: MissionParentReportFactsAvailabilityEnum.fromJson(json[r'availability'])!,
        status: MissionParentReportFactsStatusEnum.fromJson(json[r'status']),
        authoritative: mapValueOfType<bool>(json, r'authoritative')!,
        recordedAt: mapDateTime(json, r'recorded_at', r''),
        assertionId: mapValueOfType<String>(json, r'assertion_id'),
        revision: mapValueOfType<int>(json, r'revision'),
        actor: MissionParentReportFactsActorEnum.fromJson(json[r'actor'])!,
        source_: MissionParentReportFactsSource_Enum.fromJson(json[r'source'])!,
      );
    }
    return null;
  }

  static List<MissionParentReportFacts> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionParentReportFacts>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionParentReportFacts.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionParentReportFacts> mapFromJson(dynamic json) {
    final map = <String, MissionParentReportFacts>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionParentReportFacts.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionParentReportFacts-objects as value to a dart map
  static Map<String, List<MissionParentReportFacts>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionParentReportFacts>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionParentReportFacts.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'availability',
    'status',
    'authoritative',
    'recorded_at',
    'assertion_id',
    'revision',
    'actor',
    'source',
  };
}


enum MissionParentReportFactsAvailabilityEnum {
  reported._(r'reported'),
  noReport._(r'no_report'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionParentReportFactsAvailabilityEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionParentReportFactsAvailabilityEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionParentReportFactsAvailabilityEnum? fromJson(dynamic value) => MissionParentReportFactsAvailabilityEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionParentReportFactsAvailabilityEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionParentReportFactsAvailabilityEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionParentReportFactsAvailabilityEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionParentReportFactsAvailabilityEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionParentReportFactsAvailabilityEnum] to String,
/// and [decode] dynamic data back to [MissionParentReportFactsAvailabilityEnum].
class MissionParentReportFactsAvailabilityEnumTypeTransformer {
  factory MissionParentReportFactsAvailabilityEnumTypeTransformer() => _instance ??= const MissionParentReportFactsAvailabilityEnumTypeTransformer._();

  const MissionParentReportFactsAvailabilityEnumTypeTransformer._();

  String encode(MissionParentReportFactsAvailabilityEnum data) => data._value;

  /// Returns the instance of [MissionParentReportFactsAvailabilityEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionParentReportFactsAvailabilityEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionParentReportFactsAvailabilityEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'reported': return MissionParentReportFactsAvailabilityEnum.reported;
        case r'no_report': return MissionParentReportFactsAvailabilityEnum.noReport;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionParentReportFactsAvailabilityEnumTypeTransformer? _instance;
}



enum MissionParentReportFactsStatusEnum {
  completed._(r'completed'),
  skipped._(r'skipped'),
  notNow._(r'not_now'),
  partial._(r'partial'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionParentReportFactsStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionParentReportFactsStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionParentReportFactsStatusEnum? fromJson(dynamic value) => MissionParentReportFactsStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionParentReportFactsStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionParentReportFactsStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionParentReportFactsStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionParentReportFactsStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionParentReportFactsStatusEnum] to String,
/// and [decode] dynamic data back to [MissionParentReportFactsStatusEnum].
class MissionParentReportFactsStatusEnumTypeTransformer {
  factory MissionParentReportFactsStatusEnumTypeTransformer() => _instance ??= const MissionParentReportFactsStatusEnumTypeTransformer._();

  const MissionParentReportFactsStatusEnumTypeTransformer._();

  String encode(MissionParentReportFactsStatusEnum data) => data._value;

  /// Returns the instance of [MissionParentReportFactsStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionParentReportFactsStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionParentReportFactsStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'completed': return MissionParentReportFactsStatusEnum.completed;
        case r'skipped': return MissionParentReportFactsStatusEnum.skipped;
        case r'not_now': return MissionParentReportFactsStatusEnum.notNow;
        case r'partial': return MissionParentReportFactsStatusEnum.partial;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionParentReportFactsStatusEnumTypeTransformer? _instance;
}



enum MissionParentReportFactsActorEnum {
  parent._(r'parent'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionParentReportFactsActorEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionParentReportFactsActorEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionParentReportFactsActorEnum? fromJson(dynamic value) => MissionParentReportFactsActorEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionParentReportFactsActorEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionParentReportFactsActorEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionParentReportFactsActorEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionParentReportFactsActorEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionParentReportFactsActorEnum] to String,
/// and [decode] dynamic data back to [MissionParentReportFactsActorEnum].
class MissionParentReportFactsActorEnumTypeTransformer {
  factory MissionParentReportFactsActorEnumTypeTransformer() => _instance ??= const MissionParentReportFactsActorEnumTypeTransformer._();

  const MissionParentReportFactsActorEnumTypeTransformer._();

  String encode(MissionParentReportFactsActorEnum data) => data._value;

  /// Returns the instance of [MissionParentReportFactsActorEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionParentReportFactsActorEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionParentReportFactsActorEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'parent': return MissionParentReportFactsActorEnum.parent;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionParentReportFactsActorEnumTypeTransformer? _instance;
}



enum MissionParentReportFactsSource_Enum {
  caregiverReport._(r'caregiver_report'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionParentReportFactsSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionParentReportFactsSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionParentReportFactsSource_Enum? fromJson(dynamic value) => MissionParentReportFactsSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionParentReportFactsSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionParentReportFactsSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionParentReportFactsSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionParentReportFactsSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionParentReportFactsSource_Enum] to String,
/// and [decode] dynamic data back to [MissionParentReportFactsSource_Enum].
class MissionParentReportFactsSource_EnumTypeTransformer {
  factory MissionParentReportFactsSource_EnumTypeTransformer() => _instance ??= const MissionParentReportFactsSource_EnumTypeTransformer._();

  const MissionParentReportFactsSource_EnumTypeTransformer._();

  String encode(MissionParentReportFactsSource_Enum data) => data._value;

  /// Returns the instance of [MissionParentReportFactsSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionParentReportFactsSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionParentReportFactsSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'caregiver_report': return MissionParentReportFactsSource_Enum.caregiverReport;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionParentReportFactsSource_EnumTypeTransformer? _instance;
}


