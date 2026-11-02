//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class OptionalParentProfile {
  /// Returns a new [OptionalParentProfile] instance.
  OptionalParentProfile({
    required this.firstName,
    required this.lastName,
    required this.ageBandOptional,
    required this.genderOptional,
    required this.numberOfChildrenOptional,
    required this.occupationOptional,
  });

  String? firstName;

  String? lastName;

  OptionalParentProfileAgeBandOptionalEnum? ageBandOptional;

  OptionalParentProfileGenderOptionalEnum? genderOptional;

  /// Minimum value: 0
  /// Maximum value: 30
  int? numberOfChildrenOptional;

  OptionalParentProfileOccupationOptionalEnum? occupationOptional;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OptionalParentProfile &&
    other.firstName == firstName &&
    other.lastName == lastName &&
    other.ageBandOptional == ageBandOptional &&
    other.genderOptional == genderOptional &&
    other.numberOfChildrenOptional == numberOfChildrenOptional &&
    other.occupationOptional == occupationOptional;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (firstName == null ? 0 : firstName!.hashCode) +
    (lastName == null ? 0 : lastName!.hashCode) +
    (ageBandOptional == null ? 0 : ageBandOptional!.hashCode) +
    (genderOptional == null ? 0 : genderOptional!.hashCode) +
    (numberOfChildrenOptional == null ? 0 : numberOfChildrenOptional!.hashCode) +
    (occupationOptional == null ? 0 : occupationOptional!.hashCode);

  @override
  String toString() => 'OptionalParentProfile[firstName=$firstName, lastName=$lastName, ageBandOptional=$ageBandOptional, genderOptional=$genderOptional, numberOfChildrenOptional=$numberOfChildrenOptional, occupationOptional=$occupationOptional]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.firstName != null) {
      json[r'first_name'] = this.firstName;
    } else {
      json[r'first_name'] = null;
    }
    if (this.lastName != null) {
      json[r'last_name'] = this.lastName;
    } else {
      json[r'last_name'] = null;
    }
    if (this.ageBandOptional != null) {
      json[r'age_band_optional'] = this.ageBandOptional;
    } else {
      json[r'age_band_optional'] = null;
    }
    if (this.genderOptional != null) {
      json[r'gender_optional'] = this.genderOptional;
    } else {
      json[r'gender_optional'] = null;
    }
    if (this.numberOfChildrenOptional != null) {
      json[r'number_of_children_optional'] = this.numberOfChildrenOptional;
    } else {
      json[r'number_of_children_optional'] = null;
    }
    if (this.occupationOptional != null) {
      json[r'occupation_optional'] = this.occupationOptional;
    } else {
      json[r'occupation_optional'] = null;
    }
    return json;
  }

  /// Returns a new [OptionalParentProfile] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OptionalParentProfile? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'first_name'), 'Required key "OptionalParentProfile[first_name]" is missing from JSON.');
        assert(json.containsKey(r'last_name'), 'Required key "OptionalParentProfile[last_name]" is missing from JSON.');
        assert(json.containsKey(r'age_band_optional'), 'Required key "OptionalParentProfile[age_band_optional]" is missing from JSON.');
        assert(json.containsKey(r'gender_optional'), 'Required key "OptionalParentProfile[gender_optional]" is missing from JSON.');
        assert(json.containsKey(r'number_of_children_optional'), 'Required key "OptionalParentProfile[number_of_children_optional]" is missing from JSON.');
        assert(json.containsKey(r'occupation_optional'), 'Required key "OptionalParentProfile[occupation_optional]" is missing from JSON.');
        return true;
      }());

      return OptionalParentProfile(
        firstName: mapValueOfType<String>(json, r'first_name'),
        lastName: mapValueOfType<String>(json, r'last_name'),
        ageBandOptional: OptionalParentProfileAgeBandOptionalEnum.fromJson(json[r'age_band_optional']),
        genderOptional: OptionalParentProfileGenderOptionalEnum.fromJson(json[r'gender_optional']),
        numberOfChildrenOptional: mapValueOfType<int>(json, r'number_of_children_optional'),
        occupationOptional: OptionalParentProfileOccupationOptionalEnum.fromJson(json[r'occupation_optional']),
      );
    }
    return null;
  }

  static List<OptionalParentProfile> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OptionalParentProfile>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OptionalParentProfile.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OptionalParentProfile> mapFromJson(dynamic json) {
    final map = <String, OptionalParentProfile>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OptionalParentProfile.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OptionalParentProfile-objects as value to a dart map
  static Map<String, List<OptionalParentProfile>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OptionalParentProfile>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OptionalParentProfile.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'first_name',
    'last_name',
    'age_band_optional',
    'gender_optional',
    'number_of_children_optional',
    'occupation_optional',
  };
}


