# little_minds_api.model.ReadinessStatusChecks

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**database** | **String** | PostgreSQL probe result. `skipped` only when APP_ENV=development and DATABASE_URL is unset. Staging/production missing DATABASE_URL or a failed probe → `down` (forces overall not_ready).  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


