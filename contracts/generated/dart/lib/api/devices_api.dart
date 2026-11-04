//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class DevicesApi {
  DevicesApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Read the active child bound to a parent-owned device installation
  ///
  /// LMP-134. The path `installationId` is an untrusted client installation UUID. The server resolves the parent-scoped database `devices.id`, verifies ownership against the bearer session parent, and returns the authoritative `child_id` used for play-event ingest (`devices.child_id`). Returns 404 when the device row is not registered for this parent (sign-in mint registers the row). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] installationId (required):
  ///   Client installation UUID hint (not an authorization credential)
  Future<Response> getDeviceActiveChildWithHttpInfo(String installationId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/devices/{installationId}/active-child'
      .replaceAll('{installationId}', installationId);

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

  /// Read the active child bound to a parent-owned device installation
  ///
  /// LMP-134. The path `installationId` is an untrusted client installation UUID. The server resolves the parent-scoped database `devices.id`, verifies ownership against the bearer session parent, and returns the authoritative `child_id` used for play-event ingest (`devices.child_id`). Returns 404 when the device row is not registered for this parent (sign-in mint registers the row). 
  ///
  /// Parameters:
  ///
  /// * [String] installationId (required):
  ///   Client installation UUID hint (not an authorization credential)
  Future<DeviceActiveChildBinding?> getDeviceActiveChild(String installationId, { Future<void>? abortTrigger, }) async {
    final response = await getDeviceActiveChildWithHttpInfo(installationId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'DeviceActiveChildBinding',) as DeviceActiveChildBinding;
    
    }
    return null;
  }

  /// Bind or clear the active child for a parent-owned device installation
  ///
  /// LMP-134. Atomically updates `devices.child_id` after verifying parent ownership of both the resolved device row and the target child profile. Use `child_id: null` to clear the binding. Clients MUST send `expected_binding_revision` from the latest `GET …/active-child` (or `0` before any bind). Stale revisions return `409`. Concurrent updates serialize on the device row (`FOR UPDATE`) and increment `binding_revision`. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] installationId (required):
  ///
  /// * [SetDeviceActiveChildRequest] setDeviceActiveChildRequest (required):
  Future<Response> setDeviceActiveChildWithHttpInfo(String installationId, SetDeviceActiveChildRequest setDeviceActiveChildRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/devices/{installationId}/active-child'
      .replaceAll('{installationId}', installationId);

    // ignore: prefer_final_locals
    Object? postBody = setDeviceActiveChildRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PUT',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Bind or clear the active child for a parent-owned device installation
  ///
  /// LMP-134. Atomically updates `devices.child_id` after verifying parent ownership of both the resolved device row and the target child profile. Use `child_id: null` to clear the binding. Clients MUST send `expected_binding_revision` from the latest `GET …/active-child` (or `0` before any bind). Stale revisions return `409`. Concurrent updates serialize on the device row (`FOR UPDATE`) and increment `binding_revision`. 
  ///
  /// Parameters:
  ///
  /// * [String] installationId (required):
  ///
  /// * [SetDeviceActiveChildRequest] setDeviceActiveChildRequest (required):
  Future<DeviceActiveChildBinding?> setDeviceActiveChild(String installationId, SetDeviceActiveChildRequest setDeviceActiveChildRequest, { Future<void>? abortTrigger, }) async {
    final response = await setDeviceActiveChildWithHttpInfo(installationId, setDeviceActiveChildRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'DeviceActiveChildBinding',) as DeviceActiveChildBinding;
    
    }
    return null;
  }
}
