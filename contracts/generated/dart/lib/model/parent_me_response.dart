//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentMeResponse {
  /// Returns a new [ParentMeResponse] instance.
  ParentMeResponse({
    required this.parentId,
    required this.locale,
    required this.timezone,
    required this.lifecycle,
  });

  /// RFC 4122 UUID with version nibble 4 or 7
  String parentId;

  String locale;

  String timezone;

  ParentMeResponseLifecycleEnum lifecycle;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentMeResponse &&
    other.parentId == parentId &&
    other.locale == locale &&
    other.timezone == timezone &&
    other.lifecycle == lifecycle;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (parentId.hashCode) +
    (locale.hashCode) +
    (timezone.hashCode) +
    (lifecycle.hashCode);

  @override
  String toString() => 'ParentMeResponse[parentId=$parentId, locale=$locale, timezone=$timezone, lifecycle=$lifecycle]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'parent_id'] = this.parentId;
      json[r'locale'] = this.locale;
      json[r'timezone'] = this.timezone;
      json[r'lifecycle'] = this.lifecycle;
    return json;
  }

  /// Returns a new [ParentMeResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentMeResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'parent_id'), 'Required key "ParentMeResponse[parent_id]" is missing from JSON.');
        assert(json[r'parent_id'] != null, 'Required key "ParentMeResponse[parent_id]" has a null value in JSON.');
        assert(json.containsKey(r'locale'), 'Required key "ParentMeResponse[locale]" is missing from JSON.');
        assert(json[r'locale'] != null, 'Required key "ParentMeResponse[locale]" has a null value in JSON.');
        assert(json.containsKey(r'timezone'), 'Required key "ParentMeResponse[timezone]" is missing from JSON.');
        assert(json[r'timezone'] != null, 'Required key "ParentMeResponse[timezone]" has a null value in JSON.');
        assert(json.containsKey(r'lifecycle'), 'Required key "ParentMeResponse[lifecycle]" is missing from JSON.');
        assert(json[r'lifecycle'] != null, 'Required key "ParentMeResponse[lifecycle]" has a null value in JSON.');
        return true;
      }());

      return ParentMeResponse(
        parentId: mapValueOfType<String>(json, r'parent_id')!,
        locale: mapValueOfType<String>(json, r'locale')!,
        timezone: mapValueOfType<String>(json, r'timezone')!,
        lifecycle: ParentMeResponseLifecycleEnum.fromJson(json[r'lifecycle'])!,
      );
    }
    return null;
  }

  static List<ParentMeResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentMeResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentMeResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentMeResponse> mapFromJson(dynamic json) {
    final map = <String, ParentMeResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentMeResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentMeResponse-objects as value to a dart map
  static Map<String, List<ParentMeResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentMeResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentMeResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'parent_id',
    'locale',
    'timezone',
    'lifecycle',
  };
}


enum ParentMeResponseLifecycleEnum {
  active._(r'active'),
  pendingDeletion._(r'pending_deletion'),
  deleted._(r'deleted'),
  ;

  /// Instantiate a new enum with the provided value.
  const ParentMeResponseLifecycleEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ParentMeResponseLifecycleEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ParentMeResponseLifecycleEnum? fromJson(dynamic value) => ParentMeResponseLifecycleEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ParentMeResponseLifecycleEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ParentMeResponseLifecycleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentMeResponseLifecycleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentMeResponseLifecycleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ParentMeResponseLifecycleEnum] to String,
/// and [decode] dynamic data back to [ParentMeResponseLifecycleEnum].
class ParentMeResponseLifecycleEnumTypeTransformer {
  factory ParentMeResponseLifecycleEnumTypeTransformer() => _instance ??= const ParentMeResponseLifecycleEnumTypeTransformer._();

  const ParentMeResponseLifecycleEnumTypeTransformer._();

  String encode(ParentMeResponseLifecycleEnum data) => data._value;

  /// Returns the instance of [ParentMeResponseLifecycleEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ParentMeResponseLifecycleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ParentMeResponseLifecycleEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'active': return ParentMeResponseLifecycleEnum.active;
        case r'pending_deletion': return ParentMeResponseLifecycleEnum.pendingDeletion;
        case r'deleted': return ParentMeResponseLifecycleEnum.deleted;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ParentMeResponseLifecycleEnumTypeTransformer? _instance;
}


