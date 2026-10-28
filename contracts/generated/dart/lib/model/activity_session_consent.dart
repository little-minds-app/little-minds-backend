//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ActivitySessionConsent {
  /// Returns a new [ActivitySessionConsent] instance.
  ActivitySessionConsent({
    required this.purpose,
    required this.policyVersion,
    required this.consentScope,
    required this.decision,
  });

  ActivitySessionConsentPurposeEnum purpose;

  String policyVersion;

  ConsentScope consentScope;

  /// Client UX evidence only — never treated as server authorization
  ActivitySessionConsentDecisionEnum decision;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ActivitySessionConsent &&
    other.purpose == purpose &&
    other.policyVersion == policyVersion &&
    other.consentScope == consentScope &&
    other.decision == decision;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (purpose.hashCode) +
    (policyVersion.hashCode) +
    (consentScope.hashCode) +
    (decision.hashCode);

  @override
  String toString() => 'ActivitySessionConsent[purpose=$purpose, policyVersion=$policyVersion, consentScope=$consentScope, decision=$decision]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'purpose'] = this.purpose;
      json[r'policy_version'] = this.policyVersion;
      json[r'consent_scope'] = this.consentScope;
      json[r'decision'] = this.decision;
    return json;
  }

  /// Returns a new [ActivitySessionConsent] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ActivitySessionConsent? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'purpose'), 'Required key "ActivitySessionConsent[purpose]" is missing from JSON.');
        assert(json[r'purpose'] != null, 'Required key "ActivitySessionConsent[purpose]" has a null value in JSON.');
        assert(json.containsKey(r'policy_version'), 'Required key "ActivitySessionConsent[policy_version]" is missing from JSON.');
        assert(json[r'policy_version'] != null, 'Required key "ActivitySessionConsent[policy_version]" has a null value in JSON.');
        assert(json.containsKey(r'consent_scope'), 'Required key "ActivitySessionConsent[consent_scope]" is missing from JSON.');
        assert(json[r'consent_scope'] != null, 'Required key "ActivitySessionConsent[consent_scope]" has a null value in JSON.');
        assert(json.containsKey(r'decision'), 'Required key "ActivitySessionConsent[decision]" is missing from JSON.');
        assert(json[r'decision'] != null, 'Required key "ActivitySessionConsent[decision]" has a null value in JSON.');
        return true;
      }());

      return ActivitySessionConsent(
        purpose: ActivitySessionConsentPurposeEnum.fromJson(json[r'purpose'])!,
        policyVersion: mapValueOfType<String>(json, r'policy_version')!,
        consentScope: ConsentScope.fromJson(json[r'consent_scope'])!,
        decision: ActivitySessionConsentDecisionEnum.fromJson(json[r'decision'])!,
      );
    }
    return null;
  }

  static List<ActivitySessionConsent> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionConsent>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionConsent.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ActivitySessionConsent> mapFromJson(dynamic json) {
    final map = <String, ActivitySessionConsent>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ActivitySessionConsent.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ActivitySessionConsent-objects as value to a dart map
  static Map<String, List<ActivitySessionConsent>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ActivitySessionConsent>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ActivitySessionConsent.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'purpose',
    'policy_version',
    'consent_scope',
    'decision',
  };
}


enum ActivitySessionConsentPurposeEnum {
  essentialServiceTelemetry._(r'essential_service_telemetry'),
  essentialPlayEvents._(r'essential_play_events'),
  optionalProductAnalytics._(r'optional_product_analytics'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivitySessionConsentPurposeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivitySessionConsentPurposeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivitySessionConsentPurposeEnum? fromJson(dynamic value) => ActivitySessionConsentPurposeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivitySessionConsentPurposeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivitySessionConsentPurposeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionConsentPurposeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionConsentPurposeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivitySessionConsentPurposeEnum] to String,
/// and [decode] dynamic data back to [ActivitySessionConsentPurposeEnum].
class ActivitySessionConsentPurposeEnumTypeTransformer {
  factory ActivitySessionConsentPurposeEnumTypeTransformer() => _instance ??= const ActivitySessionConsentPurposeEnumTypeTransformer._();

  const ActivitySessionConsentPurposeEnumTypeTransformer._();

  String encode(ActivitySessionConsentPurposeEnum data) => data._value;

  /// Returns the instance of [ActivitySessionConsentPurposeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivitySessionConsentPurposeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivitySessionConsentPurposeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'essential_service_telemetry': return ActivitySessionConsentPurposeEnum.essentialServiceTelemetry;
        case r'essential_play_events': return ActivitySessionConsentPurposeEnum.essentialPlayEvents;
        case r'optional_product_analytics': return ActivitySessionConsentPurposeEnum.optionalProductAnalytics;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivitySessionConsentPurposeEnumTypeTransformer? _instance;
}


/// Client UX evidence only — never treated as server authorization
enum ActivitySessionConsentDecisionEnum {
  granted._(r'granted'),
  denied._(r'denied'),
  withdrawn._(r'withdrawn'),
  ;

  /// Instantiate a new enum with the provided value.
  const ActivitySessionConsentDecisionEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ActivitySessionConsentDecisionEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ActivitySessionConsentDecisionEnum? fromJson(dynamic value) => ActivitySessionConsentDecisionEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ActivitySessionConsentDecisionEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ActivitySessionConsentDecisionEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ActivitySessionConsentDecisionEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ActivitySessionConsentDecisionEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ActivitySessionConsentDecisionEnum] to String,
/// and [decode] dynamic data back to [ActivitySessionConsentDecisionEnum].
class ActivitySessionConsentDecisionEnumTypeTransformer {
  factory ActivitySessionConsentDecisionEnumTypeTransformer() => _instance ??= const ActivitySessionConsentDecisionEnumTypeTransformer._();

  const ActivitySessionConsentDecisionEnumTypeTransformer._();

  String encode(ActivitySessionConsentDecisionEnum data) => data._value;

  /// Returns the instance of [ActivitySessionConsentDecisionEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ActivitySessionConsentDecisionEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ActivitySessionConsentDecisionEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'granted': return ActivitySessionConsentDecisionEnum.granted;
        case r'denied': return ActivitySessionConsentDecisionEnum.denied;
        case r'withdrawn': return ActivitySessionConsentDecisionEnum.withdrawn;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ActivitySessionConsentDecisionEnumTypeTransformer? _instance;
}


