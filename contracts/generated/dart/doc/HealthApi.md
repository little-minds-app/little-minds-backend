# little_minds_api.api.HealthApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getHealth**](HealthApi.md#gethealth) | **GET** /health | Process liveness
[**getHealthReady**](HealthApi.md#gethealthready) | **GET** /health/ready | Dependency readiness


# **getHealth**
> HealthStatus getHealth()

Process liveness

Returns process liveness JSON. Unauthenticated. Does not probe PostgreSQL or other dependencies — use `GET /health/ready` for readiness. 

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

# **getHealthReady**
> ReadinessStatus getHealthReady()

Dependency readiness

Returns readiness JSON for load balancers and operator alert scrapers. When `DATABASE_URL` is configured, probes PostgreSQL with a lightweight `SELECT 1`. When unset, `checks.database: skipped` is allowed **only** for `APP_ENV=development` (local Nest without Compose). Staging and production missing `DATABASE_URL` return HTTP 503 with `status: not_ready` and `checks.database: down`. Probe failure likewise returns 503 (alert-ready signal; no paid monitoring required). Schema enums are unchanged (`up` | `down` | `skipped`). 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = HealthApi();

try {
    final result = api_instance.getHealthReady();
    print(result);
} catch (e) {
    print('Exception when calling HealthApi->getHealthReady: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ReadinessStatus**](ReadinessStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

