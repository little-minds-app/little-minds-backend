//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class ParentApi {
  ParentApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Check a session-bound adult grant
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] xParentGateToken (required):
  Future<Response> checkParentGateGrantWithHttpInfo(String xParentGateToken, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/grant';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    headerParams[r'X-Parent-Gate-Token'] = parameterToString(xParentGateToken);

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

  /// Check a session-bound adult grant
  ///
  /// Parameters:
  ///
  /// * [String] xParentGateToken (required):
  Future<ParentGateAuthorized?> checkParentGateGrant(String xParentGateToken, { Future<void>? abortTrigger, }) async {
    final response = await checkParentGateGrantWithHttpInfo(xParentGateToken, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateAuthorized',) as ParentGateAuthorized;
    
    }
    return null;
  }

  /// Clear all six optional parent profile attributes
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> clearParentProfileWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/profile';

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

  /// Clear all six optional parent profile attributes
  Future<OptionalParentProfile?> clearParentProfile({ Future<void>? abortTrigger, }) async {
    final response = await clearParentProfileWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OptionalParentProfile',) as OptionalParentProfile;
    
    }
    return null;
  }

  /// Clear optional parent profile fields through opaque web session
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> clearWebParentProfileWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/web/profile';

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

  /// Clear optional parent profile fields through opaque web session
  Future<OptionalParentProfile?> clearWebParentProfile({ Future<void>? abortTrigger, }) async {
    final response = await clearWebParentProfileWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OptionalParentProfile',) as OptionalParentProfile;
    
    }
    return null;
  }

  /// Create an approximate-age child profile owned by the authenticated parent
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [CreateChildProfileRequest] createChildProfileRequest (required):
  Future<Response> createChildProfileWithHttpInfo(CreateChildProfileRequest createChildProfileRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/children';

    // ignore: prefer_final_locals
    Object? postBody = createChildProfileRequest;

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

  /// Create an approximate-age child profile owned by the authenticated parent
  ///
  /// Parameters:
  ///
  /// * [CreateChildProfileRequest] createChildProfileRequest (required):
  Future<CreateChildProfile201Response?> createChildProfile(CreateChildProfileRequest createChildProfileRequest, { Future<void>? abortTrigger, }) async {
    final response = await createChildProfileWithHttpInfo(createChildProfileRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'CreateChildProfile201Response',) as CreateChildProfile201Response;
    
    }
    return null;
  }

  /// One-time PIN setup after fresh verified identity proof
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ParentGateSetPinRequest] parentGateSetPinRequest (required):
  Future<Response> createParentGatePinWithHttpInfo(ParentGateSetPinRequest parentGateSetPinRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/setup';

    // ignore: prefer_final_locals
    Object? postBody = parentGateSetPinRequest;

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

  /// One-time PIN setup after fresh verified identity proof
  ///
  /// Parameters:
  ///
  /// * [ParentGateSetPinRequest] parentGateSetPinRequest (required):
  Future<ParentGateStatus?> createParentGatePin(ParentGateSetPinRequest parentGateSetPinRequest, { Future<void>? abortTrigger, }) async {
    final response = await createParentGatePinWithHttpInfo(parentGateSetPinRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateStatus',) as ParentGateStatus;
    
    }
    return null;
  }

  /// Server-side BFF child creation using opaque session
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [CreateWebChildProfileRequest] createWebChildProfileRequest (required):
  Future<Response> createWebChildProfileWithHttpInfo(CreateWebChildProfileRequest createWebChildProfileRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/web/children';

    // ignore: prefer_final_locals
    Object? postBody = createWebChildProfileRequest;

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

  /// Server-side BFF child creation using opaque session
  ///
  /// Parameters:
  ///
  /// * [CreateWebChildProfileRequest] createWebChildProfileRequest (required):
  Future<CreateChildProfile201Response?> createWebChildProfile(CreateWebChildProfileRequest createWebChildProfileRequest, { Future<void>? abortTrigger, }) async {
    final response = await createWebChildProfileWithHttpInfo(createWebChildProfileRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'CreateChildProfile201Response',) as CreateChildProfile201Response;
    
    }
    return null;
  }

  /// Read a non-deleted child profile only when owned by authenticated parent
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  Future<Response> getChildProfileWithHttpInfo(String childId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/children/{childId}'
      .replaceAll('{childId}', childId);

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

  /// Read a non-deleted child profile only when owned by authenticated parent
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  Future<GetChildProfile200Response?> getChildProfile(String childId, { Future<void>? abortTrigger, }) async {
    final response = await getChildProfileWithHttpInfo(childId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'GetChildProfile200Response',) as GetChildProfile200Response;
    
    }
    return null;
  }

  /// Check whether this verified parent has configured a gate PIN
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getParentGateStatusWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/status';

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

  /// Check whether this verified parent has configured a gate PIN
  Future<ParentGateStatus?> getParentGateStatus({ Future<void>? abortTrigger, }) async {
    final response = await getParentGateStatusWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateStatus',) as ParentGateStatus;
    
    }
    return null;
  }

  /// Authenticated parent identity probe
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getParentMeWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/me';

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

  /// Authenticated parent identity probe
  Future<ParentMeResponse?> getParentMe({ Future<void>? abortTrigger, }) async {
    final response = await getParentMeWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentMeResponse',) as ParentMeResponse;
    
    }
    return null;
  }

  /// Read optional parent profile fields without inferring missing values
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getParentProfileWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/profile';

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

  /// Read optional parent profile fields without inferring missing values
  Future<OptionalParentProfile?> getParentProfile({ Future<void>? abortTrigger, }) async {
    final response = await getParentProfileWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OptionalParentProfile',) as OptionalParentProfile;
    
    }
    return null;
  }

  /// Parent profile through server-authorized opaque web session
  ///
  /// BFF-only headers, not a browser-accessible bearer API.
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getWebParentProfileWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/web/profile';

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

  /// Parent profile through server-authorized opaque web session
  ///
  /// BFF-only headers, not a browser-accessible bearer API.
  Future<OptionalParentProfile?> getWebParentProfile({ Future<void>? abortTrigger, }) async {
    final response = await getWebParentProfileWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OptionalParentProfile',) as OptionalParentProfile;
    
    }
    return null;
  }

  /// Server-side BFF session KPI read using opaque parent web session
  ///
  /// LMP-54 passive dashboard read. Same aggregation as GET /v1/insights/session-kpis but authorized via BFF headers (x-lm-bff-secret, x-lm-web-session). Does not extend web session idle timeout on success. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [DateTime] from (required):
  ///   Inclusive UTC window start (session started_at)
  ///
  /// * [DateTime] to (required):
  ///   Exclusive UTC window end (session started_at)
  ///
  /// * [String] timezone (required):
  ///   IANA timezone for distinct play-day boundaries
  ///
  /// * [String] childId:
  ///   Optional child filter; omit for all active children owned by the parent
  Future<Response> getWebSessionKpisWithHttpInfo(DateTime from, DateTime to, String timezone, { String? childId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/web/insights/session-kpis';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'from', from));
      queryParams.addAll(_queryParams('', 'to', to));
      queryParams.addAll(_queryParams('', 'timezone', timezone));
    if (childId != null) {
      queryParams.addAll(_queryParams('', 'child_id', childId));
    }

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

  /// Server-side BFF session KPI read using opaque parent web session
  ///
  /// LMP-54 passive dashboard read. Same aggregation as GET /v1/insights/session-kpis but authorized via BFF headers (x-lm-bff-secret, x-lm-web-session). Does not extend web session idle timeout on success. 
  ///
  /// Parameters:
  ///
  /// * [DateTime] from (required):
  ///   Inclusive UTC window start (session started_at)
  ///
  /// * [DateTime] to (required):
  ///   Exclusive UTC window end (session started_at)
  ///
  /// * [String] timezone (required):
  ///   IANA timezone for distinct play-day boundaries
  ///
  /// * [String] childId:
  ///   Optional child filter; omit for all active children owned by the parent
  Future<SessionKpiResponse?> getWebSessionKpis(DateTime from, DateTime to, String timezone, { String? childId, Future<void>? abortTrigger, }) async {
    final response = await getWebSessionKpisWithHttpInfo(from, to, timezone, childId: childId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'SessionKpiResponse',) as SessionKpiResponse;
    
    }
    return null;
  }

  /// Verify a freshly authenticated linked identity for PIN setup or reset
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ParentGateProofRequest] parentGateProofRequest (required):
  Future<Response> issueParentGateProofWithHttpInfo(ParentGateProofRequest parentGateProofRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/proof';

    // ignore: prefer_final_locals
    Object? postBody = parentGateProofRequest;

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

  /// Verify a freshly authenticated linked identity for PIN setup or reset
  ///
  /// Parameters:
  ///
  /// * [ParentGateProofRequest] parentGateProofRequest (required):
  Future<ParentGateProofResponse?> issueParentGateProof(ParentGateProofRequest parentGateProofRequest, { Future<void>? abortTrigger, }) async {
    final response = await issueParentGateProofWithHttpInfo(parentGateProofRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateProofResponse',) as ParentGateProofResponse;
    
    }
    return null;
  }

  /// List only the authenticated parent's non-deleted child profiles
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> listChildProfilesWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/children';

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

  /// List only the authenticated parent's non-deleted child profiles
  Future<ListChildProfiles200Response?> listChildProfiles({ Future<void>? abortTrigger, }) async {
    final response = await listChildProfilesWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ListChildProfiles200Response',) as ListChildProfiles200Response;
    
    }
    return null;
  }

  /// Server-side BFF mission status list using opaque parent web session
  ///
  /// LMP-54 passive dashboard read. Same contract as GET /v1/children/{childId}/missions but authorized via BFF headers. GET only on web; feedback POST remains mobile/bearer. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [DateTime] from (required):
  ///   Inclusive UTC lower bound for report/interaction timestamps
  ///
  /// * [DateTime] to (required):
  ///   Exclusive UTC upper bound for report/interaction timestamps
  ///
  /// * [int] limit:
  Future<Response> listWebChildMissionStatusWithHttpInfo(String childId, DateTime from, DateTime to, { int? limit, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/web/children/{childId}/missions'
      .replaceAll('{childId}', childId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'from', from));
      queryParams.addAll(_queryParams('', 'to', to));
    if (limit != null) {
      queryParams.addAll(_queryParams('', 'limit', limit));
    }

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

  /// Server-side BFF mission status list using opaque parent web session
  ///
  /// LMP-54 passive dashboard read. Same contract as GET /v1/children/{childId}/missions but authorized via BFF headers. GET only on web; feedback POST remains mobile/bearer. 
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [DateTime] from (required):
  ///   Inclusive UTC lower bound for report/interaction timestamps
  ///
  /// * [DateTime] to (required):
  ///   Exclusive UTC upper bound for report/interaction timestamps
  ///
  /// * [int] limit:
  Future<MissionStatusListResponse?> listWebChildMissionStatus(String childId, DateTime from, DateTime to, { int? limit, Future<void>? abortTrigger, }) async {
    final response = await listWebChildMissionStatusWithHttpInfo(childId, from, to, limit: limit, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'MissionStatusListResponse',) as MissionStatusListResponse;
    
    }
    return null;
  }

  /// Server-side BFF child list using an opaque parent web session
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> listWebChildProfilesWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/web/children';

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

  /// Server-side BFF child list using an opaque parent web session
  Future<ListChildProfiles200Response?> listWebChildProfiles({ Future<void>? abortTrigger, }) async {
    final response = await listWebChildProfilesWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ListChildProfiles200Response',) as ListChildProfiles200Response;
    
    }
    return null;
  }

  /// Revoke all outstanding adult grants for the current parent session
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> lockParentGateWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/grant';

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

  /// Revoke all outstanding adult grants for the current parent session
  Future<ParentGateLocked?> lockParentGate({ Future<void>? abortTrigger, }) async {
    final response = await lockParentGateWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateLocked',) as ParentGateLocked;
    
    }
    return null;
  }

  /// Replace PIN with fresh verified identity proof and revoke all grants
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ParentGateSetPinRequest] parentGateSetPinRequest (required):
  Future<Response> resetParentGatePinWithHttpInfo(ParentGateSetPinRequest parentGateSetPinRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/reset';

    // ignore: prefer_final_locals
    Object? postBody = parentGateSetPinRequest;

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

  /// Replace PIN with fresh verified identity proof and revoke all grants
  ///
  /// Parameters:
  ///
  /// * [ParentGateSetPinRequest] parentGateSetPinRequest (required):
  Future<ParentGateStatus?> resetParentGatePin(ParentGateSetPinRequest parentGateSetPinRequest, { Future<void>? abortTrigger, }) async {
    final response = await resetParentGatePinWithHttpInfo(parentGateSetPinRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateStatus',) as ParentGateStatus;
    
    }
    return null;
  }

  /// Update a child profile owned by the authenticated parent
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [UpdateChildProfileRequest] updateChildProfileRequest (required):
  Future<Response> updateChildProfileWithHttpInfo(String childId, UpdateChildProfileRequest updateChildProfileRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/children/{childId}'
      .replaceAll('{childId}', childId);

    // ignore: prefer_final_locals
    Object? postBody = updateChildProfileRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Update a child profile owned by the authenticated parent
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [UpdateChildProfileRequest] updateChildProfileRequest (required):
  Future<ChildProfileResponse?> updateChildProfile(String childId, UpdateChildProfileRequest updateChildProfileRequest, { Future<void>? abortTrigger, }) async {
    final response = await updateChildProfileWithHttpInfo(childId, updateChildProfileRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ChildProfileResponse',) as ChildProfileResponse;
    
    }
    return null;
  }

  /// Edit supplied optional fields; null removes a stored value
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [UpdateOptionalParentProfile] updateOptionalParentProfile (required):
  Future<Response> updateParentProfileWithHttpInfo(UpdateOptionalParentProfile updateOptionalParentProfile, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/profile';

    // ignore: prefer_final_locals
    Object? postBody = updateOptionalParentProfile;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Edit supplied optional fields; null removes a stored value
  ///
  /// Parameters:
  ///
  /// * [UpdateOptionalParentProfile] updateOptionalParentProfile (required):
  Future<OptionalParentProfile?> updateParentProfile(UpdateOptionalParentProfile updateOptionalParentProfile, { Future<void>? abortTrigger, }) async {
    final response = await updateParentProfileWithHttpInfo(updateOptionalParentProfile, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OptionalParentProfile',) as OptionalParentProfile;
    
    }
    return null;
  }

  /// Server-side BFF child edit using opaque parent web session
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [UpdateWebChildProfileRequest] updateWebChildProfileRequest (required):
  Future<Response> updateWebChildProfileWithHttpInfo(String childId, UpdateWebChildProfileRequest updateWebChildProfileRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/web/children/{childId}'
      .replaceAll('{childId}', childId);

    // ignore: prefer_final_locals
    Object? postBody = updateWebChildProfileRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Server-side BFF child edit using opaque parent web session
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [UpdateWebChildProfileRequest] updateWebChildProfileRequest (required):
  Future<ChildProfileResponse?> updateWebChildProfile(String childId, UpdateWebChildProfileRequest updateWebChildProfileRequest, { Future<void>? abortTrigger, }) async {
    final response = await updateWebChildProfileWithHttpInfo(childId, updateWebChildProfileRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ChildProfileResponse',) as ChildProfileResponse;
    
    }
    return null;
  }

  /// Edit optional parent profile through opaque web session
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [UpdateOptionalParentProfile] updateOptionalParentProfile (required):
  Future<Response> updateWebParentProfileWithHttpInfo(UpdateOptionalParentProfile updateOptionalParentProfile, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/auth/web/profile';

    // ignore: prefer_final_locals
    Object? postBody = updateOptionalParentProfile;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Edit optional parent profile through opaque web session
  ///
  /// Parameters:
  ///
  /// * [UpdateOptionalParentProfile] updateOptionalParentProfile (required):
  Future<OptionalParentProfile?> updateWebParentProfile(UpdateOptionalParentProfile updateOptionalParentProfile, { Future<void>? abortTrigger, }) async {
    final response = await updateWebParentProfileWithHttpInfo(updateOptionalParentProfile, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OptionalParentProfile',) as OptionalParentProfile;
    
    }
    return null;
  }

  /// Issue five-minute session-bound adult authorization after PIN check
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ParentGateVerifyRequest] parentGateVerifyRequest (required):
  Future<Response> verifyParentGatePinWithHttpInfo(ParentGateVerifyRequest parentGateVerifyRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/parent/gate/verify';

    // ignore: prefer_final_locals
    Object? postBody = parentGateVerifyRequest;

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

  /// Issue five-minute session-bound adult authorization after PIN check
  ///
  /// Parameters:
  ///
  /// * [ParentGateVerifyRequest] parentGateVerifyRequest (required):
  Future<ParentGateVerifyResponse?> verifyParentGatePin(ParentGateVerifyRequest parentGateVerifyRequest, { Future<void>? abortTrigger, }) async {
    final response = await verifyParentGatePinWithHttpInfo(parentGateVerifyRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ParentGateVerifyResponse',) as ParentGateVerifyResponse;
    
    }
    return null;
  }
}
