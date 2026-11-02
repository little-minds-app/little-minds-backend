//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateOptionalParentProfile {
  /// Returns a new [UpdateOptionalParentProfile] instance.
  UpdateOptionalParentProfile({
    this.firstName,
    this.lastName,
    this.ageBandOptional,
    this.genderOptional,
    this.numberOfChildrenOptional,
    this.occupationOptional,
  });

  String? firstName;

  String? lastName;

  UpdateOptionalParentProfileAgeBandOptionalEnum? ageBandOptional;

  UpdateOptionalParentProfileGenderOptionalEnum? genderOptional;

  /// Minimum value: 0
  /// Maximum value: 30
  int? numberOfChildrenOptional;

  UpdateOptionalParentProfileOccupationOptionalEnum? occupationOptional;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateOptionalParentProfile &&
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
  String toString() => 'UpdateOptionalParentProfile[firstName=$firstName, lastName=$lastName, ageBandOptional=$ageBandOptional, genderOptional=$genderOptional, numberOfChildrenOptional=$numberOfChildrenOptional, occupationOptional=$occupationOptional]';

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

  /// Returns a new [UpdateOptionalParentProfile] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateOptionalParentProfile? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateOptionalParentProfile(
        firstName: mapValueOfType<String>(json, r'first_name'),
        lastName: mapValueOfType<String>(json, r'last_name'),
        ageBandOptional: UpdateOptionalParentProfileAgeBandOptionalEnum.fromJson(json[r'age_band_optional']),
        genderOptional: UpdateOptionalParentProfileGenderOptionalEnum.fromJson(json[r'gender_optional']),
        numberOfChildrenOptional: mapValueOfType<int>(json, r'number_of_children_optional'),
        occupationOptional: UpdateOptionalParentProfileOccupationOptionalEnum.fromJson(json[r'occupation_optional']),
      );
    }
    return null;
  }

  static List<UpdateOptionalParentProfile> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateOptionalParentProfile>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateOptionalParentProfile.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateOptionalParentProfile> mapFromJson(dynamic json) {
    final map = <String, UpdateOptionalParentProfile>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateOptionalParentProfile.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateOptionalParentProfile-objects as value to a dart map
  static Map<String, List<UpdateOptionalParentProfile>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateOptionalParentProfile>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateOptionalParentProfile.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


enum UpdateOptionalParentProfileAgeBandOptionalEnum {
  n1824._(r'18-24'),
  n2534._(r'25-34'),
  n3544._(r'35-44'),
  n4554._(r'45-54'),
  n55plus._(r'55+'),
  preferNotToSay._(r'prefer_not_to_say'),
  ;

  /// Instantiate a new enum with the provided value.
  const UpdateOptionalParentProfileAgeBandOptionalEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UpdateOptionalParentProfileAgeBandOptionalEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UpdateOptionalParentProfileAgeBandOptionalEnum? fromJson(dynamic value) => UpdateOptionalParentProfileAgeBandOptionalEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UpdateOptionalParentProfileAgeBandOptionalEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UpdateOptionalParentProfileAgeBandOptionalEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateOptionalParentProfileAgeBandOptionalEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateOptionalParentProfileAgeBandOptionalEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateOptionalParentProfileAgeBandOptionalEnum] to String,
/// and [decode] dynamic data back to [UpdateOptionalParentProfileAgeBandOptionalEnum].
class UpdateOptionalParentProfileAgeBandOptionalEnumTypeTransformer {
  factory UpdateOptionalParentProfileAgeBandOptionalEnumTypeTransformer() => _instance ??= const UpdateOptionalParentProfileAgeBandOptionalEnumTypeTransformer._();

  const UpdateOptionalParentProfileAgeBandOptionalEnumTypeTransformer._();

  String encode(UpdateOptionalParentProfileAgeBandOptionalEnum data) => data._value;

  /// Returns the instance of [UpdateOptionalParentProfileAgeBandOptionalEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateOptionalParentProfileAgeBandOptionalEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UpdateOptionalParentProfileAgeBandOptionalEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'18-24': return UpdateOptionalParentProfileAgeBandOptionalEnum.n1824;
        case r'25-34': return UpdateOptionalParentProfileAgeBandOptionalEnum.n2534;
        case r'35-44': return UpdateOptionalParentProfileAgeBandOptionalEnum.n3544;
        case r'45-54': return UpdateOptionalParentProfileAgeBandOptionalEnum.n4554;
        case r'55+': return UpdateOptionalParentProfileAgeBandOptionalEnum.n55plus;
        case r'prefer_not_to_say': return UpdateOptionalParentProfileAgeBandOptionalEnum.preferNotToSay;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UpdateOptionalParentProfileAgeBandOptionalEnumTypeTransformer? _instance;
}



enum UpdateOptionalParentProfileGenderOptionalEnum {
  woman._(r'woman'),
  man._(r'man'),
  nonBinary._(r'non_binary'),
  selfDescribe._(r'self_describe'),
  preferNotToSay._(r'prefer_not_to_say'),
  ;

  /// Instantiate a new enum with the provided value.
  const UpdateOptionalParentProfileGenderOptionalEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UpdateOptionalParentProfileGenderOptionalEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UpdateOptionalParentProfileGenderOptionalEnum? fromJson(dynamic value) => UpdateOptionalParentProfileGenderOptionalEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UpdateOptionalParentProfileGenderOptionalEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UpdateOptionalParentProfileGenderOptionalEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateOptionalParentProfileGenderOptionalEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateOptionalParentProfileGenderOptionalEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateOptionalParentProfileGenderOptionalEnum] to String,
/// and [decode] dynamic data back to [UpdateOptionalParentProfileGenderOptionalEnum].
class UpdateOptionalParentProfileGenderOptionalEnumTypeTransformer {
  factory UpdateOptionalParentProfileGenderOptionalEnumTypeTransformer() => _instance ??= const UpdateOptionalParentProfileGenderOptionalEnumTypeTransformer._();

  const UpdateOptionalParentProfileGenderOptionalEnumTypeTransformer._();

  String encode(UpdateOptionalParentProfileGenderOptionalEnum data) => data._value;

  /// Returns the instance of [UpdateOptionalParentProfileGenderOptionalEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateOptionalParentProfileGenderOptionalEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UpdateOptionalParentProfileGenderOptionalEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'woman': return UpdateOptionalParentProfileGenderOptionalEnum.woman;
        case r'man': return UpdateOptionalParentProfileGenderOptionalEnum.man;
        case r'non_binary': return UpdateOptionalParentProfileGenderOptionalEnum.nonBinary;
        case r'self_describe': return UpdateOptionalParentProfileGenderOptionalEnum.selfDescribe;
        case r'prefer_not_to_say': return UpdateOptionalParentProfileGenderOptionalEnum.preferNotToSay;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UpdateOptionalParentProfileGenderOptionalEnumTypeTransformer? _instance;
}



enum UpdateOptionalParentProfileOccupationOptionalEnum {
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
  const UpdateOptionalParentProfileOccupationOptionalEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UpdateOptionalParentProfileOccupationOptionalEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UpdateOptionalParentProfileOccupationOptionalEnum? fromJson(dynamic value) => UpdateOptionalParentProfileOccupationOptionalEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UpdateOptionalParentProfileOccupationOptionalEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UpdateOptionalParentProfileOccupationOptionalEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateOptionalParentProfileOccupationOptionalEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateOptionalParentProfileOccupationOptionalEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateOptionalParentProfileOccupationOptionalEnum] to String,
/// and [decode] dynamic data back to [UpdateOptionalParentProfileOccupationOptionalEnum].
class UpdateOptionalParentProfileOccupationOptionalEnumTypeTransformer {
  factory UpdateOptionalParentProfileOccupationOptionalEnumTypeTransformer() => _instance ??= const UpdateOptionalParentProfileOccupationOptionalEnumTypeTransformer._();

  const UpdateOptionalParentProfileOccupationOptionalEnumTypeTransformer._();

  String encode(UpdateOptionalParentProfileOccupationOptionalEnum data) => data._value;

  /// Returns the instance of [UpdateOptionalParentProfileOccupationOptionalEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateOptionalParentProfileOccupationOptionalEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UpdateOptionalParentProfileOccupationOptionalEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'education': return UpdateOptionalParentProfileOccupationOptionalEnum.education;
        case r'healthcare': return UpdateOptionalParentProfileOccupationOptionalEnum.healthcare;
        case r'technology': return UpdateOptionalParentProfileOccupationOptionalEnum.technology;
        case r'finance_business': return UpdateOptionalParentProfileOccupationOptionalEnum.financeBusiness;
        case r'public_service': return UpdateOptionalParentProfileOccupationOptionalEnum.publicService;
        case r'retail_services': return UpdateOptionalParentProfileOccupationOptionalEnum.retailServices;
        case r'manufacturing_trades': return UpdateOptionalParentProfileOccupationOptionalEnum.manufacturingTrades;
        case r'creative_media': return UpdateOptionalParentProfileOccupationOptionalEnum.creativeMedia;
        case r'homemaker_caregiver': return UpdateOptionalParentProfileOccupationOptionalEnum.homemakerCaregiver;
        case r'student': return UpdateOptionalParentProfileOccupationOptionalEnum.student;
        case r'retired': return UpdateOptionalParentProfileOccupationOptionalEnum.retired;
        case r'not_currently_employed': return UpdateOptionalParentProfileOccupationOptionalEnum.notCurrentlyEmployed;
        case r'other': return UpdateOptionalParentProfileOccupationOptionalEnum.other;
        case r'prefer_not_to_say': return UpdateOptionalParentProfileOccupationOptionalEnum.preferNotToSay;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UpdateOptionalParentProfileOccupationOptionalEnumTypeTransformer? _instance;
}


