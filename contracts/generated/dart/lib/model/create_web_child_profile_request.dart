//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateWebChildProfileRequest {
  /// Returns a new [CreateWebChildProfileRequest] instance.
  CreateWebChildProfileRequest({
    required this.ageMonths,
    required this.referenceDate,
    this.nickname,
    this.timezone,
  });

  /// Minimum value: 0
  int ageMonths;

  DateTime referenceDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? nickname;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? timezone;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateWebChildProfileRequest &&
    other.ageMonths == ageMonths &&
    other.referenceDate == referenceDate &&
    other.nickname == nickname &&
    other.timezone == timezone;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (ageMonths.hashCode) +
    (referenceDate.hashCode) +
    (nickname == null ? 0 : nickname!.hashCode) +
    (timezone == null ? 0 : timezone!.hashCode);

  @override
  String toString() => 'CreateWebChildProfileRequest[ageMonths=$ageMonths, referenceDate=$referenceDate, nickname=$nickname, timezone=$timezone]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'age_months'] = this.ageMonths;
      json[r'reference_date'] = _dateFormatter.format(this.referenceDate);
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

  /// Returns a new [CreateWebChildProfileRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateWebChildProfileRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'age_months'), 'Required key "CreateWebChildProfileRequest[age_months]" is missing from JSON.');
        assert(json[r'age_months'] != null, 'Required key "CreateWebChildProfileRequest[age_months]" has a null value in JSON.');
        assert(json.containsKey(r'reference_date'), 'Required key "CreateWebChildProfileRequest[reference_date]" is missing from JSON.');
        assert(json[r'reference_date'] != null, 'Required key "CreateWebChildProfileRequest[reference_date]" has a null value in JSON.');
        return true;
      }());

      return CreateWebChildProfileRequest(
        ageMonths: mapValueOfType<int>(json, r'age_months')!,
        referenceDate: mapDateTime(json, r'reference_date', r'')!,
        nickname: mapValueOfType<String>(json, r'nickname'),
        timezone: mapValueOfType<String>(json, r'timezone'),
      );
    }
    return null;
  }

  static List<CreateWebChildProfileRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateWebChildProfileRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateWebChildProfileRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateWebChildProfileRequest> mapFromJson(dynamic json) {
    final map = <String, CreateWebChildProfileRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateWebChildProfileRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateWebChildProfileRequest-objects as value to a dart map
  static Map<String, List<CreateWebChildProfileRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateWebChildProfileRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateWebChildProfileRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'age_months',
    'reference_date',
  };
}

