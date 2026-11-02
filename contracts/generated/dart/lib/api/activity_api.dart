//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class ActivityApi {
  ActivityApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Ingest a bounded batch of authenticated parent-owned activity sessions and events
  ///
  /// LMP-51 contract only until backend implementation is enabled. Validate all items against canonical ActivitySessionV1 / ActivityEventV1 schemas, derive parent ownership from bearer, check authoritative server consent, and use transactionally global event_id idempotency across actor scopes. Parent-only events MUST omit play_session_id; no fabricated session. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [IngestActivityEventBatchRequest] ingestActivityEventBatchRequest (required):
  Future<Response> ingestActivityEventBatchWithHttpInfo(IngestActivityEventBatchRequest ingestActivityEventBatchRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/events/batch';

    // ignore: prefer_final_locals
    Object? postBody = ingestActivityEventBatchRequest;

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

  /// Ingest a bounded batch of authenticated parent-owned activity sessions and events
  ///
  /// LMP-51 contract only until backend implementation is enabled. Validate all items against canonical ActivitySessionV1 / ActivityEventV1 schemas, derive parent ownership from bearer, check authoritative server consent, and use transactionally global event_id idempotency across actor scopes. Parent-only events MUST omit play_session_id; no fabricated session. 
  ///
  /// Parameters:
  ///
  /// * [IngestActivityEventBatchRequest] ingestActivityEventBatchRequest (required):
  Future<IngestActivityEventBatch200Response?> ingestActivityEventBatch(IngestActivityEventBatchRequest ingestActivityEventBatchRequest, { Future<void>? abortTrigger, }) async {
    final response = await ingestActivityEventBatchWithHttpInfo(ingestActivityEventBatchRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'IngestActivityEventBatch200Response',) as IngestActivityEventBatch200Response;
    
    }
    return null;
  }
}
