//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class InsightsApi {
  InsightsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Canonical session KPI aggregation for authenticated parent scope
  ///
  /// LMP-52 query-time aggregation over accepted ActivitySessionV1 rows and related activity_completed events. Excludes rejected ingest, unsupported schema versions, and sessions failing current consent re-check. Returns freshness and sample metadata. 
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
  Future<Response> getSessionKpisWithHttpInfo(DateTime from, DateTime to, String timezone, { String? childId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/insights/session-kpis';

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

  /// Canonical session KPI aggregation for authenticated parent scope
  ///
  /// LMP-52 query-time aggregation over accepted ActivitySessionV1 rows and related activity_completed events. Excludes rejected ingest, unsupported schema versions, and sessions failing current consent re-check. Returns freshness and sample metadata. 
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
  Future<SessionKpiResponse?> getSessionKpis(DateTime from, DateTime to, String timezone, { String? childId, Future<void>? abortTrigger, }) async {
    final response = await getSessionKpisWithHttpInfo(from, to, timezone, childId: childId, abortTrigger: abortTrigger,);
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
}
