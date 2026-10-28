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


/// tests for AuthApi
void main() {
  // final instance = AuthApi();

  group('tests for AuthApi', () {
    // Local/test session bootstrap (development only)
    //
    // Hard-disabled in staging/production. Requires AUTH_DEV_BOOTSTRAP_ENABLED, allowlisted parent_id (default seed parent), and loopback client. Do not call from staging/production clients. 
    //
    //Future<TokenPairResponse> createDevParentSession(DevSessionRequest devSessionRequest) async
    test('test createDevParentSession', () async {
      // TODO
    });

    // List sessions for the authenticated parent
    //
    //Future<ParentSessionListResponse> listParentSessions() async
    test('test listParentSessions', () async {
      // TODO
    });

    // Revoke all sessions for the authenticated parent
    //
    //Future<LogoutAllResponse> logoutAllParentSessions() async
    test('test logoutAllParentSessions', () async {
      // TODO
    });

    // Revoke the current parent session
    //
    // Requires refresh_token and/or Authorization bearer. Idempotent.
    //
    //Future logoutParentSession({ LogoutRequest logoutRequest }) async
    test('test logoutParentSession', () async {
      // TODO
    });

    // Rotate parent access and refresh tokens
    //
    // Transactional single-winner refresh (ADR-019). Clients must use single-flight refresh and must not retry a consumed refresh token. Lost responses require re-authentication. 
    //
    //Future<TokenPairResponse> refreshParentSession(RefreshTokenRequest refreshTokenRequest) async
    test('test refreshParentSession', () async {
      // TODO
    });

    // Revoke one owned session
    //
    //Future revokeParentSession(String sessionId) async
    test('test revokeParentSession', () async {
      // TODO
    });

    // Start GSM OTP challenge (ADR-020)
    //
    // Unauthenticated. Türkiye (+90) only Day-1. Requires uniform `notice_version` + `notice_locale` (KVKK Option A). Never returns OTP. Anti-enumeration: response shape identical for existing vs new parents. 
    //
    //Future<PhoneOtpStartResponse> startPhoneOtp(PhoneOtpStartRequest phoneOtpStartRequest) async
    test('test startPhoneOtp', () async {
      // TODO
    });

    // Verify GSM OTP and mint parent session (ADR-020)
    //
    // Uniform for existing and new parents (U7 Option A creates parent on first success). No privacy fields on verify — notice bound at start. Returns ADR-019 TokenPairResponse via SessionIssuerService.mintSessionTx. 
    //
    //Future<TokenPairResponse> verifyPhoneOtp(PhoneOtpVerifyRequest phoneOtpVerifyRequest) async
    test('test verifyPhoneOtp', () async {
      // TODO
    });

  });
}
