# little_minds_api.api.ParentApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**checkParentGateGrant**](ParentApi.md#checkparentgategrant) | **GET** /v1/parent/gate/grant | Check a session-bound adult grant
[**clearParentProfile**](ParentApi.md#clearparentprofile) | **DELETE** /v1/parent/profile | Clear all six optional parent profile attributes
[**clearWebParentProfile**](ParentApi.md#clearwebparentprofile) | **DELETE** /v1/auth/web/profile | Clear optional parent profile fields through opaque web session
[**createChildProfile**](ParentApi.md#createchildprofile) | **POST** /v1/children | Create an approximate-age child profile owned by the authenticated parent
[**createParentGatePin**](ParentApi.md#createparentgatepin) | **POST** /v1/parent/gate/setup | One-time PIN setup after fresh verified identity proof
[**createWebChildProfile**](ParentApi.md#createwebchildprofile) | **POST** /v1/web/children | Server-side BFF child creation using opaque session
[**getChildProfile**](ParentApi.md#getchildprofile) | **GET** /v1/children/{childId} | Read a non-deleted child profile only when owned by authenticated parent
[**getParentGateStatus**](ParentApi.md#getparentgatestatus) | **GET** /v1/parent/gate/status | Check whether this verified parent has configured a gate PIN
[**getParentMe**](ParentApi.md#getparentme) | **GET** /v1/parent/me | Authenticated parent identity probe
[**getParentProfile**](ParentApi.md#getparentprofile) | **GET** /v1/parent/profile | Read optional parent profile fields without inferring missing values
[**getWebParentProfile**](ParentApi.md#getwebparentprofile) | **GET** /v1/auth/web/profile | Parent profile through server-authorized opaque web session
[**issueParentGateProof**](ParentApi.md#issueparentgateproof) | **POST** /v1/parent/gate/proof | Verify a freshly authenticated linked identity for PIN setup or reset
[**listChildProfiles**](ParentApi.md#listchildprofiles) | **GET** /v1/children | List only the authenticated parent's non-deleted child profiles
[**listWebChildProfiles**](ParentApi.md#listwebchildprofiles) | **GET** /v1/web/children | Server-side BFF child list using an opaque parent web session
[**lockParentGate**](ParentApi.md#lockparentgate) | **DELETE** /v1/parent/gate/grant | Revoke all outstanding adult grants for the current parent session
[**resetParentGatePin**](ParentApi.md#resetparentgatepin) | **POST** /v1/parent/gate/reset | Replace PIN with fresh verified identity proof and revoke all grants
[**updateChildProfile**](ParentApi.md#updatechildprofile) | **PATCH** /v1/children/{childId} | Update a child profile owned by the authenticated parent
[**updateParentProfile**](ParentApi.md#updateparentprofile) | **PATCH** /v1/parent/profile | Edit supplied optional fields; null removes a stored value
[**updateWebChildProfile**](ParentApi.md#updatewebchildprofile) | **PATCH** /v1/web/children/{childId} | Server-side BFF child edit using opaque parent web session
[**updateWebParentProfile**](ParentApi.md#updatewebparentprofile) | **PATCH** /v1/auth/web/profile | Edit optional parent profile through opaque web session
[**verifyParentGatePin**](ParentApi.md#verifyparentgatepin) | **POST** /v1/parent/gate/verify | Issue five-minute session-bound adult authorization after PIN check


# **checkParentGateGrant**
> ParentGateAuthorized checkParentGateGrant(xParentGateToken)

Check a session-bound adult grant

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
final xParentGateToken = xParentGateToken_example; // String | 

try {
    final result = api_instance.checkParentGateGrant(xParentGateToken);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->checkParentGateGrant: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xParentGateToken** | **String**|  | 

### Return type

[**ParentGateAuthorized**](ParentGateAuthorized.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **clearParentProfile**
> OptionalParentProfile clearParentProfile()

Clear all six optional parent profile attributes

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
    final result = api_instance.clearParentProfile();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->clearParentProfile: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OptionalParentProfile**](OptionalParentProfile.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **clearWebParentProfile**
> OptionalParentProfile clearWebParentProfile()

Clear optional parent profile fields through opaque web session

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = ParentApi();

try {
    final result = api_instance.clearWebParentProfile();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->clearWebParentProfile: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OptionalParentProfile**](OptionalParentProfile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **createParentGatePin**
> ParentGateStatus createParentGatePin(parentGateSetPinRequest)

One-time PIN setup after fresh verified identity proof

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
final parentGateSetPinRequest = ParentGateSetPinRequest(); // ParentGateSetPinRequest | 

try {
    final result = api_instance.createParentGatePin(parentGateSetPinRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->createParentGatePin: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **parentGateSetPinRequest** | [**ParentGateSetPinRequest**](ParentGateSetPinRequest.md)|  | 

### Return type

[**ParentGateStatus**](ParentGateStatus.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createWebChildProfile**
> CreateChildProfile201Response createWebChildProfile(createWebChildProfileRequest)

Server-side BFF child creation using opaque session

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = ParentApi();
final createWebChildProfileRequest = CreateWebChildProfileRequest(); // CreateWebChildProfileRequest | 

try {
    final result = api_instance.createWebChildProfile(createWebChildProfileRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->createWebChildProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createWebChildProfileRequest** | [**CreateWebChildProfileRequest**](CreateWebChildProfileRequest.md)|  | 

### Return type

[**CreateChildProfile201Response**](CreateChildProfile201Response.md)

### Authorization

No authorization required

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

# **getParentGateStatus**
> ParentGateStatus getParentGateStatus()

Check whether this verified parent has configured a gate PIN

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
    final result = api_instance.getParentGateStatus();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->getParentGateStatus: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ParentGateStatus**](ParentGateStatus.md)

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

# **getParentProfile**
> OptionalParentProfile getParentProfile()

Read optional parent profile fields without inferring missing values

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
    final result = api_instance.getParentProfile();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->getParentProfile: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OptionalParentProfile**](OptionalParentProfile.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWebParentProfile**
> OptionalParentProfile getWebParentProfile()

Parent profile through server-authorized opaque web session

BFF-only headers, not a browser-accessible bearer API.

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = ParentApi();

try {
    final result = api_instance.getWebParentProfile();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->getWebParentProfile: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OptionalParentProfile**](OptionalParentProfile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **issueParentGateProof**
> ParentGateProofResponse issueParentGateProof(parentGateProofRequest)

Verify a freshly authenticated linked identity for PIN setup or reset

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
final parentGateProofRequest = ParentGateProofRequest(); // ParentGateProofRequest | 

try {
    final result = api_instance.issueParentGateProof(parentGateProofRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->issueParentGateProof: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **parentGateProofRequest** | [**ParentGateProofRequest**](ParentGateProofRequest.md)|  | 

### Return type

[**ParentGateProofResponse**](ParentGateProofResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listChildProfiles**
> ListChildProfiles200Response listChildProfiles()

List only the authenticated parent's non-deleted child profiles

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
    final result = api_instance.listChildProfiles();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->listChildProfiles: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListChildProfiles200Response**](ListChildProfiles200Response.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listWebChildProfiles**
> ListChildProfiles200Response listWebChildProfiles()

Server-side BFF child list using an opaque parent web session

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = ParentApi();

try {
    final result = api_instance.listWebChildProfiles();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->listWebChildProfiles: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListChildProfiles200Response**](ListChildProfiles200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **lockParentGate**
> ParentGateLocked lockParentGate()

Revoke all outstanding adult grants for the current parent session

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
    final result = api_instance.lockParentGate();
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->lockParentGate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ParentGateLocked**](ParentGateLocked.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetParentGatePin**
> ParentGateStatus resetParentGatePin(parentGateSetPinRequest)

Replace PIN with fresh verified identity proof and revoke all grants

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
final parentGateSetPinRequest = ParentGateSetPinRequest(); // ParentGateSetPinRequest | 

try {
    final result = api_instance.resetParentGatePin(parentGateSetPinRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->resetParentGatePin: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **parentGateSetPinRequest** | [**ParentGateSetPinRequest**](ParentGateSetPinRequest.md)|  | 

### Return type

[**ParentGateStatus**](ParentGateStatus.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateChildProfile**
> ChildProfileResponse updateChildProfile(childId, updateChildProfileRequest)

Update a child profile owned by the authenticated parent

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
final updateChildProfileRequest = UpdateChildProfileRequest(); // UpdateChildProfileRequest | 

try {
    final result = api_instance.updateChildProfile(childId, updateChildProfileRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->updateChildProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **childId** | **String**|  | 
 **updateChildProfileRequest** | [**UpdateChildProfileRequest**](UpdateChildProfileRequest.md)|  | 

### Return type

[**ChildProfileResponse**](ChildProfileResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateParentProfile**
> OptionalParentProfile updateParentProfile(updateOptionalParentProfile)

Edit supplied optional fields; null removes a stored value

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
final updateOptionalParentProfile = UpdateOptionalParentProfile(); // UpdateOptionalParentProfile | 

try {
    final result = api_instance.updateParentProfile(updateOptionalParentProfile);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->updateParentProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateOptionalParentProfile** | [**UpdateOptionalParentProfile**](UpdateOptionalParentProfile.md)|  | 

### Return type

[**OptionalParentProfile**](OptionalParentProfile.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateWebChildProfile**
> ChildProfileResponse updateWebChildProfile(childId, updateWebChildProfileRequest)

Server-side BFF child edit using opaque parent web session

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = ParentApi();
final childId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final updateWebChildProfileRequest = UpdateWebChildProfileRequest(); // UpdateWebChildProfileRequest | 

try {
    final result = api_instance.updateWebChildProfile(childId, updateWebChildProfileRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->updateWebChildProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **childId** | **String**|  | 
 **updateWebChildProfileRequest** | [**UpdateWebChildProfileRequest**](UpdateWebChildProfileRequest.md)|  | 

### Return type

[**ChildProfileResponse**](ChildProfileResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateWebParentProfile**
> OptionalParentProfile updateWebParentProfile(updateOptionalParentProfile)

Edit optional parent profile through opaque web session

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = ParentApi();
final updateOptionalParentProfile = UpdateOptionalParentProfile(); // UpdateOptionalParentProfile | 

try {
    final result = api_instance.updateWebParentProfile(updateOptionalParentProfile);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->updateWebParentProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateOptionalParentProfile** | [**UpdateOptionalParentProfile**](UpdateOptionalParentProfile.md)|  | 

### Return type

[**OptionalParentProfile**](OptionalParentProfile.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyParentGatePin**
> ParentGateVerifyResponse verifyParentGatePin(parentGateVerifyRequest)

Issue five-minute session-bound adult authorization after PIN check

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
final parentGateVerifyRequest = ParentGateVerifyRequest(); // ParentGateVerifyRequest | 

try {
    final result = api_instance.verifyParentGatePin(parentGateVerifyRequest);
    print(result);
} catch (e) {
    print('Exception when calling ParentApi->verifyParentGatePin: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **parentGateVerifyRequest** | [**ParentGateVerifyRequest**](ParentGateVerifyRequest.md)|  | 

### Return type

[**ParentGateVerifyResponse**](ParentGateVerifyResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

