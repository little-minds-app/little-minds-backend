//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionInteractionFacts {
  /// Returns a new [MissionInteractionFacts] instance.
  MissionInteractionFacts({
    required this.offeredAt,
    required this.openedAt,
    required this.source_,
  });

  DateTime? offeredAt;

  DateTime? openedAt;

  MissionInteractionFactsSource_Enum source_;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionInteractionFacts &&
    other.offeredAt == offeredAt &&
    other.openedAt == openedAt &&
    other.source_ == source_;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (offeredAt == null ? 0 : offeredAt!.hashCode) +
    (openedAt == null ? 0 : openedAt!.hashCode) +
    (source_.hashCode);

  @override
  String toString() => 'MissionInteractionFacts[offeredAt=$offeredAt, openedAt=$openedAt, source_=$source_]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.offeredAt != null) {
      json[r'offered_at'] = this.offeredAt!.toUtc().toIso8601String();
    } else {
      json[r'offered_at'] = null;
    }
    if (this.openedAt != null) {
      json[r'opened_at'] = this.openedAt!.toUtc().toIso8601String();
    } else {
      json[r'opened_at'] = null;
    }
      json[r'source'] = this.source_;
    return json;
  }

  /// Returns a new [MissionInteractionFacts] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionInteractionFacts? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'offered_at'), 'Required key "MissionInteractionFacts[offered_at]" is missing from JSON.');
        assert(json.containsKey(r'opened_at'), 'Required key "MissionInteractionFacts[opened_at]" is missing from JSON.');
        assert(json.containsKey(r'source'), 'Required key "MissionInteractionFacts[source]" is missing from JSON.');
        assert(json[r'source'] != null, 'Required key "MissionInteractionFacts[source]" has a null value in JSON.');
        return true;
      }());

      return MissionInteractionFacts(
        offeredAt: mapDateTime(json, r'offered_at', r''),
        openedAt: mapDateTime(json, r'opened_at', r''),
        source_: MissionInteractionFactsSource_Enum.fromJson(json[r'source'])!,
      );
    }
    return null;
  }

  static List<MissionInteractionFacts> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionInteractionFacts>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionInteractionFacts.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionInteractionFacts> mapFromJson(dynamic json) {
    final map = <String, MissionInteractionFacts>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionInteractionFacts.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionInteractionFacts-objects as value to a dart map
  static Map<String, List<MissionInteractionFacts>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionInteractionFacts>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionInteractionFacts.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'offered_at',
    'opened_at',
    'source',
  };
}


enum MissionInteractionFactsSource_Enum {
  childPlayEvents._(r'child_play_events'),
  ;

  /// Instantiate a new enum with the provided value.
  const MissionInteractionFactsSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [MissionInteractionFactsSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static MissionInteractionFactsSource_Enum? fromJson(dynamic value) => MissionInteractionFactsSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [MissionInteractionFactsSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<MissionInteractionFactsSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionInteractionFactsSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionInteractionFactsSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MissionInteractionFactsSource_Enum] to String,
/// and [decode] dynamic data back to [MissionInteractionFactsSource_Enum].
class MissionInteractionFactsSource_EnumTypeTransformer {
  factory MissionInteractionFactsSource_EnumTypeTransformer() => _instance ??= const MissionInteractionFactsSource_EnumTypeTransformer._();

  const MissionInteractionFactsSource_EnumTypeTransformer._();

  String encode(MissionInteractionFactsSource_Enum data) => data._value;

  /// Returns the instance of [MissionInteractionFactsSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MissionInteractionFactsSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is MissionInteractionFactsSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'child_play_events': return MissionInteractionFactsSource_Enum.childPlayEvents;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static MissionInteractionFactsSource_EnumTypeTransformer? _instance;
}


