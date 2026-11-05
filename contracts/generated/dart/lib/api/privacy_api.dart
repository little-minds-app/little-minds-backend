//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class PrivacyApi {
  PrivacyApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Read latest-effective server consent for one or more scopes
  ///
  /// LMP-134 / F-033. Evaluates immutable `consent_records` with trusted `source: server_consent_store` (and ingest-trusted `sync_scope_grant`) using the same latest-effective semantics as activity ingest. Optional `child_id` merges parent-level and child-scoped rows like ingest `checkConsent`. Does not treat privacy-notice acknowledgment, Parent Gate, login, or client wire `decision` as grant. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [List<ConsentScope>] scope (required):
  ///   One or more consent scopes to evaluate (repeat `scope` query keys)
  ///
  /// * [String] childId:
  ///   When set, include child-scoped rows for this owned profile
  Future<Response> getEffectiveConsentScopesWithHttpInfo(List<ConsentScope> scope, { String? childId, Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/privacy/consent/effective';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('multi', 'scope', scope));
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

  /// Read latest-effective server consent for one or more scopes
  ///
  /// LMP-134 / F-033. Evaluates immutable `consent_records` with trusted `source: server_consent_store` (and ingest-trusted `sync_scope_grant`) using the same latest-effective semantics as activity ingest. Optional `child_id` merges parent-level and child-scoped rows like ingest `checkConsent`. Does not treat privacy-notice acknowledgment, Parent Gate, login, or client wire `decision` as grant. 
  ///
  /// Parameters:
  ///
  /// * [List<ConsentScope>] scope (required):
  ///   One or more consent scopes to evaluate (repeat `scope` query keys)
  ///
  /// * [String] childId:
  ///   When set, include child-scoped rows for this owned profile
  Future<EffectiveConsentScopesResponse?> getEffectiveConsentScopes(List<ConsentScope> scope, { String? childId, Future<void>? abortTrigger, }) async {
    final response = await getEffectiveConsentScopesWithHttpInfo(scope, childId: childId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'EffectiveConsentScopesResponse',) as EffectiveConsentScopesResponse;
    
    }
    return null;
  }

  /// Record an explicit parent opt-in for a consent scope
  ///
  /// LMP-134. Appends an immutable `consent_records` row with `status: granted` and `source: server_consent_store`. Play telemetry (`essential_play_events`) must use this explicit grant (unchecked client UX) — never auto-granted at login/OTP verify or gameplay start. Align `policy_version` with the published activity policy (Shape Matching UAT uses `synthetic-policy-v1`). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ConsentScopeMutationRequest] consentScopeMutationRequest (required):
  Future<Response> grantConsentScopeWithHttpInfo(ConsentScopeMutationRequest consentScopeMutationRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/privacy/consent/grant';

    // ignore: prefer_final_locals
    Object? postBody = consentScopeMutationRequest;

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

  /// Record an explicit parent opt-in for a consent scope
  ///
  /// LMP-134. Appends an immutable `consent_records` row with `status: granted` and `source: server_consent_store`. Play telemetry (`essential_play_events`) must use this explicit grant (unchecked client UX) — never auto-granted at login/OTP verify or gameplay start. Align `policy_version` with the published activity policy (Shape Matching UAT uses `synthetic-policy-v1`). 
  ///
  /// Parameters:
  ///
  /// * [ConsentScopeMutationRequest] consentScopeMutationRequest (required):
  Future<ConsentScopeMutationResponse?> grantConsentScope(ConsentScopeMutationRequest consentScopeMutationRequest, { Future<void>? abortTrigger, }) async {
    final response = await grantConsentScopeWithHttpInfo(consentScopeMutationRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ConsentScopeMutationResponse',) as ConsentScopeMutationResponse;
    
    }
    return null;
  }

  /// Record withdrawal of a consent scope (prospective)
  ///
  /// LMP-134. Appends `status: withdrawn` with `source: server_consent_store`. Future ingest for that scope/policy fails closed; does not rewrite historical events. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ConsentScopeMutationRequest] consentScopeMutationRequest (required):
  Future<Response> withdrawConsentScopeWithHttpInfo(ConsentScopeMutationRequest consentScopeMutationRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/privacy/consent/withdraw';

    // ignore: prefer_final_locals
    Object? postBody = consentScopeMutationRequest;

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

  /// Record withdrawal of a consent scope (prospective)
  ///
  /// LMP-134. Appends `status: withdrawn` with `source: server_consent_store`. Future ingest for that scope/policy fails closed; does not rewrite historical events. 
  ///
  /// Parameters:
  ///
  /// * [ConsentScopeMutationRequest] consentScopeMutationRequest (required):
  Future<ConsentScopeMutationResponse?> withdrawConsentScope(ConsentScopeMutationRequest consentScopeMutationRequest, { Future<void>? abortTrigger, }) async {
    final response = await withdrawConsentScopeWithHttpInfo(consentScopeMutationRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ConsentScopeMutationResponse',) as ConsentScopeMutationResponse;
    
    }
    return null;
  }
}
