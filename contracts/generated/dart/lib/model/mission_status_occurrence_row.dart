//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MissionStatusOccurrenceRow {
  /// Returns a new [MissionStatusOccurrenceRow] instance.
  MissionStatusOccurrenceRow({
    required this.occurrenceId,
    required this.missionId,
    required this.interaction,
    required this.parentReport,
  });

  String occurrenceId;

  String missionId;

  MissionInteractionFacts interaction;

  MissionParentReportFacts parentReport;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MissionStatusOccurrenceRow &&
    other.occurrenceId == occurrenceId &&
    other.missionId == missionId &&
    other.interaction == interaction &&
    other.parentReport == parentReport;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (occurrenceId.hashCode) +
    (missionId.hashCode) +
    (interaction.hashCode) +
    (parentReport.hashCode);

  @override
  String toString() => 'MissionStatusOccurrenceRow[occurrenceId=$occurrenceId, missionId=$missionId, interaction=$interaction, parentReport=$parentReport]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'occurrence_id'] = this.occurrenceId;
      json[r'mission_id'] = this.missionId;
      json[r'interaction'] = this.interaction;
      json[r'parent_report'] = this.parentReport;
    return json;
  }

  /// Returns a new [MissionStatusOccurrenceRow] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MissionStatusOccurrenceRow? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'occurrence_id'), 'Required key "MissionStatusOccurrenceRow[occurrence_id]" is missing from JSON.');
        assert(json[r'occurrence_id'] != null, 'Required key "MissionStatusOccurrenceRow[occurrence_id]" has a null value in JSON.');
        assert(json.containsKey(r'mission_id'), 'Required key "MissionStatusOccurrenceRow[mission_id]" is missing from JSON.');
        assert(json[r'mission_id'] != null, 'Required key "MissionStatusOccurrenceRow[mission_id]" has a null value in JSON.');
        assert(json.containsKey(r'interaction'), 'Required key "MissionStatusOccurrenceRow[interaction]" is missing from JSON.');
        assert(json[r'interaction'] != null, 'Required key "MissionStatusOccurrenceRow[interaction]" has a null value in JSON.');
        assert(json.containsKey(r'parent_report'), 'Required key "MissionStatusOccurrenceRow[parent_report]" is missing from JSON.');
        assert(json[r'parent_report'] != null, 'Required key "MissionStatusOccurrenceRow[parent_report]" has a null value in JSON.');
        return true;
      }());

      return MissionStatusOccurrenceRow(
        occurrenceId: mapValueOfType<String>(json, r'occurrence_id')!,
        missionId: mapValueOfType<String>(json, r'mission_id')!,
        interaction: MissionInteractionFacts.fromJson(json[r'interaction'])!,
        parentReport: MissionParentReportFacts.fromJson(json[r'parent_report'])!,
      );
    }
    return null;
  }

  static List<MissionStatusOccurrenceRow> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MissionStatusOccurrenceRow>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MissionStatusOccurrenceRow.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MissionStatusOccurrenceRow> mapFromJson(dynamic json) {
    final map = <String, MissionStatusOccurrenceRow>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MissionStatusOccurrenceRow.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MissionStatusOccurrenceRow-objects as value to a dart map
  static Map<String, List<MissionStatusOccurrenceRow>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MissionStatusOccurrenceRow>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MissionStatusOccurrenceRow.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'occurrence_id',
    'mission_id',
    'interaction',
    'parent_report',
  };
}

