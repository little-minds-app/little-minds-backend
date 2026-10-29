# little_minds_api.model.GoogleAuthRequest

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**idToken** | **String** |  | [optional] 
**nonce** | **String** |  | [optional] 
**authorizationCode** | **String** |  | [optional] 
**codeVerifier** | **String** |  | [optional] 
**redirectUri** | **String** |  | [optional] 
**oauthState** | **String** | Server-issued state from POST /v1/auth/google/pkce/start | [optional] 
**noticeVersion** | **String** |  | 
**noticeLocale** | **String** |  | 
**clientSurface** | **String** |  | [optional] 
**deviceId** | **String** | RFC 4122 UUID with version nibble 4 or 7 | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


