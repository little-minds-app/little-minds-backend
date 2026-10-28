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
}
