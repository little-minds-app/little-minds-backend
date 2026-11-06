//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ConsentScopeMutationRequest {
  /// Returns a new [ConsentScopeMutationRequest] instance.
  ConsentScopeMutationRequest({
    required this.consentScope,
    required this.policyVersion,
    this.childId,
  });

  ConsentScope consentScope;

  /// Published policy version for this scope (e.g. synthetic-policy-v1)
  String policyVersion;

  /// Omit or null for parent-level scope; set for child-scoped consent row
  String? childId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ConsentScopeMutationRequest &&
    other.consentScope == consentScope &&
    other.policyVersion == policyVersion &&
    other.childId == childId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (consentScope.hashCode) +
    (policyVersion.hashCode) +
    (childId == null ? 0 : childId!.hashCode);

  @override
  String toString() => 'ConsentScopeMutationRequest[consentScope=$consentScope, policyVersion=$policyVersion, childId=$childId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'consent_scope'] = this.consentScope;
      json[r'policy_version'] = this.policyVersion;
    if (this.childId != null) {
      json[r'child_id'] = this.childId;
    } else {
      json[r'child_id'] = null;
    }
    return json;
  }

  /// Returns a new [ConsentScopeMutationRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ConsentScopeMutationRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'consent_scope'), 'Required key "ConsentScopeMutationRequest[consent_scope]" is missing from JSON.');
        assert(json[r'consent_scope'] != null, 'Required key "ConsentScopeMutationRequest[consent_scope]" has a null value in JSON.');
        assert(json.containsKey(r'policy_version'), 'Required key "ConsentScopeMutationRequest[policy_version]" is missing from JSON.');
        assert(json[r'policy_version'] != null, 'Required key "ConsentScopeMutationRequest[policy_version]" has a null value in JSON.');
        return true;
      }());

      return ConsentScopeMutationRequest(
        consentScope: ConsentScope.fromJson(json[r'consent_scope'])!,
        policyVersion: mapValueOfType<String>(json, r'policy_version')!,
        childId: mapValueOfType<String>(json, r'child_id'),
      );
    }
    return null;
  }

  static List<ConsentScopeMutationRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ConsentScopeMutationRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ConsentScopeMutationRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ConsentScopeMutationRequest> mapFromJson(dynamic json) {
    final map = <String, ConsentScopeMutationRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ConsentScopeMutationRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ConsentScopeMutationRequest-objects as value to a dart map
  static Map<String, List<ConsentScopeMutationRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ConsentScopeMutationRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ConsentScopeMutationRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'consent_scope',
    'policy_version',
  };
}

