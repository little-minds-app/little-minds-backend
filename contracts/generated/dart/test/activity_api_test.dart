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


/// tests for ActivityApi
void main() {
  // final instance = ActivityApi();

  group('tests for ActivityApi', () {
    // Ingest a bounded batch of authenticated parent-owned activity sessions and events
    //
    // LMP-51 contract only until backend implementation is enabled. Validate all items against canonical ActivitySessionV1 / ActivityEventV1 schemas, derive parent ownership from bearer, check authoritative server consent, and use transactionally global event_id idempotency across actor scopes. Parent-only events MUST omit play_session_id; no fabricated session. 
    //
    //Future<IngestActivityEventBatch200Response> ingestActivityEventBatch(IngestActivityEventBatchRequest ingestActivityEventBatchRequest) async
    test('test ingestActivityEventBatch', () async {
      // TODO
    });

  });
}
