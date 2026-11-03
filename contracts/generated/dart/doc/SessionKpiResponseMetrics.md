# little_minds_api.model.SessionKpiResponseMetrics

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**eligibleSessionCount** | **int** |  | 
**completedSessionCount** | **int** |  | 
**interruptedSessionCount** | **int** |  | 
**abandonedSessionCount** | **int** |  | 
**inProgressSessionCount** | **int** |  | 
**totalPlayDurationSeconds** | **int** |  | 
**completedSessionRate** | [**SessionKpiRateMetric**](SessionKpiRateMetric.md) |  | 
**distinctPlayDays** | **int** |  | 
**byActivity** | [**List<SessionKpiActivityBreakdown>**](SessionKpiActivityBreakdown.md) |  | [default to const []]
**firstAttemptAccuracy** | [**SessionKpiRateMetric**](SessionKpiRateMetric.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


