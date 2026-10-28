# little_minds_api.model.PhoneOtpStartRequest

## Load the model package
```dart
import 'package:little_minds_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**phone** | **String** |  | 
**countryCode** | **String** |  | [optional] 
**noticeVersion** | **String** | KVKK Option A — uniform for ALL callers. Must equal server active published notice version. Not consent. Not required on verify.  | 
**noticeLocale** | **String** |  | 
**clientSurface** | **String** |  | [optional] 
**deviceId** | **String** | RFC 4122 UUID with version nibble 4 or 7 | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


