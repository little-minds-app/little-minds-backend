# little_minds_api.model.EffectiveConsentScope

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**consentScope** | [**ConsentScope**](ConsentScope.md) |  | 
**childId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | 
**authorized** | **bool** | True when latest-effective trusted records grant the scope | 
**policyVersion** | **String** |  | 
**status** | **String** |  | 
**effectiveAt** | **String** | UTC ISO-8601 instant ending in Z | 
**source_** | **String** |  | 
**recordId** | **String** | RFC 4122 UUID with version nibble 4, 5, or 7. UUIDv5 is used for parent-scoped `devices.id` digests on activity ingest (LMP-134).  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


