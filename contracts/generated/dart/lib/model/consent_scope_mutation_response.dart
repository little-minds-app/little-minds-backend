//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ConsentScopeMutationResponse {
  /// Returns a new [ConsentScopeMutationResponse] instance.
  ConsentScopeMutationResponse({
    required this.recordId,
    required this.consentScope,
    required this.childId,
    required this.policyVersion,
    required this.status,
    required this.recordedAt,
    required this.source_,
  });

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String recordId;

  ConsentScope consentScope;

  /// RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134). 
  String? childId;

  String policyVersion;

  ConsentScopeMutationResponseStatusEnum status;

  /// UTC ISO-8601 instant ending in Z
  String recordedAt;

  ConsentScopeMutationResponseSource_Enum source_;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ConsentScopeMutationResponse &&
    other.recordId == recordId &&
    other.consentScope == consentScope &&
    other.childId == childId &&
    other.policyVersion == policyVersion &&
    other.status == status &&
    other.recordedAt == recordedAt &&
    other.source_ == source_;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (recordId.hashCode) +
    (consentScope.hashCode) +
    (childId == null ? 0 : childId!.hashCode) +
    (policyVersion.hashCode) +
    (status.hashCode) +
    (recordedAt.hashCode) +
    (source_.hashCode);

  @override
  String toString() => 'ConsentScopeMutationResponse[recordId=$recordId, consentScope=$consentScope, childId=$childId, policyVersion=$policyVersion, status=$status, recordedAt=$recordedAt, source_=$source_]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'record_id'] = this.recordId;
      json[r'consent_scope'] = this.consentScope;
    if (this.childId != null) {
      json[r'child_id'] = this.childId;
    } else {
      json[r'child_id'] = null;
    }
      json[r'policy_version'] = this.policyVersion;
      json[r'status'] = this.status;
      json[r'recorded_at'] = this.recordedAt;
      json[r'source'] = this.source_;
    return json;
  }

  /// Returns a new [ConsentScopeMutationResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ConsentScopeMutationResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'record_id'), 'Required key "ConsentScopeMutationResponse[record_id]" is missing from JSON.');
        assert(json[r'record_id'] != null, 'Required key "ConsentScopeMutationResponse[record_id]" has a null value in JSON.');
        assert(json.containsKey(r'consent_scope'), 'Required key "ConsentScopeMutationResponse[consent_scope]" is missing from JSON.');
        assert(json[r'consent_scope'] != null, 'Required key "ConsentScopeMutationResponse[consent_scope]" has a null value in JSON.');
        assert(json.containsKey(r'child_id'), 'Required key "ConsentScopeMutationResponse[child_id]" is missing from JSON.');
        assert(json.containsKey(r'policy_version'), 'Required key "ConsentScopeMutationResponse[policy_version]" is missing from JSON.');
        assert(json[r'policy_version'] != null, 'Required key "ConsentScopeMutationResponse[policy_version]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "ConsentScopeMutationResponse[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "ConsentScopeMutationResponse[status]" has a null value in JSON.');
        assert(json.containsKey(r'recorded_at'), 'Required key "ConsentScopeMutationResponse[recorded_at]" is missing from JSON.');
        assert(json[r'recorded_at'] != null, 'Required key "ConsentScopeMutationResponse[recorded_at]" has a null value in JSON.');
        assert(json.containsKey(r'source'), 'Required key "ConsentScopeMutationResponse[source]" is missing from JSON.');
        assert(json[r'source'] != null, 'Required key "ConsentScopeMutationResponse[source]" has a null value in JSON.');
        return true;
      }());

      return ConsentScopeMutationResponse(
        recordId: mapValueOfType<String>(json, r'record_id')!,
        consentScope: ConsentScope.fromJson(json[r'consent_scope'])!,
        childId: mapValueOfType<String>(json, r'child_id'),
        policyVersion: mapValueOfType<String>(json, r'policy_version')!,
        status: ConsentScopeMutationResponseStatusEnum.fromJson(json[r'status'])!,
        recordedAt: mapValueOfType<String>(json, r'recorded_at')!,
        source_: ConsentScopeMutationResponseSource_Enum.fromJson(json[r'source'])!,
      );
    }
    return null;
  }

  static List<ConsentScopeMutationResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ConsentScopeMutationResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ConsentScopeMutationResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ConsentScopeMutationResponse> mapFromJson(dynamic json) {
    final map = <String, ConsentScopeMutationResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ConsentScopeMutationResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ConsentScopeMutationResponse-objects as value to a dart map
  static Map<String, List<ConsentScopeMutationResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ConsentScopeMutationResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ConsentScopeMutationResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'record_id',
    'consent_scope',
    'child_id',
    'policy_version',
    'status',
    'recorded_at',
    'source',
  };
}


enum ConsentScopeMutationResponseStatusEnum {
  granted._(r'granted'),
  withdrawn._(r'withdrawn'),
  ;

  /// Instantiate a new enum with the provided value.
  const ConsentScopeMutationResponseStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ConsentScopeMutationResponseStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ConsentScopeMutationResponseStatusEnum? fromJson(dynamic value) => ConsentScopeMutationResponseStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ConsentScopeMutationResponseStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ConsentScopeMutationResponseStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ConsentScopeMutationResponseStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ConsentScopeMutationResponseStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ConsentScopeMutationResponseStatusEnum] to String,
/// and [decode] dynamic data back to [ConsentScopeMutationResponseStatusEnum].
class ConsentScopeMutationResponseStatusEnumTypeTransformer {
  factory ConsentScopeMutationResponseStatusEnumTypeTransformer() => _instance ??= const ConsentScopeMutationResponseStatusEnumTypeTransformer._();

  const ConsentScopeMutationResponseStatusEnumTypeTransformer._();

  String encode(ConsentScopeMutationResponseStatusEnum data) => data._value;

  /// Returns the instance of [ConsentScopeMutationResponseStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ConsentScopeMutationResponseStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ConsentScopeMutationResponseStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'granted': return ConsentScopeMutationResponseStatusEnum.granted;
        case r'withdrawn': return ConsentScopeMutationResponseStatusEnum.withdrawn;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ConsentScopeMutationResponseStatusEnumTypeTransformer? _instance;
}



enum ConsentScopeMutationResponseSource_Enum {
  serverConsentStore._(r'server_consent_store'),
  ;

  /// Instantiate a new enum with the provided value.
  const ConsentScopeMutationResponseSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ConsentScopeMutationResponseSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ConsentScopeMutationResponseSource_Enum? fromJson(dynamic value) => ConsentScopeMutationResponseSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ConsentScopeMutationResponseSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ConsentScopeMutationResponseSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ConsentScopeMutationResponseSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ConsentScopeMutationResponseSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ConsentScopeMutationResponseSource_Enum] to String,
/// and [decode] dynamic data back to [ConsentScopeMutationResponseSource_Enum].
class ConsentScopeMutationResponseSource_EnumTypeTransformer {
  factory ConsentScopeMutationResponseSource_EnumTypeTransformer() => _instance ??= const ConsentScopeMutationResponseSource_EnumTypeTransformer._();

  const ConsentScopeMutationResponseSource_EnumTypeTransformer._();

  String encode(ConsentScopeMutationResponseSource_Enum data) => data._value;

  /// Returns the instance of [ConsentScopeMutationResponseSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ConsentScopeMutationResponseSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ConsentScopeMutationResponseSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'server_consent_store': return ConsentScopeMutationResponseSource_Enum.serverConsentStore;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ConsentScopeMutationResponseSource_EnumTypeTransformer? _instance;
}


