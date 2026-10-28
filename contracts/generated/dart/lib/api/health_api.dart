//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class HealthApi {
  HealthApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Process liveness
  ///
  /// Returns process liveness JSON. Unauthenticated. Does not probe PostgreSQL or other dependencies — use `GET /health/ready` for readiness. 
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getHealthWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/health';

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

  /// Process liveness
  ///
  /// Returns process liveness JSON. Unauthenticated. Does not probe PostgreSQL or other dependencies — use `GET /health/ready` for readiness. 
  Future<HealthStatus?> getHealth({ Future<void>? abortTrigger, }) async {
    final response = await getHealthWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'HealthStatus',) as HealthStatus;
    
    }
    return null;
  }

  /// Dependency readiness
  ///
  /// Returns readiness JSON for load balancers and operator alert scrapers. When `DATABASE_URL` is configured, probes PostgreSQL with a lightweight `SELECT 1`. When unset, `checks.database: skipped` is allowed **only** for `APP_ENV=development` (local Nest without Compose). Staging and production missing `DATABASE_URL` return HTTP 503 with `status: not_ready` and `checks.database: down`. Probe failure likewise returns 503 (alert-ready signal; no paid monitoring required). Schema enums are unchanged (`up` | `down` | `skipped`). 
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getHealthReadyWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/health/ready';

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

  /// Dependency readiness
  ///
  /// Returns readiness JSON for load balancers and operator alert scrapers. When `DATABASE_URL` is configured, probes PostgreSQL with a lightweight `SELECT 1`. When unset, `checks.database: skipped` is allowed **only** for `APP_ENV=development` (local Nest without Compose). Staging and production missing `DATABASE_URL` return HTTP 503 with `status: not_ready` and `checks.database: down`. Probe failure likewise returns 503 (alert-ready signal; no paid monitoring required). Schema enums are unchanged (`up` | `down` | `skipped`). 
  Future<ReadinessStatus?> getHealthReady({ Future<void>? abortTrigger, }) async {
    final response = await getHealthReadyWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ReadinessStatus',) as ReadinessStatus;
    
    }
    return null;
  }
}