enum OptionalParentProfileAgeBandOptionalEnum {
  n1824._(r'18-24'),
  n2534._(r'25-34'),
  n3544._(r'35-44'),
  n4554._(r'45-54'),
  n55plus._(r'55+'),
  preferNotToSay._(r'prefer_not_to_say'),
  ;

  /// Instantiate a new enum with the provided value.
  const OptionalParentProfileAgeBandOptionalEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [OptionalParentProfileAgeBandOptionalEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static OptionalParentProfileAgeBandOptionalEnum? fromJson(dynamic value) => OptionalParentProfileAgeBandOptionalEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [OptionalParentProfileAgeBandOptionalEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<OptionalParentProfileAgeBandOptionalEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OptionalParentProfileAgeBandOptionalEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OptionalParentProfileAgeBandOptionalEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [OptionalParentProfileAgeBandOptionalEnum] to String,
/// and [decode] dynamic data back to [OptionalParentProfileAgeBandOptionalEnum].
class OptionalParentProfileAgeBandOptionalEnumTypeTransformer {
  factory OptionalParentProfileAgeBandOptionalEnumTypeTransformer() => _instance ??= const OptionalParentProfileAgeBandOptionalEnumTypeTransformer._();

  const OptionalParentProfileAgeBandOptionalEnumTypeTransformer._();

  String encode(OptionalParentProfileAgeBandOptionalEnum data) => data._value;

  /// Returns the instance of [OptionalParentProfileAgeBandOptionalEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  OptionalParentProfileAgeBandOptionalEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is OptionalParentProfileAgeBandOptionalEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'18-24': return OptionalParentProfileAgeBandOptionalEnum.n1824;
        case r'25-34': return OptionalParentProfileAgeBandOptionalEnum.n2534;
        case r'35-44': return OptionalParentProfileAgeBandOptionalEnum.n3544;
        case r'45-54': return OptionalParentProfileAgeBandOptionalEnum.n4554;
        case r'55+': return OptionalParentProfileAgeBandOptionalEnum.n55plus;
        case r'prefer_not_to_say': return OptionalParentProfileAgeBandOptionalEnum.preferNotToSay;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static OptionalParentProfileAgeBandOptionalEnumTypeTransformer? _instance;
}



enum OptionalParentProfileGenderOptionalEnum {
  woman._(r'woman'),
  man._(r'man'),
  nonBinary._(r'non_binary'),
  selfDescribe._(r'self_describe'),
  preferNotToSay._(r'prefer_not_to_say'),
  ;

  /// Instantiate a new enum with the provided value.
  const OptionalParentProfileGenderOptionalEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [OptionalParentProfileGenderOptionalEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static OptionalParentProfileGenderOptionalEnum? fromJson(dynamic value) => OptionalParentProfileGenderOptionalEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [OptionalParentProfileGenderOptionalEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<OptionalParentProfileGenderOptionalEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OptionalParentProfileGenderOptionalEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OptionalParentProfileGenderOptionalEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [OptionalParentProfileGenderOptionalEnum] to String,
/// and [decode] dynamic data back to [OptionalParentProfileGenderOptionalEnum].
class OptionalParentProfileGenderOptionalEnumTypeTransformer {
  factory OptionalParentProfileGenderOptionalEnumTypeTransformer() => _instance ??= const OptionalParentProfileGenderOptionalEnumTypeTransformer._();

  const OptionalParentProfileGenderOptionalEnumTypeTransformer._();

  String encode(OptionalParentProfileGenderOptionalEnum data) => data._value;

  /// Returns the instance of [OptionalParentProfileGenderOptionalEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  OptionalParentProfileGenderOptionalEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is OptionalParentProfileGenderOptionalEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'woman': return OptionalParentProfileGenderOptionalEnum.woman;
        case r'man': return OptionalParentProfileGenderOptionalEnum.man;
        case r'non_binary': return OptionalParentProfileGenderOptionalEnum.nonBinary;
        case r'self_describe': return OptionalParentProfileGenderOptionalEnum.selfDescribe;
        case r'prefer_not_to_say': return OptionalParentProfileGenderOptionalEnum.preferNotToSay;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static OptionalParentProfileGenderOptionalEnumTypeTransformer? _instance;
}



enum OptionalParentProfileOccupationOptionalEnum {
  education._(r'education'),
  healthcare._(r'healthcare'),
  technology._(r'technology'),
  financeBusiness._(r'finance_business'),
  publicService._(r'public_service'),
  retailServices._(r'retail_services'),
  manufacturingTrades._(r'manufacturing_trades'),
  creativeMedia._(r'creative_media'),
  homemakerCaregiver._(r'homemaker_caregiver'),
  student._(r'student'),
  retired._(r'retired'),
  notCurrentlyEmployed._(r'not_currently_employed'),
  other._(r'other'),
  preferNotToSay._(r'prefer_not_to_say'),
  ;

  /// Instantiate a new enum with the provided value.
  const OptionalParentProfileOccupationOptionalEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [OptionalParentProfileOccupationOptionalEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static OptionalParentProfileOccupationOptionalEnum? fromJson(dynamic value) => OptionalParentProfileOccupationOptionalEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [OptionalParentProfileOccupationOptionalEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<OptionalParentProfileOccupationOptionalEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OptionalParentProfileOccupationOptionalEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OptionalParentProfileOccupationOptionalEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [OptionalParentProfileOccupationOptionalEnum] to String,
/// and [decode] dynamic data back to [OptionalParentProfileOccupationOptionalEnum].
class OptionalParentProfileOccupationOptionalEnumTypeTransformer {
  factory OptionalParentProfileOccupationOptionalEnumTypeTransformer() => _instance ??= const OptionalParentProfileOccupationOptionalEnumTypeTransformer._();

  const OptionalParentProfileOccupationOptionalEnumTypeTransformer._();

  String encode(OptionalParentProfileOccupationOptionalEnum data) => data._value;

  /// Returns the instance of [OptionalParentProfileOccupationOptionalEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  OptionalParentProfileOccupationOptionalEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is OptionalParentProfileOccupationOptionalEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'education': return OptionalParentProfileOccupationOptionalEnum.education;
        case r'healthcare': return OptionalParentProfileOccupationOptionalEnum.healthcare;
        case r'technology': return OptionalParentProfileOccupationOptionalEnum.technology;
        case r'finance_business': return OptionalParentProfileOccupationOptionalEnum.financeBusiness;
        case r'public_service': return OptionalParentProfileOccupationOptionalEnum.publicService;
        case r'retail_services': return OptionalParentProfileOccupationOptionalEnum.retailServices;
        case r'manufacturing_trades': return OptionalParentProfileOccupationOptionalEnum.manufacturingTrades;
        case r'creative_media': return OptionalParentProfileOccupationOptionalEnum.creativeMedia;
        case r'homemaker_caregiver': return OptionalParentProfileOccupationOptionalEnum.homemakerCaregiver;
        case r'student': return OptionalParentProfileOccupationOptionalEnum.student;
        case r'retired': return OptionalParentProfileOccupationOptionalEnum.retired;
        case r'not_currently_employed': return OptionalParentProfileOccupationOptionalEnum.notCurrentlyEmployed;
        case r'other': return OptionalParentProfileOccupationOptionalEnum.other;
        case r'prefer_not_to_say': return OptionalParentProfileOccupationOptionalEnum.preferNotToSay;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static OptionalParentProfileOccupationOptionalEnumTypeTransformer? _instance;
}


