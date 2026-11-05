# little_minds_api.model.ParentSessionSummary

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**sessionId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | 
**createdAt** | [**DateTime**](DateTime.md) |  | 
**lastRefreshedAt** | [**DateTime**](DateTime.md) |  | [optional] 
**expiresAt** | [**DateTime**](DateTime.md) |  | 
**revoked** | **bool** |  | 
**clientSurface** | **String** |  | [optional] 
**deviceId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | [optional] 
**userAgentSummary** | **String** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


