# little_minds_api.model.DeviceActiveChildBinding

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**deviceId** | **String** | Parent-scoped database devices.id (server-derived) | 
**installationId** | **String** | Client installation UUID echoed for correlation | 
**childId** | **String** | Active child authorized for ingest on this device; null when unassigned | 
**updatedAt** | [**DateTime**](DateTime.md) | UTC timestamp of the last binding mutation | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


