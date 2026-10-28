# little_minds_api.model.ReadinessStatus

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **String** | Readiness indicator (not_ready → HTTP 503) | 
**service** | **String** | Stable service identifier | 
**timestamp** | [**DateTime**](DateTime.md) | UTC ISO-8601 timestamp when the check was produced | 
**checks** | [**ReadinessStatusChecks**](ReadinessStatusChecks.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


