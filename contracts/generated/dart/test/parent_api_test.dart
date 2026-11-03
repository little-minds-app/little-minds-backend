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


/// tests for ParentApi
void main() {
  // final instance = ParentApi();

  group('tests for ParentApi', () {
    // Check a session-bound adult grant
    //
    //Future<ParentGateAuthorized> checkParentGateGrant(String xParentGateToken) async
    test('test checkParentGateGrant', () async {
      // TODO
    });

    // Clear all six optional parent profile attributes
    //
    //Future<OptionalParentProfile> clearParentProfile() async
    test('test clearParentProfile', () async {
      // TODO
    });

    // Clear optional parent profile fields through opaque web session
    //
    //Future<OptionalParentProfile> clearWebParentProfile() async
    test('test clearWebParentProfile', () async {
      // TODO
    });

    // Create an approximate-age child profile owned by the authenticated parent
    //
    //Future<CreateChildProfile201Response> createChildProfile(CreateChildProfileRequest createChildProfileRequest) async
    test('test createChildProfile', () async {
      // TODO
    });

    // One-time PIN setup after fresh verified identity proof
    //
    //Future<ParentGateStatus> createParentGatePin(ParentGateSetPinRequest parentGateSetPinRequest) async
    test('test createParentGatePin', () async {
      // TODO
    });

    // Server-side BFF child creation using opaque session
    //
    //Future<CreateChildProfile201Response> createWebChildProfile(CreateWebChildProfileRequest createWebChildProfileRequest) async
    test('test createWebChildProfile', () async {
      // TODO
    });

    // Read a non-deleted child profile only when owned by authenticated parent
    //
    //Future<GetChildProfile200Response> getChildProfile(String childId) async
    test('test getChildProfile', () async {
      // TODO
    });

    // Check whether this verified parent has configured a gate PIN
    //
    //Future<ParentGateStatus> getParentGateStatus() async
    test('test getParentGateStatus', () async {
      // TODO
    });

    // Authenticated parent identity probe
    //
    //Future<ParentMeResponse> getParentMe() async
    test('test getParentMe', () async {
      // TODO
    });

    // Read optional parent profile fields without inferring missing values
    //
    //Future<OptionalParentProfile> getParentProfile() async
    test('test getParentProfile', () async {
      // TODO
    });

    // Parent profile through server-authorized opaque web session
    //
    // BFF-only headers, not a browser-accessible bearer API.
    //
    //Future<OptionalParentProfile> getWebParentProfile() async
    test('test getWebParentProfile', () async {
      // TODO
    });

    // Server-side BFF session KPI read using opaque parent web session
    //
    // LMP-54 passive dashboard read. Same aggregation as GET /v1/insights/session-kpis but authorized via BFF headers (x-lm-bff-secret, x-lm-web-session). Does not extend web session idle timeout on success. 
    //
    //Future<SessionKpiResponse> getWebSessionKpis(DateTime from, DateTime to, String timezone, { String childId }) async
    test('test getWebSessionKpis', () async {
      // TODO
    });

    // Verify a freshly authenticated linked identity for PIN setup or reset
    //
    //Future<ParentGateProofResponse> issueParentGateProof(ParentGateProofRequest parentGateProofRequest) async
    test('test issueParentGateProof', () async {
      // TODO
    });

    // List only the authenticated parent's non-deleted child profiles
    //
    //Future<ListChildProfiles200Response> listChildProfiles() async
    test('test listChildProfiles', () async {
      // TODO
    });

    // Server-side BFF mission status list using opaque parent web session
    //
    // LMP-54 passive dashboard read. Same contract as GET /v1/children/{childId}/missions but authorized via BFF headers. GET only on web; feedback POST remains mobile/bearer. 
    //
    //Future<MissionStatusListResponse> listWebChildMissionStatus(String childId, DateTime from, DateTime to, { int limit }) async
    test('test listWebChildMissionStatus', () async {
      // TODO
    });

    // Server-side BFF child list using an opaque parent web session
    //
    //Future<ListChildProfiles200Response> listWebChildProfiles() async
    test('test listWebChildProfiles', () async {
      // TODO
    });

    // Revoke all outstanding adult grants for the current parent session
    //
    //Future<ParentGateLocked> lockParentGate() async
    test('test lockParentGate', () async {
      // TODO
    });

    // Replace PIN with fresh verified identity proof and revoke all grants
    //
    //Future<ParentGateStatus> resetParentGatePin(ParentGateSetPinRequest parentGateSetPinRequest) async
    test('test resetParentGatePin', () async {
      // TODO
    });

    // Update a child profile owned by the authenticated parent
    //
    //Future<ChildProfileResponse> updateChildProfile(String childId, UpdateChildProfileRequest updateChildProfileRequest) async
    test('test updateChildProfile', () async {
      // TODO
    });

    // Edit supplied optional fields; null removes a stored value
    //
    //Future<OptionalParentProfile> updateParentProfile(UpdateOptionalParentProfile updateOptionalParentProfile) async
    test('test updateParentProfile', () async {
      // TODO
    });

    // Server-side BFF child edit using opaque parent web session
    //
    //Future<ChildProfileResponse> updateWebChildProfile(String childId, UpdateWebChildProfileRequest updateWebChildProfileRequest) async
    test('test updateWebChildProfile', () async {
      // TODO
    });

    // Edit optional parent profile through opaque web session
    //
    //Future<OptionalParentProfile> updateWebParentProfile(UpdateOptionalParentProfile updateOptionalParentProfile) async
    test('test updateWebParentProfile', () async {
      // TODO
    });

    // Issue five-minute session-bound adult authorization after PIN check
    //
    //Future<ParentGateVerifyResponse> verifyParentGatePin(ParentGateVerifyRequest parentGateVerifyRequest) async
    test('test verifyParentGatePin', () async {
      // TODO
    });

  });
}
