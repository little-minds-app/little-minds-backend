# little_minds_api.model.LinkIdentityRequest

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**stepUpToken** | **String** | Opaque one-time token from POST /v1/auth/identities/step-up | 
**provider** | **String** | Provider to link; proof fields must match provider | 
**idToken** | **String** | Apple or Google ID token (nonce path) | [optional] 
**nonce** | **String** | Server-issued nonce (Apple/Google nonce path) | [optional] 
**authorizationCode** | **String** | Google authorization code (PKCE path) | [optional] 
**codeVerifier** | **String** |  | [optional] 
**redirectUri** | **String** |  | [optional] 
**oauthState** | **String** | Server-issued oauth_state from google/pkce/start | [optional] 
**challengeId** | **String** | Email or phone OTP challenge id | [optional] 
**code** | **String** | Email or phone OTP code | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


