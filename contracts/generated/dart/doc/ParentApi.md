# little_minds_api.api.ParentApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getParentMe**](ParentApi.md#getparentme) | **GET** /v1/parent/me | Authenticated parent identity probe


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

