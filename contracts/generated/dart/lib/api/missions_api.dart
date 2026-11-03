//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class MissionsApi {
  MissionsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// List mission interaction and parent-reported status for an owned child
  ///
  /// LMP-130 read contract. Requires bounded half-open UTC window (`from`, `to`, max 90-day span). Loads all eligible rows inside the window (no silent scan cap); `limit` paginates merged results only. Does not infer physical-world completion. 
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
  Future<Response> listChildMissionStatusWithHttpInfo(String childId, DateTime from, DateTime to, { int? limit, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/children/{childId}/missions'
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

  /// List mission interaction and parent-reported status for an owned child
  ///
  /// LMP-130 read contract. Requires bounded half-open UTC window (`from`, `to`, max 90-day span). Loads all eligible rows inside the window (no silent scan cap); `limit` paginates merged results only. Does not infer physical-world completion. 
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
  Future<MissionStatusListResponse?> listChildMissionStatus(String childId, DateTime from, DateTime to, { int? limit, Future<void>? abortTrigger, }) async {
    final response = await listChildMissionStatusWithHttpInfo(childId, from, to, limit: limit, abortTrigger: abortTrigger,);
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

  /// Record caregiver-reported mission status for an owned child occurrence
  ///
  /// LMP-130 write contract. Parent Gate required. Server sets recorded_at and ignores client-supplied parent identity. Idempotent on idempotency_key. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [String] missionId (required):
  ///
  /// * [MissionFeedbackWriteRequest] missionFeedbackWriteRequest (required):
  Future<Response> submitChildMissionFeedbackWithHttpInfo(String childId, String missionId, MissionFeedbackWriteRequest missionFeedbackWriteRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/children/{childId}/missions/{missionId}/feedback'
      .replaceAll('{childId}', childId)
      .replaceAll('{missionId}', missionId);

    // ignore: prefer_final_locals
    Object? postBody = missionFeedbackWriteRequest;

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

  /// Record caregiver-reported mission status for an owned child occurrence
  ///
  /// LMP-130 write contract. Parent Gate required. Server sets recorded_at and ignores client-supplied parent identity. Idempotent on idempotency_key. 
  ///
  /// Parameters:
  ///
  /// * [String] childId (required):
  ///
  /// * [String] missionId (required):
  ///
  /// * [MissionFeedbackWriteRequest] missionFeedbackWriteRequest (required):
  Future<MissionFeedbackWriteResponse?> submitChildMissionFeedback(String childId, String missionId, MissionFeedbackWriteRequest missionFeedbackWriteRequest, { Future<void>? abortTrigger, }) async {
    final response = await submitChildMissionFeedbackWithHttpInfo(childId, missionId, missionFeedbackWriteRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'MissionFeedbackWriteResponse',) as MissionFeedbackWriteResponse;
    
    }
    return null;
  }
}
