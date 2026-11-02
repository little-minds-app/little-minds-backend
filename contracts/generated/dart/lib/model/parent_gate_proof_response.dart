//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentGateProofResponse {
  /// Returns a new [ParentGateProofResponse] instance.
  ParentGateProofResponse({
    required this.stepUpToken,
    required this.purpose,
    required this.expiresIn,
  });

  String stepUpToken;

  ParentGateProofResponsePurposeEnum purpose;

  int expiresIn;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentGateProofResponse &&
    other.stepUpToken == stepUpToken &&
    other.purpose == purpose &&
    other.expiresIn == expiresIn;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (stepUpToken.hashCode) +
    (purpose.hashCode) +
    (expiresIn.hashCode);

  @override
  String toString() => 'ParentGateProofResponse[stepUpToken=$stepUpToken, purpose=$purpose, expiresIn=$expiresIn]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'step_up_token'] = this.stepUpToken;
      json[r'purpose'] = this.purpose;
      json[r'expires_in'] = this.expiresIn;
    return json;
  }

  /// Returns a new [ParentGateProofResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentGateProofResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'step_up_token'), 'Required key "ParentGateProofResponse[step_up_token]" is missing from JSON.');
        assert(json[r'step_up_token'] != null, 'Required key "ParentGateProofResponse[step_up_token]" has a null value in JSON.');
        assert(json.containsKey(r'purpose'), 'Required key "ParentGateProofResponse[purpose]" is missing from JSON.');
        assert(json[r'purpose'] != null, 'Required key "ParentGateProofResponse[purpose]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "ParentGateProofResponse[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "ParentGateProofResponse[expires_in]" has a null value in JSON.');
        return true;
      }());

      return ParentGateProofResponse(
        stepUpToken: mapValueOfType<String>(json, r'step_up_token')!,
        purpose: ParentGateProofResponsePurposeEnum.fromJson(json[r'purpose'])!,
        expiresIn: mapValueOfType<int>(json, r'expires_in')!,
      );
    }
    return null;
  }

  static List<ParentGateProofResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateProofResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateProofResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentGateProofResponse> mapFromJson(dynamic json) {
    final map = <String, ParentGateProofResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentGateProofResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentGateProofResponse-objects as value to a dart map
  static Map<String, List<ParentGateProofResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentGateProofResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentGateProofResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'step_up_token',
    'purpose',
    'expires_in',
  };
}


enum ParentGateProofResponsePurposeEnum {
  parentGatePin._(r'parent_gate_pin'),
  ;

  /// Instantiate a new enum with the provided value.
  const ParentGateProofResponsePurposeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ParentGateProofResponsePurposeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ParentGateProofResponsePurposeEnum? fromJson(dynamic value) => ParentGateProofResponsePurposeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ParentGateProofResponsePurposeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ParentGateProofResponsePurposeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentGateProofResponsePurposeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentGateProofResponsePurposeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ParentGateProofResponsePurposeEnum] to String,
/// and [decode] dynamic data back to [ParentGateProofResponsePurposeEnum].
class ParentGateProofResponsePurposeEnumTypeTransformer {
  factory ParentGateProofResponsePurposeEnumTypeTransformer() => _instance ??= const ParentGateProofResponsePurposeEnumTypeTransformer._();

  const ParentGateProofResponsePurposeEnumTypeTransformer._();

  String encode(ParentGateProofResponsePurposeEnum data) => data._value;

  /// Returns the instance of [ParentGateProofResponsePurposeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ParentGateProofResponsePurposeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is ParentGateProofResponsePurposeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'parent_gate_pin': return ParentGateProofResponsePurposeEnum.parentGatePin;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ParentGateProofResponsePurposeEnumTypeTransformer? _instance;
}


