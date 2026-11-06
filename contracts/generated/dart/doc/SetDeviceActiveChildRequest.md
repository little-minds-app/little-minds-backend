# little_minds_api.model.SetDeviceActiveChildRequest

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**childId** | **String** | Owned child profile to authorize on this device, or null to clear | 
**expectedBindingRevision** | **int** | Compare-and-set token from the latest binding read; rejects stale binds with 409 | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


