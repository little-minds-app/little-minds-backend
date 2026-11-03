# little_minds_api.api.MissionsApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**listChildMissionStatus**](MissionsApi.md#listchildmissionstatus) | **GET** /v1/children/{childId}/missions | List mission interaction and parent-reported status for an owned child
[**submitChildMissionFeedback**](MissionsApi.md#submitchildmissionfeedback) | **POST** /v1/children/{childId}/missions/{missionId}/feedback | Record caregiver-reported mission status for an owned child occurrence


# **listChildMissionStatus**
> MissionStatusListResponse listChildMissionStatus(childId, from, to, limit)

List mission interaction and parent-reported status for an owned child

LMP-130 read contract. Requires bounded half-open UTC window (`from`, `to`, max 90-day span). Loads all eligible rows inside the window (no silent scan cap); `limit` paginates merged results only. Does not infer physical-world completion. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = MissionsApi();
final childId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final from = 2013-10-20T19:20:30+01:00; // DateTime | Inclusive UTC lower bound for report/interaction timestamps
final to = 2013-10-20T19:20:30+01:00; // DateTime | Exclusive UTC upper bound for report/interaction timestamps
final limit = 56; // int | 

try {
    final result = api_instance.listChildMissionStatus(childId, from, to, limit);
    print(result);
} catch (e) {
    print('Exception when calling MissionsApi->listChildMissionStatus: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **childId** | **String**|  | 
 **from** | **DateTime**| Inclusive UTC lower bound for report/interaction timestamps | 
 **to** | **DateTime**| Exclusive UTC upper bound for report/interaction timestamps | 
 **limit** | **int**|  | [optional] [default to 50]

### Return type

[**MissionStatusListResponse**](MissionStatusListResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitChildMissionFeedback**
> MissionFeedbackWriteResponse submitChildMissionFeedback(childId, missionId, missionFeedbackWriteRequest)

Record caregiver-reported mission status for an owned child occurrence

LMP-130 write contract. Parent Gate required. Server sets recorded_at and ignores client-supplied parent identity. Idempotent on idempotency_key. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = MissionsApi();
final childId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final missionId = missionId_example; // String | 
final missionFeedbackWriteRequest = MissionFeedbackWriteRequest(); // MissionFeedbackWriteRequest | 

try {
    final result = api_instance.submitChildMissionFeedback(childId, missionId, missionFeedbackWriteRequest);
    print(result);
} catch (e) {
    print('Exception when calling MissionsApi->submitChildMissionFeedback: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **childId** | **String**|  | 
 **missionId** | **String**|  | 
 **missionFeedbackWriteRequest** | [**MissionFeedbackWriteRequest**](MissionFeedbackWriteRequest.md)|  | 

### Return type

[**MissionFeedbackWriteResponse**](MissionFeedbackWriteResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

