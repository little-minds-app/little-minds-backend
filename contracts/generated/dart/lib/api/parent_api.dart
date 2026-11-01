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
}
