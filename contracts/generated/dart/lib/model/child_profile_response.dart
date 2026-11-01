//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ChildProfileResponse {
  /// Returns a new [ChildProfileResponse] instance.
  ChildProfileResponse({
    required this.childId,
    required this.nickname,
    required this.ageMonths,
    required this.preferredLocale,
  });

  String childId;

  String? nickname;

  int ageMonths;

  String preferredLocale;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ChildProfileResponse &&
    other.childId == childId &&
    other.nickname == nickname &&
    other.ageMonths == ageMonths &&
    other.preferredLocale == preferredLocale;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (childId.hashCode) +
    (nickname == null ? 0 : nickname!.hashCode) +
    (ageMonths.hashCode) +
    (preferredLocale.hashCode);

  @override
  String toString() => 'ChildProfileResponse[childId=$childId, nickname=$nickname, ageMonths=$ageMonths, preferredLocale=$preferredLocale]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'child_id'] = this.childId;
    if (this.nickname != null) {
      json[r'nickname'] = this.nickname;
    } else {
      json[r'nickname'] = null;
    }
      json[r'age_months'] = this.ageMonths;
      json[r'preferred_locale'] = this.preferredLocale;
    return json;
  }

  /// Returns a new [ChildProfileResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ChildProfileResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'child_id'), 'Required key "ChildProfileResponse[child_id]" is missing from JSON.');
        assert(json[r'child_id'] != null, 'Required key "ChildProfileResponse[child_id]" has a null value in JSON.');
        assert(json.containsKey(r'nickname'), 'Required key "ChildProfileResponse[nickname]" is missing from JSON.');
        assert(json.containsKey(r'age_months'), 'Required key "ChildProfileResponse[age_months]" is missing from JSON.');
        assert(json[r'age_months'] != null, 'Required key "ChildProfileResponse[age_months]" has a null value in JSON.');
        assert(json.containsKey(r'preferred_locale'), 'Required key "ChildProfileResponse[preferred_locale]" is missing from JSON.');
        assert(json[r'preferred_locale'] != null, 'Required key "ChildProfileResponse[preferred_locale]" has a null value in JSON.');
        return true;
      }());

      return ChildProfileResponse(
        childId: mapValueOfType<String>(json, r'child_id')!,
        nickname: mapValueOfType<String>(json, r'nickname'),
        ageMonths: mapValueOfType<int>(json, r'age_months')!,
        preferredLocale: mapValueOfType<String>(json, r'preferred_locale')!,
      );
    }
    return null;
  }

  static List<ChildProfileResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ChildProfileResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ChildProfileResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ChildProfileResponse> mapFromJson(dynamic json) {
    final map = <String, ChildProfileResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ChildProfileResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ChildProfileResponse-objects as value to a dart map
  static Map<String, List<ChildProfileResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ChildProfileResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ChildProfileResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'child_id',
    'nickname',
    'age_months',
    'preferred_locale',
  };
}

