# little_minds_api.api.AuthApi

## Load the API package
```dart
import 'package:little_minds_api/api.dart';
```

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authenticateApple**](AuthApi.md#authenticateapple) | **POST** /v1/auth/apple | Apple Sign In with JWKS + mandatory nonce (ADR-021)
[**authenticateGoogle**](AuthApi.md#authenticategoogle) | **POST** /v1/auth/google | Google Sign-In nonce or auth-code+PKCE (ADR-021)
[**createDevParentSession**](AuthApi.md#createdevparentsession) | **POST** /v1/auth/dev/session | Local/test session bootstrap (development only)
[**createIdentityLinkStepUp**](AuthApi.md#createidentitylinkstepup) | **POST** /v1/auth/identities/step-up | Issue recent-auth step-up token for identity linking (LMP-36)
[**issueOidcNonce**](AuthApi.md#issueoidcnonce) | **POST** /v1/auth/oidc/nonce | Issue short-lived OIDC nonce (ADR-021)
[**linkParentIdentity**](AuthApi.md#linkparentidentity) | **POST** /v1/auth/identities/link | Explicitly link a verified provider identity (LMP-36)
[**listParentSessions**](AuthApi.md#listparentsessions) | **GET** /v1/auth/sessions | List sessions for the authenticated parent
[**logoutAllParentSessions**](AuthApi.md#logoutallparentsessions) | **POST** /v1/auth/logout-all | Revoke all sessions for the authenticated parent
[**logoutParentSession**](AuthApi.md#logoutparentsession) | **POST** /v1/auth/logout | Revoke the current parent session
[**refreshParentSession**](AuthApi.md#refreshparentsession) | **POST** /v1/auth/token/refresh | Rotate parent access and refresh tokens
[**revokeParentSession**](AuthApi.md#revokeparentsession) | **DELETE** /v1/auth/sessions/{sessionId} | Revoke one owned session
[**startEmailOtp**](AuthApi.md#startemailotp) | **POST** /v1/auth/email/start | Start Email OTP challenge (ADR-021)
[**startGooglePkce**](AuthApi.md#startgooglepkce) | **POST** /v1/auth/google/pkce/start | Issue one-time Google PKCE OAuth transaction/state (ADR-021)
[**startPhoneOtp**](AuthApi.md#startphoneotp) | **POST** /v1/auth/phone/start | Start GSM OTP challenge (ADR-020)
[**verifyEmailOtp**](AuthApi.md#verifyemailotp) | **POST** /v1/auth/email/verify | Verify Email OTP and mint parent session (ADR-021)
[**verifyPhoneOtp**](AuthApi.md#verifyphoneotp) | **POST** /v1/auth/phone/verify | Verify GSM OTP and mint parent session (ADR-020)


# **authenticateApple**
> TokenPairResponse authenticateApple(appleAuthRequest)

Apple Sign In with JWKS + mandatory nonce (ADR-021)

Verifies Apple ID token via JWKS (asymmetric), issuer/audience/exp/iat/sub, and mandatory single-use server nonce. U7 Option A creates parent on first success via mintSessionTx. Never trusts client-supplied Apple user id/email/name. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final appleAuthRequest = AppleAuthRequest(); // AppleAuthRequest | 

try {
    final result = api_instance.authenticateApple(appleAuthRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->authenticateApple: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **appleAuthRequest** | [**AppleAuthRequest**](AppleAuthRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authenticateGoogle**
> TokenPairResponse authenticateGoogle(googleAuthRequest)

Google Sign-In nonce or auth-code+PKCE (ADR-021)

Prefer ID token + mandatory nonce. Else authorization_code + code_verifier + redirect_uri + **oauth_state** (from `POST /v1/auth/google/pkce/start`) — server atomically consumes the PKCE transaction, exchanges the code, then JWKS-verifies. Never accepts ID-token-without-nonce or unbound auth-code exchange. Fail-closed when Google config / PKCE disabled. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final googleAuthRequest = GoogleAuthRequest(); // GoogleAuthRequest | 

try {
    final result = api_instance.authenticateGoogle(googleAuthRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->authenticateGoogle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **googleAuthRequest** | [**GoogleAuthRequest**](GoogleAuthRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createDevParentSession**
> TokenPairResponse createDevParentSession(devSessionRequest)

Local/test session bootstrap (development only)

Hard-disabled in staging/production. Requires AUTH_DEV_BOOTSTRAP_ENABLED, allowlisted parent_id (default seed parent), and loopback client. Do not call from staging/production clients. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final devSessionRequest = DevSessionRequest(); // DevSessionRequest | 

try {
    final result = api_instance.createDevParentSession(devSessionRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->createDevParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **devSessionRequest** | [**DevSessionRequest**](DevSessionRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createIdentityLinkStepUp**
> StepUpResponse createIdentityLinkStepUp(stepUpRequest)

Issue recent-auth step-up token for identity linking (LMP-36)

Authenticated parent proves control of an identity **already linked** to their account (Apple/Google/email/phone proof). Server returns a short-lived opaque `step_up_token` bound to parent + session + purpose `identity_link`. Access-token refresh alone is **not** recent auth. Token is single-use; stale/replayed/cross-parent consume fails closed. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();
final stepUpRequest = StepUpRequest(); // StepUpRequest | 

try {
    final result = api_instance.createIdentityLinkStepUp(stepUpRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->createIdentityLinkStepUp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **stepUpRequest** | [**StepUpRequest**](StepUpRequest.md)|  | 

### Return type

[**StepUpResponse**](StepUpResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **issueOidcNonce**
> OidcNonceResponse issueOidcNonce(oidcNonceRequest)

Issue short-lived OIDC nonce (ADR-021)

Unauthenticated. Returns a **provider-bound** server-issued nonce for Apple or Google ID-token paths (`provider` required: apple|google). Single-use; TTL 600s. Rate-limited per IP. Cross-provider consume is rejected. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final oidcNonceRequest = OidcNonceRequest(); // OidcNonceRequest | 

try {
    final result = api_instance.issueOidcNonce(oidcNonceRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->issueOidcNonce: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **oidcNonceRequest** | [**OidcNonceRequest**](OidcNonceRequest.md)|  | 

### Return type

[**OidcNonceResponse**](OidcNonceResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **linkParentIdentity**
> LinkIdentityResponse linkParentIdentity(linkIdentityRequest)

Explicitly link a verified provider identity (LMP-36)

Authenticated parent links another provider after **server-issued step-up** (`step_up_token` from `POST /v1/auth/identities/step-up`) **and** fresh target-provider proof (Apple/Google ID-token or PKCE, or email/phone OTP). Access-token refresh alone is not recent auth. No silent merge and no email/name/phone inference. On collision returns `409 identity_collision` without disclosing the other family. Unlink/recovery deferred. 

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();
final linkIdentityRequest = LinkIdentityRequest(); // LinkIdentityRequest | 

try {
    final result = api_instance.linkParentIdentity(linkIdentityRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->linkParentIdentity: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **linkIdentityRequest** | [**LinkIdentityRequest**](LinkIdentityRequest.md)|  | 

### Return type

[**LinkIdentityResponse**](LinkIdentityResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listParentSessions**
> ParentSessionListResponse listParentSessions()

List sessions for the authenticated parent

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();

try {
    final result = api_instance.listParentSessions();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->listParentSessions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ParentSessionListResponse**](ParentSessionListResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutAllParentSessions**
> LogoutAllResponse logoutAllParentSessions()

Revoke all sessions for the authenticated parent

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();

try {
    final result = api_instance.logoutAllParentSessions();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->logoutAllParentSessions: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**LogoutAllResponse**](LogoutAllResponse.md)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logoutParentSession**
> logoutParentSession(logoutRequest)

Revoke the current parent session

Requires refresh_token and/or Authorization bearer. Idempotent.

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final logoutRequest = LogoutRequest(); // LogoutRequest | 

try {
    api_instance.logoutParentSession(logoutRequest);
} catch (e) {
    print('Exception when calling AuthApi->logoutParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **logoutRequest** | [**LogoutRequest**](LogoutRequest.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **refreshParentSession**
> TokenPairResponse refreshParentSession(refreshTokenRequest)

Rotate parent access and refresh tokens

Transactional single-winner refresh (ADR-019). Clients must use single-flight refresh and must not retry a consumed refresh token. Lost responses require re-authentication. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final refreshTokenRequest = RefreshTokenRequest(); // RefreshTokenRequest | 

try {
    final result = api_instance.refreshParentSession(refreshTokenRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->refreshParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshTokenRequest** | [**RefreshTokenRequest**](RefreshTokenRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeParentSession**
> revokeParentSession(sessionId)

Revoke one owned session

### Example
```dart
import 'package:little_minds_api/api.dart';
// TODO Configure HTTP Bearer authorization: parentAccessToken
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('parentAccessToken').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthApi();
final sessionId = sessionId_example; // String | 

try {
    api_instance.revokeParentSession(sessionId);
} catch (e) {
    print('Exception when calling AuthApi->revokeParentSession: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[parentAccessToken](../README.md#parentAccessToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startEmailOtp**
> EmailOtpStartResponse startEmailOtp(emailOtpStartRequest)

Start Email OTP challenge (ADR-021)

Unauthenticated. Applies email_norm_v1. Requires notice_version + notice_locale (KVKK Option A). Never returns OTP. deliveryState=sent required before verify. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final emailOtpStartRequest = EmailOtpStartRequest(); // EmailOtpStartRequest | 

try {
    final result = api_instance.startEmailOtp(emailOtpStartRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->startEmailOtp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **emailOtpStartRequest** | [**EmailOtpStartRequest**](EmailOtpStartRequest.md)|  | 

### Return type

[**EmailOtpStartResponse**](EmailOtpStartResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startGooglePkce**
> GooglePkceStartResponse startGooglePkce(googlePkceStartRequest)

Issue one-time Google PKCE OAuth transaction/state (ADR-021)

Unauthenticated. Returns a server-issued opaque `state` bound to allowlisted `client_id`, `redirect_uri`, and PKCE `code_challenge` (S256). Single-use; TTL 600s. Required before `POST /v1/auth/google` authorization-code path (`oauth_state`). Fail-closed when PKCE disabled / Google misconfigured. Rate-limited per IP. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final googlePkceStartRequest = GooglePkceStartRequest(); // GooglePkceStartRequest | 

try {
    final result = api_instance.startGooglePkce(googlePkceStartRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->startGooglePkce: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **googlePkceStartRequest** | [**GooglePkceStartRequest**](GooglePkceStartRequest.md)|  | 

### Return type

[**GooglePkceStartResponse**](GooglePkceStartResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startPhoneOtp**
> PhoneOtpStartResponse startPhoneOtp(phoneOtpStartRequest)

Start GSM OTP challenge (ADR-020)

Unauthenticated. Türkiye (+90) only Day-1. Requires uniform `notice_version` + `notice_locale` (KVKK Option A). Never returns OTP. Anti-enumeration: response shape identical for existing vs new parents. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final phoneOtpStartRequest = PhoneOtpStartRequest(); // PhoneOtpStartRequest | 

try {
    final result = api_instance.startPhoneOtp(phoneOtpStartRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->startPhoneOtp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **phoneOtpStartRequest** | [**PhoneOtpStartRequest**](PhoneOtpStartRequest.md)|  | 

### Return type

[**PhoneOtpStartResponse**](PhoneOtpStartResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyEmailOtp**
> TokenPairResponse verifyEmailOtp(emailOtpVerifyRequest)

Verify Email OTP and mint parent session (ADR-021)

Gate: status=pending and deliveryState=sent. U7 Option A creates parent on first success. No privacy fields on verify. No silent email link (LMP-36). 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final emailOtpVerifyRequest = EmailOtpVerifyRequest(); // EmailOtpVerifyRequest | 

try {
    final result = api_instance.verifyEmailOtp(emailOtpVerifyRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->verifyEmailOtp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **emailOtpVerifyRequest** | [**EmailOtpVerifyRequest**](EmailOtpVerifyRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyPhoneOtp**
> TokenPairResponse verifyPhoneOtp(phoneOtpVerifyRequest)

Verify GSM OTP and mint parent session (ADR-020)

Uniform for existing and new parents (U7 Option A creates parent on first success). No privacy fields on verify — notice bound at start. Returns ADR-019 TokenPairResponse via SessionIssuerService.mintSessionTx. 

### Example
```dart
import 'package:little_minds_api/api.dart';

final api_instance = AuthApi();
final phoneOtpVerifyRequest = PhoneOtpVerifyRequest(); // PhoneOtpVerifyRequest | 

try {
    final result = api_instance.verifyPhoneOtp(phoneOtpVerifyRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->verifyPhoneOtp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **phoneOtpVerifyRequest** | [**PhoneOtpVerifyRequest**](PhoneOtpVerifyRequest.md)|  | 

### Return type

[**TokenPairResponse**](TokenPairResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

