//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

import 'package:little_minds_api/api.dart';
import 'package:test/test.dart';


/// tests for MissionsApi
void main() {
  // final instance = MissionsApi();

  group('tests for MissionsApi', () {
    // List mission interaction and parent-reported status for an owned child
    //
    // LMP-130 read contract. Merges eligible child-play interaction events (`real_world_mission_offered`, `real_world_mission_opened`) with durable parent-reported assertions. Does not infer physical-world completion. 
    //
    //Future<MissionStatusListResponse> listChildMissionStatus(String childId, { DateTime from, DateTime to, int limit }) async
    test('test listChildMissionStatus', () async {
      // TODO
    });

    // Record caregiver-reported mission status for an owned child occurrence
    //
    // LMP-130 write contract. Parent Gate required. Server sets recorded_at and ignores client-supplied parent identity. Idempotent on idempotency_key. 
    //
    //Future<MissionFeedbackWriteResponse> submitChildMissionFeedback(String childId, String missionId, MissionFeedbackWriteRequest missionFeedbackWriteRequest) async
    test('test submitChildMissionFeedback', () async {
      // TODO
    });

  });
}
