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


/// tests for HealthApi
void main() {
  // final instance = HealthApi();

  group('tests for HealthApi', () {
    // Process liveness
    //
    // Returns process liveness JSON. Unauthenticated. Does not probe PostgreSQL or other dependencies — use `GET /health/ready` for readiness. 
    //
    //Future<HealthStatus> getHealth() async
    test('test getHealth', () async {
      // TODO
    });

    // Dependency readiness
    //
    // Returns readiness JSON for load balancers and operator alert scrapers. When `DATABASE_URL` is configured, probes PostgreSQL with a lightweight `SELECT 1`. When unset (local Nest without Compose), `checks.database` is `skipped` and status remains `ok`. Failure returns HTTP 503 with `status: not_ready` (alert-ready signal; no paid monitoring required). 
    //
    //Future<ReadinessStatus> getHealthReady() async
    test('test getHealthReady', () async {
      // TODO
    });

  });
}
