# little_minds_api.api.ActivityApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ingestActivityEventBatch**](ActivityApi.md#ingestactivityeventbatch) | **POST** /v1/events/batch | Ingest a bounded batch of authenticated parent-owned activity sessions and events


# **ingestActivityEventBatch**
> IngestActivityEventBatch200Response ingestActivityEventBatch(ingestActivityEventBatchRequest)

Ingest a bounded batch of authenticated parent-owned activity sessions and events

LMP-51 contract only until backend implementation is enabled. Validate all items against canonical ActivitySessionV1 / ActivityEventV1 schemas, derive parent ownership from bearer, check authoritative server consent, and use transactionally global event_id idempotency across actor scopes. Parent-only events MUST omit play_session_id; no fabricated session. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ActivityApi();
final ingestActivityEventBatchRequest = IngestActivityEventBatchRequest(); // IngestActivityEventBatchRequest | 

try {
    final result = api_instance.ingestActivityEventBatch(ingestActivityEventBatchRequest);
    print(result);
} catch (e) {
    print('Exception when calling ActivityApi->ingestActivityEventBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ingestActivityEventBatchRequest** | [**IngestActivityEventBatchRequest**](IngestActivityEventBatchRequest.md)|  | 

### Return type

[**IngestActivityEventBatch200Response**](IngestActivityEventBatch200Response.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

