# little_minds_api.api.ParentApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createChildProfile**](ParentApi.md#createchildprofile) | **POST** /v1/children | Create an approximate-age child profile owned by the authenticated parent
[**getChildProfile**](ParentApi.md#getchildprofile) | **GET** /v1/children/{childId} | Read a non-deleted child profile only when owned by authenticated parent
[**getParentMe**](ParentApi.md#getparentme) | **GET** /v1/parent/me | Authenticated parent identity probe


# **createChildProfile**
> CreateChildProfile201Response createChildProfile(createChildProfileRequest)

Create an approximate-age child profile owned by the authenticated parent

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ParentApi();
final createChildProfileRequest = CreateChildProfileRequest(); // CreateChildProfileRequest | 

try {
    final result = api_instance.createChildProfile(createChildProfileRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->createChildProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createChildProfileRequest** | [**CreateChildProfileRequest**](CreateChildProfileRequest.md)|  | 

### Return type

[**CreateChildProfile201Response**](CreateChildProfile201Response.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getChildProfile**
> GetChildProfile200Response getChildProfile(childId)

Read a non-deleted child profile only when owned by authenticated parent

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ParentApi();
final childId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final result = api_instance.getChildProfile(childId);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->getChildProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **childId** | **String**|  | 

### Return type

[**GetChildProfile200Response**](GetChildProfile200Response.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getParentMe**
> ParentMeResponse getParentMe()

Authenticated parent identity probe

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = ParentApi();

try {
    final result = api_instance.getParentMe();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->getParentMe: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ParentMeResponse**](ParentMeResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

