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


/// tests for PrivacyApi
void main() {
  // final instance = PrivacyApi();

  group('tests for PrivacyApi', () {
    // Read latest-effective server consent for one or more scopes
    //
    // LMP-134 / F-033. Evaluates immutable `consent_records` with trusted `source: server_consent_store` (and ingest-trusted `sync_scope_grant`) using the same latest-effective semantics as activity ingest. Optional `child_id` merges parent-level and child-scoped rows like ingest `checkConsent`. Does not treat privacy-notice acknowledgment, Parent Gate, login, or client wire `decision` as grant. 
    //
    //Future<EffectiveConsentScopesResponse> getEffectiveConsentScopes(List<ConsentScope> scope, { String childId }) async
    test('test getEffectiveConsentScopes', () async {
      // TODO
    });

    // Record an explicit parent opt-in for a consent scope
    //
    // LMP-134. Appends an immutable `consent_records` row with `status: granted` and `source: server_consent_store`. Play telemetry (`essential_play_events`) must use this explicit grant (unchecked client UX) — never auto-granted at login/OTP verify or gameplay start. Align `policy_version` with the published activity policy (Shape Matching UAT uses `synthetic-policy-v1`). 
    //
    //Future<ConsentScopeMutationResponse> grantConsentScope(ConsentScopeMutationRequest consentScopeMutationRequest) async
    test('test grantConsentScope', () async {
      // TODO
    });

    // Record withdrawal of a consent scope (prospective)
    //
    // LMP-134. Appends `status: withdrawn` with `source: server_consent_store`. Future ingest for that scope/policy fails closed; does not rewrite historical events. 
    //
    //Future<ConsentScopeMutationResponse> withdrawConsentScope(ConsentScopeMutationRequest consentScopeMutationRequest) async
    test('test withdrawConsentScope', () async {
      // TODO
    });

  });
}
