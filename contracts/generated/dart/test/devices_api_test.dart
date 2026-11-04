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


/// tests for DevicesApi
void main() {
  // final instance = DevicesApi();

  group('tests for DevicesApi', () {
    // Read the active child bound to a parent-owned device installation
    //
    // LMP-134. The path `installationId` is an untrusted client installation UUID. The server resolves the parent-scoped database `devices.id`, verifies ownership against the bearer session parent, and returns the authoritative `child_id` used for play-event ingest (`devices.child_id`). Returns 404 when the device row is not registered for this parent (sign-in mint registers the row). 
    //
    //Future<DeviceActiveChildBinding> getDeviceActiveChild(String installationId) async
    test('test getDeviceActiveChild', () async {
      // TODO
    });

    // Bind or clear the active child for a parent-owned device installation
    //
    // LMP-134. Atomically updates `devices.child_id` after verifying parent ownership of both the resolved device row and the target child profile. Use `child_id: null` to clear the binding. Clients MUST send `expected_binding_revision` from the latest `GET …/active-child` (or `0` before any bind). Stale revisions return `409`. Concurrent updates serialize on the device row (`FOR UPDATE`) and increment `binding_revision`. 
    //
    //Future<DeviceActiveChildBinding> setDeviceActiveChild(String installationId, SetDeviceActiveChildRequest setDeviceActiveChildRequest) async
    test('test setDeviceActiveChild', () async {
      // TODO
    });

  });
}
