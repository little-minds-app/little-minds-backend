# little_minds_api.api.AuthApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createDevParentSession**](AuthApi.md#createdevparentsession) | **POST** /v1/auth/dev/session | Local/test session bootstrap (development only)
[**listParentSessions**](AuthApi.md#listparentsessions) | **GET** /v1/auth/sessions | List sessions for the authenticated parent
[**logoutAllParentSessions**](AuthApi.md#logoutallparentsessions) | **POST** /v1/auth/logout-all | Revoke all sessions for the authenticated parent
[**logoutParentSession**](AuthApi.md#logoutparentsession) | **POST** /v1/auth/logout | Revoke the current parent session
[**refreshParentSession**](AuthApi.md#refreshparentsession) | **POST** /v1/auth/token/refresh | Rotate parent access and refresh tokens
[**revokeParentSession**](AuthApi.md#revokeparentsession) | **DELETE** /v1/auth/sessions/{sessionId} | Revoke one owned session


# **createDevParentSession**
> TokenPairResponse createDevParentSession(devSessionRequest)

Local/test session bootstrap (development only)

Hard-disabled in staging/production. Requires AUTH_DEV_BOOTSTRAP_ENABLED, allowlisted parent_id (default seed parent), and loopback client. Do not call from staging/production clients. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final devSessionRequest = DevSessionRequest(); // DevSessionRequest | 

try {
    final result = api_instance.createDevParentSession(devSessionRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->createDevParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **devSessionRequest** | [**DevSessionRequest**](DevSessionRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listParentSessions**
> ParentSessionListResponse listParentSessions()

List sessions for the authenticated parent

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();

try {
    final result = api_instance.listParentSessions();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->listParentSessions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ParentSessionListResponse**](ParentSessionListResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutAllParentSessions**
> LogoutAllResponse logoutAllParentSessions()

Revoke all sessions for the authenticated parent

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();

try {
    final result = api_instance.logoutAllParentSessions();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->logoutAllParentSessions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**LogoutAllResponse**](LogoutAllResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutParentSession**
> logoutParentSession(logoutRequest)

Revoke the current parent session

Requires refresh_token and/or Authorization bearer. Idempotent.

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final logoutRequest = LogoutRequest(); // LogoutRequest | 

try {
    api_instance.logoutParentSession(logoutRequest);
} catch (e) {
    print('Exception when calling AuthApi->logoutParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **logoutRequest** | [**LogoutRequest**](LogoutRequest.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **refreshParentSession**
> TokenPairResponse refreshParentSession(refreshTokenRequest)

Rotate parent access and refresh tokens

Transactional single-winner refresh (ADR-019). Clients must use single-flight refresh and must not retry a consumed refresh token. Lost responses require re-authentication. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final refreshTokenRequest = RefreshTokenRequest(); // RefreshTokenRequest | 

try {
    final result = api_instance.refreshParentSession(refreshTokenRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->refreshParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshTokenRequest** | [**RefreshTokenRequest**](RefreshTokenRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeParentSession**
> revokeParentSession(sessionId)

Revoke one owned session

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();
final sessionId = sessionId_example; // String | 

try {
    api_instance.revokeParentSession(sessionId);
} catch (e) {
    print('Exception when calling AuthApi->revokeParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

