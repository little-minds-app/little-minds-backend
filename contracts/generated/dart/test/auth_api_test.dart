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
    // Apple Sign In with JWKS + mandatory nonce (ADR-021)
    //
    // Verifies Apple ID token via JWKS (asymmetric), issuer/audience/exp/iat/sub, and mandatory single-use server nonce. U7 Option A creates parent on first success via mintSessionTx. Never trusts client-supplied Apple user id/email/name. 
    //
    //Future<TokenPairResponse> authenticateApple(AppleAuthRequest appleAuthRequest) async
    test('test authenticateApple', () async {
      // TODO
    });

    // Google Sign-In nonce or auth-code+PKCE (ADR-021)
    //
    // Prefer ID token + mandatory nonce. Else authorization_code + code_verifier + redirect_uri + **oauth_state** (from `POST /v1/auth/google/pkce/start`) — server atomically consumes the PKCE transaction, exchanges the code, then JWKS-verifies. Never accepts ID-token-without-nonce or unbound auth-code exchange. Fail-closed when Google config / PKCE disabled. 
    //
    //Future<TokenPairResponse> authenticateGoogle(GoogleAuthRequest googleAuthRequest) async
    test('test authenticateGoogle', () async {
      // TODO
    });

    // Local/test session bootstrap (development only)
    //
    // Hard-disabled in staging/production. Requires AUTH_DEV_BOOTSTRAP_ENABLED, allowlisted parent_id (default seed parent), and loopback client. Do not call from staging/production clients. 
    //
    //Future<TokenPairResponse> createDevParentSession(DevSessionRequest devSessionRequest) async
    test('test createDevParentSession', () async {
      // TODO
    });

    // Issue recent-auth step-up token for identity linking (LMP-36)
    //
    // Authenticated parent proves control of an identity **already linked** to their account (Apple/Google/email/phone proof). Server returns a short-lived opaque `step_up_token` bound to parent + session + purpose `identity_link`. Access-token refresh alone is **not** recent auth. Token is single-use; stale/replayed/cross-parent consume fails closed. 
    //
    //Future<StepUpResponse> createIdentityLinkStepUp(StepUpRequest stepUpRequest) async
    test('test createIdentityLinkStepUp', () async {
      // TODO
    });

    // Issue short-lived OIDC nonce (ADR-021)
    //
    // Unauthenticated. Returns a **provider-bound** server-issued nonce for Apple or Google ID-token paths (`provider` required: apple|google). Single-use; TTL 600s. Rate-limited per IP. Cross-provider consume is rejected. 
    //
    //Future<OidcNonceResponse> issueOidcNonce(OidcNonceRequest oidcNonceRequest) async
    test('test issueOidcNonce', () async {
      // TODO
    });

    // Explicitly link a verified provider identity (LMP-36)
    //
    // Authenticated parent links another provider after **server-issued step-up** (`step_up_token` from `POST /v1/auth/identities/step-up`) **and** fresh target-provider proof (Apple/Google ID-token or PKCE, or email/phone OTP). Access-token refresh alone is not recent auth. No silent merge and no email/name/phone inference. On collision returns `409 identity_collision` without disclosing the other family. Unlink/recovery deferred. 
    //
    //Future<LinkIdentityResponse> linkParentIdentity(LinkIdentityRequest linkIdentityRequest) async
    test('test linkParentIdentity', () async {
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

    // Start Email OTP challenge (ADR-021)
    //
    // Unauthenticated. Applies email_norm_v1. Requires notice_version + notice_locale (KVKK Option A). Never returns OTP. deliveryState=sent required before verify. 
    //
    //Future<EmailOtpStartResponse> startEmailOtp(EmailOtpStartRequest emailOtpStartRequest) async
    test('test startEmailOtp', () async {
      // TODO
    });

    // Issue one-time Google PKCE OAuth transaction/state (ADR-021)
    //
    // Unauthenticated. Returns a server-issued opaque `state` bound to allowlisted `client_id`, `redirect_uri`, and PKCE `code_challenge` (S256). Single-use; TTL 600s. Required before `POST /v1/auth/google` authorization-code path (`oauth_state`). Fail-closed when PKCE disabled / Google misconfigured. Rate-limited per IP. 
    //
    //Future<GooglePkceStartResponse> startGooglePkce(GooglePkceStartRequest googlePkceStartRequest) async
    test('test startGooglePkce', () async {
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

    // Verify Email OTP and mint parent session (ADR-021)
    //
    // Gate: status=pending and deliveryState=sent. U7 Option A creates parent on first success. No privacy fields on verify. No silent email link (LMP-36). 
    //
    //Future<TokenPairResponse> verifyEmailOtp(EmailOtpVerifyRequest emailOtpVerifyRequest) async
    test('test verifyEmailOtp', () async {
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
