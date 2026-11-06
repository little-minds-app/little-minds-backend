//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class EffectiveConsentScope {
  /// Returns a new [EffectiveConsentScope] instance.
  EffectiveConsentScope({
    required this.consentScope,
    required this.childId,
    required this.authorized,
    required this.policyVersion,
    required this.status,
    required this.effectiveAt,
    required this.source_,
    required this.recordId,
  });

  ConsentScope consentScope;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String? childId;

  /// True when latest-effective trusted records grant the scope
  bool authorized;

  String? policyVersion;

  EffectiveConsentScopeStatusEnum status;

  /// UTC ISO-8601 instant ending in Z
  String? effectiveAt;

  EffectiveConsentScopeSource_Enum? source_;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String? recordId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EffectiveConsentScope &&
    other.consentScope == consentScope &&
    other.childId == childId &&
    other.authorized == authorized &&
    other.policyVersion == policyVersion &&
    other.status == status &&
    other.effectiveAt == effectiveAt &&
    other.source_ == source_ &&
    other.recordId == recordId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (consentScope.hashCode) +
    (childId == null ? 0 : childId!.hashCode) +
    (authorized.hashCode) +
    (policyVersion == null ? 0 : policyVersion!.hashCode) +
    (status.hashCode) +
    (effectiveAt == null ? 0 : effectiveAt!.hashCode) +
    (source_ == null ? 0 : source_!.hashCode) +
    (recordId == null ? 0 : recordId!.hashCode);

  @override
  String toString() => 'EffectiveConsentScope[consentScope=$consentScope, childId=$childId, authorized=$authorized, policyVersion=$policyVersion, status=$status, effectiveAt=$effectiveAt, source_=$source_, recordId=$recordId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'consent_scope'] = this.consentScope;
    if (this.childId != null) {
      json[r'child_id'] = this.childId;
    } else {
      json[r'child_id'] = null;
    }
      json[r'authorized'] = this.authorized;
    if (this.policyVersion != null) {
      json[r'policy_version'] = this.policyVersion;
    } else {
      json[r'policy_version'] = null;
    }
      json[r'status'] = this.status;
    if (this.effectiveAt != null) {
      json[r'effective_at'] = this.effectiveAt;
    } else {
      json[r'effective_at'] = null;
    }
    if (this.source_ != null) {
      json[r'source'] = this.source_;
    } else {
      json[r'source'] = null;
    }
    if (this.recordId != null) {
      json[r'record_id'] = this.recordId;
    } else {
      json[r'record_id'] = null;
    }
    return json;
  }

  /// Returns a new [EffectiveConsentScope] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EffectiveConsentScope? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'consent_scope'), 'Required key "EffectiveConsentScope[consent_scope]" is missing from JSON.');
        assert(json[r'consent_scope'] != null, 'Required key "EffectiveConsentScope[consent_scope]" has a null value in JSON.');
        assert(json.containsKey(r'child_id'), 'Required key "EffectiveConsentScope[child_id]" is missing from JSON.');
        assert(json.containsKey(r'authorized'), 'Required key "EffectiveConsentScope[authorized]" is missing from JSON.');
        assert(json[r'authorized'] != null, 'Required key "EffectiveConsentScope[authorized]" has a null value in JSON.');
        assert(json.containsKey(r'policy_version'), 'Required key "EffectiveConsentScope[policy_version]" is missing from JSON.');
        assert(json.containsKey(r'status'), 'Required key "EffectiveConsentScope[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "EffectiveConsentScope[status]" has a null value in JSON.');
        assert(json.containsKey(r'effective_at'), 'Required key "EffectiveConsentScope[effective_at]" is missing from JSON.');
        assert(json.containsKey(r'source'), 'Required key "EffectiveConsentScope[source]" is missing from JSON.');
        assert(json.containsKey(r'record_id'), 'Required key "EffectiveConsentScope[record_id]" is missing from JSON.');
        return true;
      }());

      return EffectiveConsentScope(
        consentScope: ConsentScope.fromJson(json[r'consent_scope'])!,
        childId: mapValueOfType<String>(json, r'child_id'),
        authorized: mapValueOfType<bool>(json, r'authorized')!,
        policyVersion: mapValueOfType<String>(json, r'policy_version'),
        status: EffectiveConsentScopeStatusEnum.fromJson(json[r'status'])!,
        effectiveAt: mapValueOfType<String>(json, r'effective_at'),
        source_: EffectiveConsentScopeSource_Enum.fromJson(json[r'source']),
        recordId: mapValueOfType<String>(json, r'record_id'),
      );
    }
    return null;
  }

  static List<EffectiveConsentScope> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EffectiveConsentScope>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EffectiveConsentScope.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EffectiveConsentScope> mapFromJson(dynamic json) {
    final map = <String, EffectiveConsentScope>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EffectiveConsentScope.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EffectiveConsentScope-objects as value to a dart map
  static Map<String, List<EffectiveConsentScope>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EffectiveConsentScope>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EffectiveConsentScope.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'consent_scope',
    'child_id',
    'authorized',
    'policy_version',
    'status',
    'effective_at',
    'source',
    'record_id',
  };
}


