# little_minds_api.model.ActivityEventV1

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**schemaVersion** | [**ActivitySchemaVersion**](ActivitySchemaVersion.md) |  | 
**eventId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | 
**eventType** | [**ActivityEventType**](ActivityEventType.md) |  | 
**playSessionId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | [optional] 
**deviceId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | 
**contentVersionId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | 
**occurredAt** | **String** | UTC ISO-8601 instant ending in Z | 
**monotonicDurationSeconds** | **int** |  | [optional] 
**consentScope** | [**ConsentScope**](ConsentScope.md) |  | 
**consentPolicyVersion** | **String** |  | 
**provenance** | [**ActivityEventProvenance**](ActivityEventProvenance.md) |  | 
**payload** | **Map<String, Object>** | Typed allowlisted payload per event_type (see JSON Schema) | [default to const {}]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


