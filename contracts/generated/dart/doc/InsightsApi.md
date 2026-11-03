# little_minds_api.api.InsightsApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSessionKpis**](InsightsApi.md#getsessionkpis) | **GET** /v1/insights/session-kpis | Canonical session KPI aggregation for authenticated parent scope


# **getSessionKpis**
> SessionKpiResponse getSessionKpis(from, to, timezone, childId)

Canonical session KPI aggregation for authenticated parent scope

LMP-52 query-time aggregation over accepted ActivitySessionV1 rows and related activity_completed events. Excludes rejected ingest, unsupported schema versions, and sessions failing current consent re-check. Returns freshness and sample metadata. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = InsightsApi();
final from = 2013-10-20T19:20:30+01:00; // DateTime | Inclusive UTC window start (session started_at)
final to = 2013-10-20T19:20:30+01:00; // DateTime | Exclusive UTC window end (session started_at)
final timezone = timezone_example; // String | IANA timezone for distinct play-day boundaries
final childId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Optional child filter; omit for all active children owned by the parent

try {
    final result = api_instance.getSessionKpis(from, to, timezone, childId);
    print(result);
} catch (e) {
    print('Exception when calling InsightsApi->getSessionKpis: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **from** | **DateTime**| Inclusive UTC window start (session started_at) | 
 **to** | **DateTime**| Exclusive UTC window end (session started_at) | 
 **timezone** | **String**| IANA timezone for distinct play-day boundaries | 
 **childId** | **String**| Optional child filter; omit for all active children owned by the parent | [optional] 

### Return type

[**SessionKpiResponse**](SessionKpiResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

