//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ApiClient {
  ApiClient({this.basePath = 'http://localhost:3000', this.authentication,});

  final String basePath;
  final Authentication? authentication;

  var _client = Client();
  final _defaultHeaderMap = <String, String>{};

  /// Returns the current HTTP [Client] instance to use in this class.
  ///
  /// The return value is guaranteed to never be null.
  Client get client => _client;

  /// Requests to use a new HTTP [Client] in this class.
  set client(Client newClient) {
    _client = newClient;
  }

  Map<String, String> get defaultHeaderMap => _defaultHeaderMap;

  void addDefaultHeader(String key, String value) {
     _defaultHeaderMap[key] = value;
  }

  // We don't use a Map<String, String> for queryParams.
  // If collectionFormat is 'multi', a key might appear multiple times.
  Future<Response> invokeAPI(
    String path,
    String method,
    List<QueryParam> queryParams,
    Object? body,
    Map<String, String> headerParams,
    Map<String, String> formParams,
    String? contentType, {
    Future<void>? abortTrigger,
  }) async {
    await authentication?.applyToParams(queryParams, headerParams);

    headerParams.addAll(_defaultHeaderMap);
    if (contentType != null) {
      headerParams['Content-Type'] = contentType;
    }

    final urlEncodedQueryParams = queryParams.map((param) => '$param');
    final queryString = urlEncodedQueryParams.isNotEmpty ? '?${urlEncodedQueryParams.join('&')}' : '';
    final uri = Uri.parse('$basePath$path$queryString');

    try {
      // Special case for uploading a single file which isn't a 'multipart/form-data'.
      if (
        body is MultipartFile && (contentType == null ||
        !contentType.toLowerCase().startsWith('multipart/form-data'))
      ) {
        final request = AbortableStreamedRequest(method, uri, abortTrigger: abortTrigger);
        request.headers.addAll(headerParams);
        request.contentLength = body.length;
        body.finalize().listen(
          request.sink.add,
          onDone: request.sink.close,
          // ignore: avoid_types_on_closure_parameters
          onError: (Object error, StackTrace trace) => request.sink.close(),
          cancelOnError: true,
        );
        final response = await _client.send(request);
        return Response.fromStream(response);
      }

      if (body is MultipartRequest) {
        final request = AbortableMultipartRequest(method, uri, abortTrigger: abortTrigger);
        request.fields.addAll(body.fields);
        request.files.addAll(body.files);
        request.headers.addAll(body.headers);
        request.headers.addAll(headerParams);
        final response = await _client.send(request);
        return Response.fromStream(response);
      }

      final msgBody = contentType == 'application/x-www-form-urlencoded'
        ? formParams
        : await serializeAsync(body);
      final nullableHeaderParams = headerParams.isEmpty ? null : headerParams;

      final request = AbortableRequest(method, uri, abortTrigger: abortTrigger);
      if (nullableHeaderParams != null) {
        request.headers.addAll(nullableHeaderParams);
      }
      if (msgBody is String && msgBody.isNotEmpty) {
        request.body = msgBody;
      } else if (msgBody is List<int> && msgBody.isNotEmpty) {
        request.bodyBytes = msgBody;
      } else if (msgBody is Map<String, String>) {
        request.bodyFields = msgBody;
      }
      final response = await _client.send(request);
      return Response.fromStream(response);
    } on SocketException catch (error, trace) {
      throw ApiException.withInner(
        HttpStatus.badRequest,
        'Socket operation failed: $method $path',
        error,
        trace,
      );
    } on TlsException catch (error, trace) {
      throw ApiException.withInner(
        HttpStatus.badRequest,
        'TLS/SSL communication failed: $method $path',
        error,
        trace,
      );
    } on IOException catch (error, trace) {
      throw ApiException.withInner(
        HttpStatus.badRequest,
        'I/O operation failed: $method $path',
        error,
        trace,
      );
    } on ClientException catch (error, trace) {
      throw ApiException.withInner(
        HttpStatus.badRequest,
        'HTTP connection failed: $method $path',
        error,
        trace,
      );
    } on Exception catch (error, trace) {
      throw ApiException.withInner(
        HttpStatus.badRequest,
        'Exception occurred: $method $path',
        error,
        trace,
      );
    }
  }

  Future<dynamic> deserializeAsync(String value, String targetType, {bool growable = false,}) async =>
    // ignore: deprecated_member_use_from_same_package
    deserialize(value, targetType, growable: growable);

  @Deprecated('Scheduled for removal in OpenAPI Generator 6.x. Use deserializeAsync() instead.')
  dynamic deserialize(String value, String targetType, {bool growable = false,}) {
    // Remove all spaces. Necessary for regular expressions as well.
    targetType = targetType.replaceAll(' ', ''); // ignore: parameter_assignments

    // If the expected target type is String, nothing to do...
    return targetType == 'String'
      ? value
      : fromJson(json.decode(value), targetType, growable: growable);
  }

  // ignore: deprecated_member_use_from_same_package
  Future<String> serializeAsync(Object? value) async => serialize(value);

  @Deprecated('Scheduled for removal in OpenAPI Generator 6.x. Use serializeAsync() instead.')
  String serialize(Object? value) => value == null ? '' : json.encode(value);

  /// Returns a native instance of an OpenAPI class matching the [specified type][targetType].
  static dynamic fromJson(dynamic value, String targetType, {bool growable = false,}) {
    try {
      switch (targetType) {
        case 'String':
          return value is String ? value : value.toString();
        case 'int':
          return value is int ? value : int.parse('$value');
        case 'double':
          return value is double ? value : double.parse('$value');
        case 'bool':
          if (value is bool) {
            return value;
          }
          final valueString = '$value'.toLowerCase();
          return valueString == 'true' || valueString == '1';
        case 'DateTime':
          return value is DateTime ? value : DateTime.tryParse(value);
        case 'ActivityEventProvenance':
          return ActivityEventProvenance.fromJson(value);
        case 'ActivityEventType':
          return ActivityEventTypeTypeTransformer().decode(value);
        case 'ActivityEventV1':
          return ActivityEventV1.fromJson(value);
        case 'ActivitySchemaVersion':
          return ActivitySchemaVersionTypeTransformer().decode(value);
        case 'ActivitySessionConsent':
          return ActivitySessionConsent.fromJson(value);
        case 'ActivitySessionProvenance':
          return ActivitySessionProvenance.fromJson(value);
        case 'ActivitySessionV1':
          return ActivitySessionV1.fromJson(value);
        case 'AppleAuthRequest':
          return AppleAuthRequest.fromJson(value);
        case 'AuthError':
          return AuthError.fromJson(value);
        case 'ChildProfileResponse':
          return ChildProfileResponse.fromJson(value);
        case 'ConsentScope':
          return ConsentScopeTypeTransformer().decode(value);
        case 'CreateChildProfile201Response':
          return CreateChildProfile201Response.fromJson(value);
        case 'CreateChildProfileRequest':
          return CreateChildProfileRequest.fromJson(value);
        case 'CreateParentWebSession201Response':
          return CreateParentWebSession201Response.fromJson(value);
        case 'CreateWebChildProfileRequest':
          return CreateWebChildProfileRequest.fromJson(value);
        case 'DevSessionRequest':
          return DevSessionRequest.fromJson(value);
        case 'EmailOtpStartRequest':
          return EmailOtpStartRequest.fromJson(value);
        case 'EmailOtpStartResponse':
          return EmailOtpStartResponse.fromJson(value);
        case 'EmailOtpVerifyRequest':
          return EmailOtpVerifyRequest.fromJson(value);
        case 'GetChildProfile200Response':
          return GetChildProfile200Response.fromJson(value);
        case 'GetParentWebSession200Response':
          return GetParentWebSession200Response.fromJson(value);
        case 'GoogleAuthRequest':
          return GoogleAuthRequest.fromJson(value);
        case 'GooglePkceStartRequest':
          return GooglePkceStartRequest.fromJson(value);
        case 'GooglePkceStartResponse':
          return GooglePkceStartResponse.fromJson(value);
        case 'HealthStatus':
          return HealthStatus.fromJson(value);
        case 'IngestActivityEventBatch200Response':
          return IngestActivityEventBatch200Response.fromJson(value);
        case 'IngestActivityEventBatch200ResponseResultsInner':
          return IngestActivityEventBatch200ResponseResultsInner.fromJson(value);
        case 'IngestActivityEventBatchRequest':
          return IngestActivityEventBatchRequest.fromJson(value);
        case 'LinkIdentityRequest':
          return LinkIdentityRequest.fromJson(value);
        case 'LinkIdentityResponse':
          return LinkIdentityResponse.fromJson(value);
        case 'ListChildProfiles200Response':
          return ListChildProfiles200Response.fromJson(value);
        case 'LogoutAllResponse':
          return LogoutAllResponse.fromJson(value);
        case 'LogoutRequest':
          return LogoutRequest.fromJson(value);
        case 'OidcNonceRequest':
          return OidcNonceRequest.fromJson(value);
        case 'OidcNonceResponse':
          return OidcNonceResponse.fromJson(value);
        case 'OptionalParentProfile':
          return OptionalParentProfile.fromJson(value);
        case 'ParentGateAuthorized':
          return ParentGateAuthorized.fromJson(value);
        case 'ParentGateLocked':
          return ParentGateLocked.fromJson(value);
        case 'ParentGateProofRequest':
          return ParentGateProofRequest.fromJson(value);
        case 'ParentGateProofResponse':
          return ParentGateProofResponse.fromJson(value);
        case 'ParentGateSetPinRequest':
          return ParentGateSetPinRequest.fromJson(value);
        case 'ParentGateStatus':
          return ParentGateStatus.fromJson(value);
        case 'ParentGateVerifyRequest':
          return ParentGateVerifyRequest.fromJson(value);
        case 'ParentGateVerifyResponse':
          return ParentGateVerifyResponse.fromJson(value);
        case 'ParentMeResponse':
          return ParentMeResponse.fromJson(value);
        case 'ParentSessionListResponse':
          return ParentSessionListResponse.fromJson(value);
        case 'ParentSessionSummary':
          return ParentSessionSummary.fromJson(value);
        case 'PhoneOtpStartRequest':
          return PhoneOtpStartRequest.fromJson(value);
        case 'PhoneOtpStartResponse':
          return PhoneOtpStartResponse.fromJson(value);
        case 'PhoneOtpVerifyRequest':
          return PhoneOtpVerifyRequest.fromJson(value);
        case 'ReadinessStatus':
          return ReadinessStatus.fromJson(value);
        case 'ReadinessStatusChecks':
          return ReadinessStatusChecks.fromJson(value);
        case 'RefreshTokenRequest':
          return RefreshTokenRequest.fromJson(value);
        case 'StepUpRequest':
          return StepUpRequest.fromJson(value);
        case 'StepUpResponse':
          return StepUpResponse.fromJson(value);
        case 'TokenPairResponse':
          return TokenPairResponse.fromJson(value);
        case 'UpdateChildProfileRequest':
          return UpdateChildProfileRequest.fromJson(value);
        case 'UpdateOptionalParentProfile':
          return UpdateOptionalParentProfile.fromJson(value);
        case 'UpdateWebChildProfileRequest':
          return UpdateWebChildProfileRequest.fromJson(value);
        default:
          dynamic match;
          if (value is List && (match = _regList.firstMatch(targetType)?.group(1)) != null) {
            return value
              .map<dynamic>((dynamic v) => fromJson(v, match, growable: growable,))
              .toList(growable: growable);
          }
          if (value is Set && (match = _regSet.firstMatch(targetType)?.group(1)) != null) {
            return value
              .map<dynamic>((dynamic v) => fromJson(v, match, growable: growable,))
              .toSet();
          }
          if (value is Map && (match = _regMap.firstMatch(targetType)?.group(1)) != null) {
            return Map<String, dynamic>.fromIterables(
              value.keys.cast<String>(),
              value.values.map<dynamic>((dynamic v) => fromJson(v, match, growable: growable,)),
            );
          }
      }
    } on Exception catch (error, trace) {
      throw ApiException.withInner(HttpStatus.internalServerError, 'Exception during deserialization.', error, trace,);
    }
    throw ApiException(HttpStatus.internalServerError, 'Could not find a suitable class for deserialization',);
  }
}

