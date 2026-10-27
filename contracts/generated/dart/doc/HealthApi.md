# little_minds_api.api.HealthApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getHealth**](HealthApi.md#gethealth) | **GET** /health | Process liveness


# **getHealth**
> HealthStatus getHealth()

Process liveness

Returns process liveness JSON. Unauthenticated. Does not probe PostgreSQL or other dependencies (readiness arrives in a later task). 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = HealthApi();

try {
    final result = api_instance.getHealth();
    print(result);
} catch (e) {
    print('Exception when calling HealthApi->getHealth: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**HealthStatus**](HealthStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