enum EffectiveConsentScopeStatusEnum {
  granted._(r'granted'),
  withdrawn._(r'withdrawn'),
  notGranted._(r'not_granted'),
  ;

  /// Instantiate a new enum with the provided value.
  const EffectiveConsentScopeStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [EffectiveConsentScopeStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EffectiveConsentScopeStatusEnum? fromJson(dynamic value) => EffectiveConsentScopeStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EffectiveConsentScopeStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EffectiveConsentScopeStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EffectiveConsentScopeStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EffectiveConsentScopeStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EffectiveConsentScopeStatusEnum] to String,
/// and [decode] dynamic data back to [EffectiveConsentScopeStatusEnum].
class EffectiveConsentScopeStatusEnumTypeTransformer {
  factory EffectiveConsentScopeStatusEnumTypeTransformer() => _instance ??= const EffectiveConsentScopeStatusEnumTypeTransformer._();

  const EffectiveConsentScopeStatusEnumTypeTransformer._();

  String encode(EffectiveConsentScopeStatusEnum data) => data._value;

  /// Returns the instance of [EffectiveConsentScopeStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EffectiveConsentScopeStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EffectiveConsentScopeStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'granted': return EffectiveConsentScopeStatusEnum.granted;
        case r'withdrawn': return EffectiveConsentScopeStatusEnum.withdrawn;
        case r'not_granted': return EffectiveConsentScopeStatusEnum.notGranted;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EffectiveConsentScopeStatusEnumTypeTransformer? _instance;
}



enum EffectiveConsentScopeSource_Enum {
  serverConsentStore._(r'server_consent_store'),
  ;

  /// Instantiate a new enum with the provided value.
  const EffectiveConsentScopeSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [EffectiveConsentScopeSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EffectiveConsentScopeSource_Enum? fromJson(dynamic value) => EffectiveConsentScopeSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EffectiveConsentScopeSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EffectiveConsentScopeSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EffectiveConsentScopeSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EffectiveConsentScopeSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EffectiveConsentScopeSource_Enum] to String,
/// and [decode] dynamic data back to [EffectiveConsentScopeSource_Enum].
class EffectiveConsentScopeSource_EnumTypeTransformer {
  factory EffectiveConsentScopeSource_EnumTypeTransformer() => _instance ??= const EffectiveConsentScopeSource_EnumTypeTransformer._();

  const EffectiveConsentScopeSource_EnumTypeTransformer._();

  String encode(EffectiveConsentScopeSource_Enum data) => data._value;

  /// Returns the instance of [EffectiveConsentScopeSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EffectiveConsentScopeSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EffectiveConsentScopeSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'server_consent_store': return EffectiveConsentScopeSource_Enum.serverConsentStore;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EffectiveConsentScopeSource_EnumTypeTransformer? _instance;
}