/// Primarily intended for use in an isolate.
class DeserializationMessage {
  const DeserializationMessage({
    required this.json,
    required this.targetType,
    this.growable = false,
  });

  /// The JSON value to deserialize.
  final String json;

  /// Target type to deserialize to.
  final String targetType;

  /// Whether to make deserialized lists or maps growable.
  final bool growable;
}

/// Primarily intended for use in an isolate.
Future<dynamic> decodeAsync(DeserializationMessage message) async {
  // Remove all spaces. Necessary for regular expressions as well.
  final targetType = message.targetType.replaceAll(' ', '');

  // If the expected target type is String, nothing to do...
  return targetType == 'String'
    ? message.json
    : json.decode(message.json);
}

/// Primarily intended for use in an isolate.
Future<dynamic> deserializeAsync(DeserializationMessage message) async {
  // Remove all spaces. Necessary for regular expressions as well.
  final targetType = message.targetType.replaceAll(' ', '');

  // If the expected target type is String, nothing to do...
  return targetType == 'String'
    ? message.json
    : ApiClient.fromJson(
        json.decode(message.json),
        targetType,
        growable: message.growable,
      );
}

/// Primarily intended for use in an isolate.
Future<String> serializeAsync(Object? value) async => value == null ? '' : json.encode(value);
