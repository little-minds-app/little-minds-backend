//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class IngestActivityEventBatch200ResponseResultsInner {
  /// Returns a new [IngestActivityEventBatch200ResponseResultsInner] instance.
  IngestActivityEventBatch200ResponseResultsInner({
    required this.eventId,
    required this.status,
    this.reasonCode,
  });

  String eventId;

  IngestActivityEventBatch200ResponseResultsInnerStatusEnum status;

  /// Stable machine-readable code without echoed payload
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? reasonCode;

  @override
  bool operator ==(Object other) => identical(this, other) || other is IngestActivityEventBatch200ResponseResultsInner &&
    other.eventId == eventId &&
    other.status == status &&
    other.reasonCode == reasonCode;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (eventId.hashCode) +
    (status.hashCode) +
    (reasonCode == null ? 0 : reasonCode!.hashCode);

  @override
  String toString() => 'IngestActivityEventBatch200ResponseResultsInner[eventId=$eventId, status=$status, reasonCode=$reasonCode]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'event_id'] = this.eventId;
      json[r'status'] = this.status;
    if (this.reasonCode != null) {
      json[r'reason_code'] = this.reasonCode;
    } else {
      json[r'reason_code'] = null;
    }
    return json;
  }

  /// Returns a new [IngestActivityEventBatch200ResponseResultsInner] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static IngestActivityEventBatch200ResponseResultsInner? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'event_id'), 'Required key "IngestActivityEventBatch200ResponseResultsInner[event_id]" is missing from JSON.');
        assert(json[r'event_id'] != null, 'Required key "IngestActivityEventBatch200ResponseResultsInner[event_id]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "IngestActivityEventBatch200ResponseResultsInner[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "IngestActivityEventBatch200ResponseResultsInner[status]" has a null value in JSON.');
        return true;
      }());

      return IngestActivityEventBatch200ResponseResultsInner(
        eventId: mapValueOfType<String>(json, r'event_id')!,
        status: IngestActivityEventBatch200ResponseResultsInnerStatusEnum.fromJson(json[r'status'])!,
        reasonCode: mapValueOfType<String>(json, r'reason_code'),
      );
    }
    return null;
  }

  static List<IngestActivityEventBatch200ResponseResultsInner> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <IngestActivityEventBatch200ResponseResultsInner>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = IngestActivityEventBatch200ResponseResultsInner.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, IngestActivityEventBatch200ResponseResultsInner> mapFromJson(dynamic json) {
    final map = <String, IngestActivityEventBatch200ResponseResultsInner>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = IngestActivityEventBatch200ResponseResultsInner.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of IngestActivityEventBatch200ResponseResultsInner-objects as value to a dart map
  static Map<String, List<IngestActivityEventBatch200ResponseResultsInner>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<IngestActivityEventBatch200ResponseResultsInner>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = IngestActivityEventBatch200ResponseResultsInner.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'event_id',
    'status',
  };
}


enum IngestActivityEventBatch200ResponseResultsInnerStatusEnum {
  accepted._(r'accepted'),
  duplicateNoop._(r'duplicate_noop'),
  rejected._(r'rejected'),
  retryable._(r'retryable'),
  ;

  /// Instantiate a new enum with the provided value.
  const IngestActivityEventBatch200ResponseResultsInnerStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [IngestActivityEventBatch200ResponseResultsInnerStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static IngestActivityEventBatch200ResponseResultsInnerStatusEnum? fromJson(dynamic value) => IngestActivityEventBatch200ResponseResultsInnerStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [IngestActivityEventBatch200ResponseResultsInnerStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<IngestActivityEventBatch200ResponseResultsInnerStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <IngestActivityEventBatch200ResponseResultsInnerStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = IngestActivityEventBatch200ResponseResultsInnerStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [IngestActivityEventBatch200ResponseResultsInnerStatusEnum] to String,
/// and [decode] dynamic data back to [IngestActivityEventBatch200ResponseResultsInnerStatusEnum].
class IngestActivityEventBatch200ResponseResultsInnerStatusEnumTypeTransformer {
  factory IngestActivityEventBatch200ResponseResultsInnerStatusEnumTypeTransformer() => _instance ??= const IngestActivityEventBatch200ResponseResultsInnerStatusEnumTypeTransformer._();

  const IngestActivityEventBatch200ResponseResultsInnerStatusEnumTypeTransformer._();

  String encode(IngestActivityEventBatch200ResponseResultsInnerStatusEnum data) => data._value;

  /// Returns the instance of [IngestActivityEventBatch200ResponseResultsInnerStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  IngestActivityEventBatch200ResponseResultsInnerStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is IngestActivityEventBatch200ResponseResultsInnerStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'accepted': return IngestActivityEventBatch200ResponseResultsInnerStatusEnum.accepted;
        case r'duplicate_noop': return IngestActivityEventBatch200ResponseResultsInnerStatusEnum.duplicateNoop;
        case r'rejected': return IngestActivityEventBatch200ResponseResultsInnerStatusEnum.rejected;
        case r'retryable': return IngestActivityEventBatch200ResponseResultsInnerStatusEnum.retryable;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static IngestActivityEventBatch200ResponseResultsInnerStatusEnumTypeTransformer? _instance;
}


