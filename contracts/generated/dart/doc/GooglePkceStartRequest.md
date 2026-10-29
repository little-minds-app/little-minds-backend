# little_minds_api.model.GooglePkceStartRequest

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**redirectUri** | **String** | Must be in GOOGLE_REDIRECT_URIS allowlist | 
**codeChallenge** | **String** | S256 code_challenge (base64url SHA-256 of verifier) | 
**codeChallengeMethod** | **String** | Only S256 is accepted; defaults to S256 | [optional] 
**clientId** | **String** | Optional; must be in GOOGLE_CLIENT_IDS when provided | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


