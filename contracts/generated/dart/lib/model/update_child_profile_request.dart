//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateChildProfileRequest {
  /// Returns a new [UpdateChildProfileRequest] instance.
  UpdateChildProfileRequest({
    this.ageMonths,
    this.referenceDate,
    this.nickname,
    this.timezone,
  });

  /// Minimum value: 0
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  int? ageMonths;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  DateTime? referenceDate;

  String? nickname;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? timezone;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateChildProfileRequest &&
    other.ageMonths == ageMonths &&
    other.referenceDate == referenceDate &&
    other.nickname == nickname &&
    other.timezone == timezone;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (ageMonths == null ? 0 : ageMonths!.hashCode) +
    (referenceDate == null ? 0 : referenceDate!.hashCode) +
    (nickname == null ? 0 : nickname!.hashCode) +
    (timezone == null ? 0 : timezone!.hashCode);

  @override
  String toString() => 'UpdateChildProfileRequest[ageMonths=$ageMonths, referenceDate=$referenceDate, nickname=$nickname, timezone=$timezone]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.ageMonths != null) {
      json[r'age_months'] = this.ageMonths;
    } else {
      json[r'age_months'] = null;
    }
    if (this.referenceDate != null) {
      json[r'reference_date'] = _dateFormatter.format(this.referenceDate!);
    } else {
      json[r'reference_date'] = null;
    }
    if (this.nickname != null) {
      json[r'nickname'] = this.nickname;
    } else {
      json[r'nickname'] = null;
    }
    if (this.timezone != null) {
      json[r'timezone'] = this.timezone;
    } else {
      json[r'timezone'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateChildProfileRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateChildProfileRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateChildProfileRequest(
        ageMonths: mapValueOfType<int>(json, r'age_months'),
        referenceDate: mapDateTime(json, r'reference_date', r''),
        nickname: mapValueOfType<String>(json, r'nickname'),
        timezone: mapValueOfType<String>(json, r'timezone'),
      );
    }
    return null;
  }

  static List<UpdateChildProfileRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateChildProfileRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateChildProfileRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateChildProfileRequest> mapFromJson(dynamic json) {
    final map = <String, UpdateChildProfileRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateChildProfileRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateChildProfileRequest-objects as value to a dart map
  static Map<String, List<UpdateChildProfileRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateChildProfileRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateChildProfileRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}

