# little_minds_api.api.DevicesApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getDeviceActiveChild**](DevicesApi.md#getdeviceactivechild) | **GET** /v1/devices/{installationId}/active-child | Read the active child bound to a parent-owned device installation
[**setDeviceActiveChild**](DevicesApi.md#setdeviceactivechild) | **PUT** /v1/devices/{installationId}/active-child | Bind or clear the active child for a parent-owned device installation


# **getDeviceActiveChild**
> DeviceActiveChildBinding getDeviceActiveChild(installationId)

Read the active child bound to a parent-owned device installation

LMP-134. The path `installationId` is an untrusted client installation UUID. The server resolves the parent-scoped database `devices.id`, verifies ownership against the bearer session parent, and returns the authoritative `child_id` used for play-event ingest (`devices.child_id`). Returns 404 when the device row is not registered for this parent (sign-in mint registers the row). 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = DevicesApi();
final installationId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Client installation UUID hint (not an authorization credential)

try {
    final result = api_instance.getDeviceActiveChild(installationId);
    print(result);
} catch (e) {
    print('Exception when calling DevicesApi->getDeviceActiveChild: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **installationId** | **String**| Client installation UUID hint (not an authorization credential) | 

### Return type

[**DeviceActiveChildBinding**](DeviceActiveChildBinding.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setDeviceActiveChild**
> DeviceActiveChildBinding setDeviceActiveChild(installationId, setDeviceActiveChildRequest)

Bind or clear the active child for a parent-owned device installation

LMP-134. Atomically updates `devices.child_id` after verifying parent ownership of both the resolved device row and the target child profile. Use `child_id: null` to clear the binding. Concurrent updates serialize on the device row (`FOR UPDATE`). 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = DevicesApi();
final installationId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final setDeviceActiveChildRequest = SetDeviceActiveChildRequest(); // SetDeviceActiveChildRequest | 

try {
    final result = api_instance.setDeviceActiveChild(installationId, setDeviceActiveChildRequest);
    print(result);
} catch (e) {
    print('Exception when calling DevicesApi->setDeviceActiveChild: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **installationId** | **String**|  | 
 **setDeviceActiveChildRequest** | [**SetDeviceActiveChildRequest**](SetDeviceActiveChildRequest.md)|  | 

### Return type

[**DeviceActiveChildBinding**](DeviceActiveChildBinding.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

