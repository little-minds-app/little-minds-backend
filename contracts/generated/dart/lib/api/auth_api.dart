//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AuthApi {
  AuthApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Apple Sign In with JWKS + mandatory nonce (ADR-021)
  ///
  /// Verifies Apple ID token via JWKS (asymmetric), issuer/audience/exp/iat/sub, and mandatory single-use server nonce. U7 Option A creates parent on first success via mintSessionTx. Never trusts client-supplied Apple user id/email/name. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [AppleAuthRequest] appleAuthRequest (required):
  Future<Response> authenticateAppleWithHttpInfo(AppleAuthRequest appleAuthRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/apple';

    // ignore: prefer_final_locals
    Object? postBody = appleAuthRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Apple Sign In with JWKS + mandatory nonce (ADR-021)
  ///
  /// Verifies Apple ID token via JWKS (asymmetric), issuer/audience/exp/iat/sub, and mandatory single-use server nonce. U7 Option A creates parent on first success via mintSessionTx. Never trusts client-supplied Apple user id/email/name. 
  ///
  /// Parameters:
  ///
  /// * [AppleAuthRequest] appleAuthRequest (required):
  Future<TokenPairResponse?> authenticateApple(AppleAuthRequest appleAuthRequest, { Future<void>? abortTrigger, }) async {
    final response = await authenticateAppleWithHttpInfo(appleAuthRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'TokenPairResponse',) as TokenPairResponse;
    
    }
    return null;
  }

  /// Google Sign-In nonce or auth-code+PKCE (ADR-021)
  ///
  /// Prefer ID token + mandatory nonce. Else authorization_code + code_verifier + redirect_uri + **oauth_state** (from `POST /v1/auth/google/pkce/start`) — server atomically consumes the PKCE transaction, exchanges the code, then JWKS-verifies. Never accepts ID-token-without-nonce or unbound auth-code exchange. Fail-closed when Google config / PKCE disabled. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [GoogleAuthRequest] googleAuthRequest (required):
  Future<Response> authenticateGoogleWithHttpInfo(GoogleAuthRequest googleAuthRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/google';

    // ignore: prefer_final_locals
    Object? postBody = googleAuthRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Google Sign-In nonce or auth-code+PKCE (ADR-021)
  ///
  /// Prefer ID token + mandatory nonce. Else authorization_code + code_verifier + redirect_uri + **oauth_state** (from `POST /v1/auth/google/pkce/start`) — server atomically consumes the PKCE transaction, exchanges the code, then JWKS-verifies. Never accepts ID-token-without-nonce or unbound auth-code exchange. Fail-closed when Google config / PKCE disabled. 
  ///
  /// Parameters:
  ///
  /// * [GoogleAuthRequest] googleAuthRequest (required):
  Future<TokenPairResponse?> authenticateGoogle(GoogleAuthRequest googleAuthRequest, { Future<void>? abortTrigger, }) async {
    final response = await authenticateGoogleWithHttpInfo(googleAuthRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'TokenPairResponse',) as TokenPairResponse;
    
    }
    return null;
  }

  /// Local/test session bootstrap (development only)
  ///
  /// Hard-disabled in staging/production. Requires AUTH_DEV_BOOTSTRAP_ENABLED, allowlisted parent_id (default seed parent), and loopback client. Do not call from staging/production clients. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [DevSessionRequest] devSessionRequest (required):
  Future<Response> createDevParentSessionWithHttpInfo(DevSessionRequest devSessionRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/dev/session';

    // ignore: prefer_final_locals
    Object? postBody = devSessionRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Local/test session bootstrap (development only)
  ///
  /// Hard-disabled in staging/production. Requires AUTH_DEV_BOOTSTRAP_ENABLED, allowlisted parent_id (default seed parent), and loopback client. Do not call from staging/production clients. 
  ///
  /// Parameters:
  ///
  /// * [DevSessionRequest] devSessionRequest (required):
  Future<TokenPairResponse?> createDevParentSession(DevSessionRequest devSessionRequest, { Future<void>? abortTrigger, }) async {
    final response = await createDevParentSessionWithHttpInfo(devSessionRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'TokenPairResponse',) as TokenPairResponse;
    
    }
    return null;
  }

  /// Issue recent-auth step-up token for identity linking (LMP-36)
  ///
  /// Authenticated parent proves control of an identity **already linked** to their account (Apple/Google/email/phone proof). Server returns a short-lived opaque `step_up_token` bound to parent + session + purpose `identity_link`. Access-token refresh alone is **not** recent auth. Token is single-use; stale/replayed/cross-parent consume fails closed. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [StepUpRequest] stepUpRequest (required):
  Future<Response> createIdentityLinkStepUpWithHttpInfo(StepUpRequest stepUpRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/identities/step-up';

    // ignore: prefer_final_locals
    Object? postBody = stepUpRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Issue recent-auth step-up token for identity linking (LMP-36)
  ///
  /// Authenticated parent proves control of an identity **already linked** to their account (Apple/Google/email/phone proof). Server returns a short-lived opaque `step_up_token` bound to parent + session + purpose `identity_link`. Access-token refresh alone is **not** recent auth. Token is single-use; stale/replayed/cross-parent consume fails closed. 
  ///
  /// Parameters:
  ///
  /// * [StepUpRequest] stepUpRequest (required):
  Future<StepUpResponse?> createIdentityLinkStepUp(StepUpRequest stepUpRequest, { Future<void>? abortTrigger, }) async {
    final response = await createIdentityLinkStepUpWithHttpInfo(stepUpRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'StepUpResponse',) as StepUpResponse;
    
    }
    return null;
  }

  /// Issue short-lived OIDC nonce (ADR-021)
  ///
  /// Unauthenticated. Returns a **provider-bound** server-issued nonce for Apple or Google ID-token paths (`provider` required: apple|google). Single-use; TTL 600s. Rate-limited per IP. Cross-provider consume is rejected. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [OidcNonceRequest] oidcNonceRequest (required):
  Future<Response> issueOidcNonceWithHttpInfo(OidcNonceRequest oidcNonceRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/oidc/nonce';

    // ignore: prefer_final_locals
    Object? postBody = oidcNonceRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Issue short-lived OIDC nonce (ADR-021)
  ///
  /// Unauthenticated. Returns a **provider-bound** server-issued nonce for Apple or Google ID-token paths (`provider` required: apple|google). Single-use; TTL 600s. Rate-limited per IP. Cross-provider consume is rejected. 
  ///
  /// Parameters:
  ///
  /// * [OidcNonceRequest] oidcNonceRequest (required):
  Future<OidcNonceResponse?> issueOidcNonce(OidcNonceRequest oidcNonceRequest, { Future<void>? abortTrigger, }) async {
    final response = await issueOidcNonceWithHttpInfo(oidcNonceRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OidcNonceResponse',) as OidcNonceResponse;
    
    }
    return null;
  }

  /// Explicitly link a verified provider identity (LMP-36)
  ///
  /// Authenticated parent links another provider after **server-issued step-up** (`step_up_token` from `POST /v1/auth/identities/step-up`) **and** fresh target-provider proof (Apple/Google ID-token or PKCE, or email/phone OTP). Access-token refresh alone is not recent auth. No silent merge and no email/name/phone inference. On collision returns `409 identity_collision` without disclosing the other family. Unlink/recovery deferred. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [LinkIdentityRequest] linkIdentityRequest (required):
  Future<Response> linkParentIdentityWithHttpInfo(LinkIdentityRequest linkIdentityRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/identities/link';

    // ignore: prefer_final_locals
    Object? postBody = linkIdentityRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Explicitly link a verified provider identity (LMP-36)
  ///
  /// Authenticated parent links another provider after **server-issued step-up** (`step_up_token` from `POST /v1/auth/identities/step-up`) **and** fresh target-provider proof (Apple/Google ID-token or PKCE, or email/phone OTP). Access-token refresh alone is not recent auth. No silent merge and no email/name/phone inference. On collision returns `409 identity_collision` without disclosing the other family. Unlink/recovery deferred. 
  ///
  /// Parameters:
  ///
  /// * [LinkIdentityRequest] linkIdentityRequest (required):
  Future<LinkIdentityResponse?> linkParentIdentity(LinkIdentityRequest linkIdentityRequest, { Future<void>? abortTrigger, }) async {
    final response = await linkParentIdentityWithHttpInfo(linkIdentityRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'LinkIdentityResponse',) as LinkIdentityResponse;
    
    }
    return null;
  }

  /// List sessions for the authenticated parent
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> listParentSessionsWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/sessions';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// List sessions for the authenticated parent
  Future<ParentSessionListResponse?> listParentSessions({ Future<void>? abortTrigger, }) async {
    final response = await listParentSessionsWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentSessionListResponse',) as ParentSessionListResponse;
    
    }
    return null;
  }

  /// Revoke all sessions for the authenticated parent
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> logoutAllParentSessionsWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/logout-all';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Revoke all sessions for the authenticated parent
  Future<LogoutAllResponse?> logoutAllParentSessions({ Future<void>? abortTrigger, }) async {
    final response = await logoutAllParentSessionsWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'LogoutAllResponse',) as LogoutAllResponse;
    
    }
    return null;
  }

  /// Revoke the current parent session
  ///
  /// Requires refresh_token and/or Authorization bearer. Idempotent.
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [LogoutRequest] logoutRequest:
  Future<Response> logoutParentSessionWithHttpInfo({ LogoutRequest? logoutRequest, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/logout';

    // ignore: prefer_final_locals
    Object? postBody = logoutRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Revoke the current parent session
  ///
  /// Requires refresh_token and/or Authorization bearer. Idempotent.
  ///
  /// Parameters:
  ///
  /// * [LogoutRequest] logoutRequest:
  Future<void> logoutParentSession({ LogoutRequest? logoutRequest, Future<void>? abortTrigger, }) async {
    final response = await logoutParentSessionWithHttpInfo(logoutRequest: logoutRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Rotate parent access and refresh tokens
  ///
  /// Transactional single-winner refresh (ADR-019). Clients must use single-flight refresh and must not retry a consumed refresh token. Lost responses require re-authentication. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RefreshTokenRequest] refreshTokenRequest (required):
  Future<Response> refreshParentSessionWithHttpInfo(RefreshTokenRequest refreshTokenRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/token/refresh';

    // ignore: prefer_final_locals
    Object? postBody = refreshTokenRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Rotate parent access and refresh tokens
  ///
  /// Transactional single-winner refresh (ADR-019). Clients must use single-flight refresh and must not retry a consumed refresh token. Lost responses require re-authentication. 
  ///
  /// Parameters:
  ///
  /// * [RefreshTokenRequest] refreshTokenRequest (required):
  Future<TokenPairResponse?> refreshParentSession(RefreshTokenRequest refreshTokenRequest, { Future<void>? abortTrigger, }) async {
    final response = await refreshParentSessionWithHttpInfo(refreshTokenRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'TokenPairResponse',) as TokenPairResponse;
    
    }
    return null;
  }

  /// Revoke one owned session
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] sessionId (required):
  Future<Response> revokeParentSessionWithHttpInfo(String sessionId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/sessions/{sessionId}'
      .replaceAll('{sessionId}', sessionId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Revoke one owned session
  ///
  /// Parameters:
  ///
  /// * [String] sessionId (required):
  Future<void> revokeParentSession(String sessionId, { Future<void>? abortTrigger, }) async {
    final response = await revokeParentSessionWithHttpInfo(sessionId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Start Email OTP challenge (ADR-021)
  ///
  /// Unauthenticated. Applies email_norm_v1. Requires notice_version + notice_locale (KVKK Option A). Never returns OTP. deliveryState=sent required before verify. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [EmailOtpStartRequest] emailOtpStartRequest (required):
  Future<Response> startEmailOtpWithHttpInfo(EmailOtpStartRequest emailOtpStartRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/email/start';

    // ignore: prefer_final_locals
    Object? postBody = emailOtpStartRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Start Email OTP challenge (ADR-021)
  ///
  /// Unauthenticated. Applies email_norm_v1. Requires notice_version + notice_locale (KVKK Option A). Never returns OTP. deliveryState=sent required before verify. 
  ///
  /// Parameters:
  ///
  /// * [EmailOtpStartRequest] emailOtpStartRequest (required):
  Future<EmailOtpStartResponse?> startEmailOtp(EmailOtpStartRequest emailOtpStartRequest, { Future<void>? abortTrigger, }) async {
    final response = await startEmailOtpWithHttpInfo(emailOtpStartRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'EmailOtpStartResponse',) as EmailOtpStartResponse;
    
    }
    return null;
  }

  /// Issue one-time Google PKCE OAuth transaction/state (ADR-021)
  ///
  /// Unauthenticated. Returns a server-issued opaque `state` bound to allowlisted `client_id`, `redirect_uri`, and PKCE `code_challenge` (S256). Single-use; TTL 600s. Required before `POST /v1/auth/google` authorization-code path (`oauth_state`). Fail-closed when PKCE disabled / Google misconfigured. Rate-limited per IP. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [GooglePkceStartRequest] googlePkceStartRequest (required):
  Future<Response> startGooglePkceWithHttpInfo(GooglePkceStartRequest googlePkceStartRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/google/pkce/start';

    // ignore: prefer_final_locals
    Object? postBody = googlePkceStartRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Issue one-time Google PKCE OAuth transaction/state (ADR-021)
  ///
  /// Unauthenticated. Returns a server-issued opaque `state` bound to allowlisted `client_id`, `redirect_uri`, and PKCE `code_challenge` (S256). Single-use; TTL 600s. Required before `POST /v1/auth/google` authorization-code path (`oauth_state`). Fail-closed when PKCE disabled / Google misconfigured. Rate-limited per IP. 
  ///
  /// Parameters:
  ///
  /// * [GooglePkceStartRequest] googlePkceStartRequest (required):
  Future<GooglePkceStartResponse?> startGooglePkce(GooglePkceStartRequest googlePkceStartRequest, { Future<void>? abortTrigger, }) async {
    final response = await startGooglePkceWithHttpInfo(googlePkceStartRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'GooglePkceStartResponse',) as GooglePkceStartResponse;
    
    }
    return null;
  }

  /// Start GSM OTP challenge (ADR-020)
  ///
  /// Unauthenticated. Türkiye (+90) only Day-1. Requires uniform `notice_version` + `notice_locale` (KVKK Option A). Never returns OTP. Anti-enumeration: response shape identical for existing vs new parents. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [PhoneOtpStartRequest] phoneOtpStartRequest (required):
  Future<Response> startPhoneOtpWithHttpInfo(PhoneOtpStartRequest phoneOtpStartRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/phone/start';

    // ignore: prefer_final_locals
    Object? postBody = phoneOtpStartRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Start GSM OTP challenge (ADR-020)
  ///
  /// Unauthenticated. Türkiye (+90) only Day-1. Requires uniform `notice_version` + `notice_locale` (KVKK Option A). Never returns OTP. Anti-enumeration: response shape identical for existing vs new parents. 
  ///
  /// Parameters:
  ///
  /// * [PhoneOtpStartRequest] phoneOtpStartRequest (required):
  Future<PhoneOtpStartResponse?> startPhoneOtp(PhoneOtpStartRequest phoneOtpStartRequest, { Future<void>? abortTrigger, }) async {
    final response = await startPhoneOtpWithHttpInfo(phoneOtpStartRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'PhoneOtpStartResponse',) as PhoneOtpStartResponse;
    
    }
    return null;
  }

  /// Verify Email OTP and mint parent session (ADR-021)
  ///
  /// Gate: status=pending and deliveryState=sent. U7 Option A creates parent on first success. No privacy fields on verify. No silent email link (LMP-36). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [EmailOtpVerifyRequest] emailOtpVerifyRequest (required):
  Future<Response> verifyEmailOtpWithHttpInfo(EmailOtpVerifyRequest emailOtpVerifyRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/email/verify';

    // ignore: prefer_final_locals
    Object? postBody = emailOtpVerifyRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Verify Email OTP and mint parent session (ADR-021)
  ///
  /// Gate: status=pending and deliveryState=sent. U7 Option A creates parent on first success. No privacy fields on verify. No silent email link (LMP-36). 
  ///
  /// Parameters:
  ///
  /// * [EmailOtpVerifyRequest] emailOtpVerifyRequest (required):
  Future<TokenPairResponse?> verifyEmailOtp(EmailOtpVerifyRequest emailOtpVerifyRequest, { Future<void>? abortTrigger, }) async {
    final response = await verifyEmailOtpWithHttpInfo(emailOtpVerifyRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'TokenPairResponse',) as TokenPairResponse;
    
    }
    return null;
  }

  /// Verify GSM OTP and mint parent session (ADR-020)
  ///
  /// Uniform for existing and new parents (U7 Option A creates parent on first success). No privacy fields on verify — notice bound at start. Returns ADR-019 TokenPairResponse via SessionIssuerService.mintSessionTx. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [PhoneOtpVerifyRequest] phoneOtpVerifyRequest (required):
  Future<Response> verifyPhoneOtpWithHttpInfo(PhoneOtpVerifyRequest phoneOtpVerifyRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/phone/verify';

    // ignore: prefer_final_locals
    Object? postBody = phoneOtpVerifyRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Verify GSM OTP and mint parent session (ADR-020)
  ///
  /// Uniform for existing and new parents (U7 Option A creates parent on first success). No privacy fields on verify — notice bound at start. Returns ADR-019 TokenPairResponse via SessionIssuerService.mintSessionTx. 
  ///
  /// Parameters:
  ///
  /// * [PhoneOtpVerifyRequest] phoneOtpVerifyRequest (required):
  Future<TokenPairResponse?> verifyPhoneOtp(PhoneOtpVerifyRequest phoneOtpVerifyRequest, { Future<void>? abortTrigger, }) async {
    final response = await verifyPhoneOtpWithHttpInfo(phoneOtpVerifyRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'TokenPairResponse',) as TokenPairResponse;
    
    }
    return null;
  }
}
