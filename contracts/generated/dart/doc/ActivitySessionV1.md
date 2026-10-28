# little_minds_api.model.ActivitySessionV1

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**schemaVersion** | [**ActivitySchemaVersion**](ActivitySchemaVersion.md) |  | 
**playSessionId** | **String** | RFC 4122 UUID with version nibble 4 or 7 | 
**deviceId** | **String** | RFC 4122 UUID with version nibble 4 or 7 | 
**contentVersionId** | **String** | RFC 4122 UUID with version nibble 4 or 7 | 
**startedAt** | **String** | UTC ISO-8601 instant ending in Z | 
**endedAt** | **String** | UTC ISO-8601 instant ending in Z | [optional] 
**monotonicDurationSeconds** | **int** |  | [optional] 
**completionStatus** | **String** |  | 
**appBuild** | **String** |  | [optional] 
**locale** | **String** |  | [optional] 
**consent** | [**ActivitySessionConsent**](ActivitySessionConsent.md) |  | 
**provenance** | [**ActivitySessionProvenance**](ActivitySessionProvenance.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


