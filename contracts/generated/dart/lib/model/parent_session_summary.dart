//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ParentSessionSummary {
  /// Returns a new [ParentSessionSummary] instance.
  ParentSessionSummary({
    required this.sessionId,
    required this.createdAt,
    this.lastRefreshedAt,
    required this.expiresAt,
    required this.revoked,
    this.clientSurface,
    this.deviceId,
    this.userAgentSummary,
  });

  /// RFC 4122 UUID with version nibble 4 or 7
  String sessionId;

  DateTime createdAt;

  DateTime? lastRefreshedAt;

  DateTime expiresAt;

  bool revoked;

  String? clientSurface;

  /// RFC 4122 UUID with version nibble 4 or 7
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? deviceId;

  String? userAgentSummary;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParentSessionSummary &&
    other.sessionId == sessionId &&
    other.createdAt == createdAt &&
    other.lastRefreshedAt == lastRefreshedAt &&
    other.expiresAt == expiresAt &&
    other.revoked == revoked &&
    other.clientSurface == clientSurface &&
    other.deviceId == deviceId &&
    other.userAgentSummary == userAgentSummary;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (sessionId.hashCode) +
    (createdAt.hashCode) +
    (lastRefreshedAt == null ? 0 : lastRefreshedAt!.hashCode) +
    (expiresAt.hashCode) +
    (revoked.hashCode) +
    (clientSurface == null ? 0 : clientSurface!.hashCode) +
    (deviceId == null ? 0 : deviceId!.hashCode) +
    (userAgentSummary == null ? 0 : userAgentSummary!.hashCode);

  @override
  String toString() => 'ParentSessionSummary[sessionId=$sessionId, createdAt=$createdAt, lastRefreshedAt=$lastRefreshedAt, expiresAt=$expiresAt, revoked=$revoked, clientSurface=$clientSurface, deviceId=$deviceId, userAgentSummary=$userAgentSummary]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'session_id'] = this.sessionId;
      json[r'created_at'] = this.createdAt.toUtc().toIso8601String();
    if (this.lastRefreshedAt != null) {
      json[r'last_refreshed_at'] = this.lastRefreshedAt!.toUtc().toIso8601String();
    } else {
      json[r'last_refreshed_at'] = null;
    }
      json[r'expires_at'] = this.expiresAt.toUtc().toIso8601String();
      json[r'revoked'] = this.revoked;
    if (this.clientSurface != null) {
      json[r'client_surface'] = this.clientSurface;
    } else {
      json[r'client_surface'] = null;
    }
    if (this.deviceId != null) {
      json[r'device_id'] = this.deviceId;
    } else {
      json[r'device_id'] = null;
    }
    if (this.userAgentSummary != null) {
      json[r'user_agent_summary'] = this.userAgentSummary;
    } else {
      json[r'user_agent_summary'] = null;
    }
    return json;
  }

  /// Returns a new [ParentSessionSummary] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParentSessionSummary? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'session_id'), 'Required key "ParentSessionSummary[session_id]" is missing from JSON.');
        assert(json[r'session_id'] != null, 'Required key "ParentSessionSummary[session_id]" has a null value in JSON.');
        assert(json.containsKey(r'created_at'), 'Required key "ParentSessionSummary[created_at]" is missing from JSON.');
        assert(json[r'created_at'] != null, 'Required key "ParentSessionSummary[created_at]" has a null value in JSON.');
        assert(json.containsKey(r'expires_at'), 'Required key "ParentSessionSummary[expires_at]" is missing from JSON.');
        assert(json[r'expires_at'] != null, 'Required key "ParentSessionSummary[expires_at]" has a null value in JSON.');
        assert(json.containsKey(r'revoked'), 'Required key "ParentSessionSummary[revoked]" is missing from JSON.');
        assert(json[r'revoked'] != null, 'Required key "ParentSessionSummary[revoked]" has a null value in JSON.');
        return true;
      }());

      return ParentSessionSummary(
        sessionId: mapValueOfType<String>(json, r'session_id')!,
        createdAt: mapDateTime(json, r'created_at', r'')!,
        lastRefreshedAt: mapDateTime(json, r'last_refreshed_at', r''),
        expiresAt: mapDateTime(json, r'expires_at', r'')!,
        revoked: mapValueOfType<bool>(json, r'revoked')!,
        clientSurface: mapValueOfType<String>(json, r'client_surface'),
        deviceId: mapValueOfType<String>(json, r'device_id'),
        userAgentSummary: mapValueOfType<String>(json, r'user_agent_summary'),
      );
    }
    return null;
  }

  static List<ParentSessionSummary> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParentSessionSummary>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParentSessionSummary.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParentSessionSummary> mapFromJson(dynamic json) {
    final map = <String, ParentSessionSummary>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParentSessionSummary.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParentSessionSummary-objects as value to a dart map
  static Map<String, List<ParentSessionSummary>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParentSessionSummary>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParentSessionSummary.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'session_id',
    'created_at',
    'expires_at',
    'revoked',
  };
}

