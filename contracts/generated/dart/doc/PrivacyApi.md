# little_minds_api.api.PrivacyApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getEffectiveConsentScopes**](PrivacyApi.md#geteffectiveconsentscopes) | **GET** /v1/privacy/consent/effective | Read latest-effective server consent for one or more scopes
[**grantConsentScope**](PrivacyApi.md#grantconsentscope) | **POST** /v1/privacy/consent/grant | Record an explicit parent opt-in for a consent scope
[**withdrawConsentScope**](PrivacyApi.md#withdrawconsentscope) | **POST** /v1/privacy/consent/withdraw | Record withdrawal of a consent scope (prospective)


# **getEffectiveConsentScopes**
> EffectiveConsentScopesResponse getEffectiveConsentScopes(scope, childId)

Read latest-effective server consent for one or more scopes

LMP-134 / F-033. Evaluates immutable `consent_records` with trusted `source: server_consent_store` (and ingest-trusted `sync_scope_grant`) using the same latest-effective semantics as activity ingest. Optional `child_id` merges parent-level and child-scoped rows like ingest `checkConsent`. Does not treat privacy-notice acknowledgment, Parent Gate, login, or client wire `decision` as grant. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PrivacyApi();
final scope = []; // List<ConsentScope> | One or more consent scopes to evaluate (repeat `scope` query keys)
final childId = ; // String | When set, include child-scoped rows for this owned profile

try {
    final result = api_instance.getEffectiveConsentScopes(scope, childId);
    print(result);
} catch (e) {
    print('Exception when calling PrivacyApi->getEffectiveConsentScopes: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **scope** | [**List<ConsentScope>**](ConsentScope.md)| One or more consent scopes to evaluate (repeat `scope` query keys) | [default to const []]
 **childId** | [**String**](.md)| When set, include child-scoped rows for this owned profile | [optional] 

### Return type

[**EffectiveConsentScopesResponse**](EffectiveConsentScopesResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **grantConsentScope**
> ConsentScopeMutationResponse grantConsentScope(consentScopeMutationRequest)

Record an explicit parent opt-in for a consent scope

LMP-134. Appends an immutable `consent_records` row with `status: granted` and `source: server_consent_store`. Play telemetry (`essential_play_events`) must use this explicit grant (unchecked client UX) — never auto-granted at login/OTP verify or gameplay start. Align `policy_version` with the published activity policy (Shape Matching UAT uses `synthetic-policy-v1`). 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PrivacyApi();
final consentScopeMutationRequest = ConsentScopeMutationRequest(); // ConsentScopeMutationRequest | 

try {
    final result = api_instance.grantConsentScope(consentScopeMutationRequest);
    print(result);
} catch (e) {
    print('Exception when calling PrivacyApi->grantConsentScope: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **consentScopeMutationRequest** | [**ConsentScopeMutationRequest**](ConsentScopeMutationRequest.md)|  | 

### Return type

[**ConsentScopeMutationResponse**](ConsentScopeMutationResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **withdrawConsentScope**
> ConsentScopeMutationResponse withdrawConsentScope(consentScopeMutationRequest)

Record withdrawal of a consent scope (prospective)

LMP-134. Appends `status: withdrawn` with `source: server_consent_store`. Future ingest for that scope/policy fails closed; does not rewrite historical events. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = PrivacyApi();
final consentScopeMutationRequest = ConsentScopeMutationRequest(); // ConsentScopeMutationRequest | 

try {
    final result = api_instance.withdrawConsentScope(consentScopeMutationRequest);
    print(result);
} catch (e) {
    print('Exception when calling PrivacyApi->withdrawConsentScope: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **consentScopeMutationRequest** | [**ConsentScopeMutationRequest**](ConsentScopeMutationRequest.md)|  | 

### Return type

[**ConsentScopeMutationResponse**](ConsentScopeMutationResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

