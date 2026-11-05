//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

library openapi.api;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:collection/collection.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:meta/meta.dart';

part 'api_client.dart';
part 'api_helper.dart';
part 'api_exception.dart';
part 'auth/authentication.dart';
part 'auth/api_key_auth.dart';
part 'auth/oauth.dart';
part 'auth/http_basic_auth.dart';
part 'auth/http_bearer_auth.dart';

part 'api/activity_api.dart';
part 'api/auth_api.dart';
part 'api/devices_api.dart';
part 'api/health_api.dart';
part 'api/insights_api.dart';
part 'api/missions_api.dart';
part 'api/parent_api.dart';
part 'api/privacy_api.dart';

part 'model/activity_event_provenance.dart';
part 'model/activity_event_type.dart';
part 'model/activity_event_v1.dart';
part 'model/activity_schema_version.dart';
part 'model/activity_session_consent.dart';
part 'model/activity_session_provenance.dart';
part 'model/activity_session_v1.dart';
part 'model/apple_auth_request.dart';
part 'model/auth_error.dart';
part 'model/child_profile_response.dart';
part 'model/consent_scope.dart';
part 'model/consent_scope_mutation_request.dart';
part 'model/consent_scope_mutation_response.dart';
part 'model/create_child_profile201_response.dart';
part 'model/create_child_profile_request.dart';
part 'model/create_parent_web_session201_response.dart';
part 'model/create_web_child_profile_request.dart';
part 'model/dev_session_request.dart';
part 'model/device_active_child_binding.dart';
part 'model/effective_consent_scope.dart';
part 'model/effective_consent_scopes_response.dart';
part 'model/email_otp_start_request.dart';
part 'model/email_otp_start_response.dart';
part 'model/email_otp_verify_request.dart';
part 'model/get_child_profile200_response.dart';
part 'model/get_parent_web_session200_response.dart';
part 'model/google_auth_request.dart';
part 'model/google_pkce_start_request.dart';
part 'model/google_pkce_start_response.dart';
part 'model/health_status.dart';
part 'model/ingest_activity_event_batch200_response.dart';
part 'model/ingest_activity_event_batch200_response_results_inner.dart';
part 'model/ingest_activity_event_batch_request.dart';
part 'model/link_identity_request.dart';
part 'model/link_identity_response.dart';
part 'model/list_child_profiles200_response.dart';
part 'model/logout_all_response.dart';
part 'model/logout_request.dart';
part 'model/mission_feedback_write_request.dart';
part 'model/mission_feedback_write_response.dart';
part 'model/mission_interaction_facts.dart';
part 'model/mission_parent_report_facts.dart';
part 'model/mission_status_list_response.dart';
part 'model/mission_status_list_response_pagination.dart';
part 'model/mission_status_list_response_window.dart';
part 'model/mission_status_occurrence_row.dart';
part 'model/oidc_nonce_request.dart';
part 'model/oidc_nonce_response.dart';
part 'model/optional_parent_profile.dart';
part 'model/parent_gate_authorized.dart';
part 'model/parent_gate_locked.dart';
part 'model/parent_gate_proof_request.dart';
part 'model/parent_gate_proof_response.dart';
part 'model/parent_gate_set_pin_request.dart';
part 'model/parent_gate_status.dart';
part 'model/parent_gate_verify_request.dart';
part 'model/parent_gate_verify_response.dart';
part 'model/parent_me_response.dart';
part 'model/parent_session_list_response.dart';
part 'model/parent_session_summary.dart';
part 'model/phone_otp_start_request.dart';
part 'model/phone_otp_start_response.dart';
part 'model/phone_otp_verify_request.dart';
part 'model/readiness_status.dart';
part 'model/readiness_status_checks.dart';
part 'model/refresh_token_request.dart';
part 'model/session_kpi_activity_breakdown.dart';
part 'model/session_kpi_rate_metric.dart';
part 'model/session_kpi_response.dart';
part 'model/session_kpi_response_freshness.dart';
part 'model/session_kpi_response_metrics.dart';
part 'model/session_kpi_response_sample.dart';
part 'model/session_kpi_response_window.dart';
part 'model/set_device_active_child_request.dart';
part 'model/step_up_request.dart';
part 'model/step_up_response.dart';
part 'model/token_pair_response.dart';
part 'model/update_child_profile_request.dart';
part 'model/update_optional_parent_profile.dart';
part 'model/update_web_child_profile_request.dart';


/// An [ApiClient] instance that uses the default values obtained from
/// the OpenAPI specification file.
var defaultApiClient = ApiClient();

const _delimiters = {'csv': ',', 'ssv': ' ', 'tsv': '\t', 'pipes': '|'};
const _dateEpochMarker = 'epoch';
const _deepEquality = DeepCollectionEquality();
final _dateFormatter = DateFormat('yyyy-MM-dd');
final _regList = RegExp(r'^List<(.*)>$');
final _regSet = RegExp(r'^Set<(.*)>$');
final _regMap = RegExp(r'^Map<String,(.*)>$');

bool _isEpochMarker(String? pattern) => pattern == _dateEpochMarker || pattern == '/$_dateEpochMarker/';
