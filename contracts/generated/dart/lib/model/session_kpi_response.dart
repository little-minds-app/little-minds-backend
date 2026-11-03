//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionKpiResponse {
  /// Returns a new [SessionKpiResponse] instance.
  SessionKpiResponse({
    required this.definitionVersion,
    required this.source_,
    required this.generatedAt,
    this.latestIngestedAt,
    this.latestActivityAt,
    required this.window,
    required this.freshness,
    required this.sample,
    required this.metrics,
  });

  String definitionVersion;

  SessionKpiResponseSource_Enum source_;

  DateTime generatedAt;

  DateTime? latestIngestedAt;

  DateTime? latestActivityAt;

  SessionKpiResponseWindow window;

  SessionKpiResponseFreshness freshness;

  SessionKpiResponseSample sample;

  SessionKpiResponseMetrics metrics;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionKpiResponse &&
    other.definitionVersion == definitionVersion &&
    other.source_ == source_ &&
    other.generatedAt == generatedAt &&
    other.latestIngestedAt == latestIngestedAt &&
    other.latestActivityAt == latestActivityAt &&
    other.window == window &&
    other.freshness == freshness &&
    other.sample == sample &&
    other.metrics == metrics;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (definitionVersion.hashCode) +
    (source_.hashCode) +
    (generatedAt.hashCode) +
    (latestIngestedAt == null ? 0 : latestIngestedAt!.hashCode) +
    (latestActivityAt == null ? 0 : latestActivityAt!.hashCode) +
    (window.hashCode) +
    (freshness.hashCode) +
    (sample.hashCode) +
    (metrics.hashCode);

  @override
  String toString() => 'SessionKpiResponse[definitionVersion=$definitionVersion, source_=$source_, generatedAt=$generatedAt, latestIngestedAt=$latestIngestedAt, latestActivityAt=$latestActivityAt, window=$window, freshness=$freshness, sample=$sample, metrics=$metrics]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'definition_version'] = this.definitionVersion;
      json[r'source'] = this.source_;
      json[r'generated_at'] = this.generatedAt.toUtc().toIso8601String();
    if (this.latestIngestedAt != null) {
      json[r'latest_ingested_at'] = this.latestIngestedAt!.toUtc().toIso8601String();
    } else {
      json[r'latest_ingested_at'] = null;
    }
    if (this.latestActivityAt != null) {
      json[r'latest_activity_at'] = this.latestActivityAt!.toUtc().toIso8601String();
    } else {
      json[r'latest_activity_at'] = null;
    }
      json[r'window'] = this.window;
      json[r'freshness'] = this.freshness;
      json[r'sample'] = this.sample;
      json[r'metrics'] = this.metrics;
    return json;
  }

  /// Returns a new [SessionKpiResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionKpiResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'definition_version'), 'Required key "SessionKpiResponse[definition_version]" is missing from JSON.');
        assert(json[r'definition_version'] != null, 'Required key "SessionKpiResponse[definition_version]" has a null value in JSON.');
        assert(json.containsKey(r'source'), 'Required key "SessionKpiResponse[source]" is missing from JSON.');
        assert(json[r'source'] != null, 'Required key "SessionKpiResponse[source]" has a null value in JSON.');
        assert(json.containsKey(r'generated_at'), 'Required key "SessionKpiResponse[generated_at]" is missing from JSON.');
        assert(json[r'generated_at'] != null, 'Required key "SessionKpiResponse[generated_at]" has a null value in JSON.');
        assert(json.containsKey(r'window'), 'Required key "SessionKpiResponse[window]" is missing from JSON.');
        assert(json[r'window'] != null, 'Required key "SessionKpiResponse[window]" has a null value in JSON.');
        assert(json.containsKey(r'freshness'), 'Required key "SessionKpiResponse[freshness]" is missing from JSON.');
        assert(json[r'freshness'] != null, 'Required key "SessionKpiResponse[freshness]" has a null value in JSON.');
        assert(json.containsKey(r'sample'), 'Required key "SessionKpiResponse[sample]" is missing from JSON.');
        assert(json[r'sample'] != null, 'Required key "SessionKpiResponse[sample]" has a null value in JSON.');
        assert(json.containsKey(r'metrics'), 'Required key "SessionKpiResponse[metrics]" is missing from JSON.');
        assert(json[r'metrics'] != null, 'Required key "SessionKpiResponse[metrics]" has a null value in JSON.');
        return true;
      }());

      return SessionKpiResponse(
        definitionVersion: mapValueOfType<String>(json, r'definition_version')!,
        source_: SessionKpiResponseSource_Enum.fromJson(json[r'source'])!,
        generatedAt: mapDateTime(json, r'generated_at', r'')!,
        latestIngestedAt: mapDateTime(json, r'latest_ingested_at', r''),
        latestActivityAt: mapDateTime(json, r'latest_activity_at', r''),
        window: SessionKpiResponseWindow.fromJson(json[r'window'])!,
        freshness: SessionKpiResponseFreshness.fromJson(json[r'freshness'])!,
        sample: SessionKpiResponseSample.fromJson(json[r'sample'])!,
        metrics: SessionKpiResponseMetrics.fromJson(json[r'metrics'])!,
      );
    }
    return null;
  }

  static List<SessionKpiResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionKpiResponse> mapFromJson(dynamic json) {
    final map = <String, SessionKpiResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionKpiResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionKpiResponse-objects as value to a dart map
  static Map<String, List<SessionKpiResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionKpiResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionKpiResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'definition_version',
    'source',
    'generated_at',
    'window',
    'freshness',
    'sample',
    'metrics',
  };
}


enum SessionKpiResponseSource_Enum {
  serverActivitySessions._(r'server_activity_sessions'),
  ;

  /// Instantiate a new enum with the provided value.
  const SessionKpiResponseSource_Enum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [SessionKpiResponseSource_Enum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static SessionKpiResponseSource_Enum? fromJson(dynamic value) => SessionKpiResponseSource_EnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [SessionKpiResponseSource_Enum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<SessionKpiResponseSource_Enum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionKpiResponseSource_Enum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionKpiResponseSource_Enum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [SessionKpiResponseSource_Enum] to String,
/// and [decode] dynamic data back to [SessionKpiResponseSource_Enum].
class SessionKpiResponseSource_EnumTypeTransformer {
  factory SessionKpiResponseSource_EnumTypeTransformer() => _instance ??= const SessionKpiResponseSource_EnumTypeTransformer._();

  const SessionKpiResponseSource_EnumTypeTransformer._();

  String encode(SessionKpiResponseSource_Enum data) => data._value;

  /// Returns the instance of [SessionKpiResponseSource_Enum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  SessionKpiResponseSource_Enum? decode(dynamic data, {bool allowNull = true}) {
    if (data is SessionKpiResponseSource_Enum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'server_activity_sessions': return SessionKpiResponseSource_Enum.serverActivitySessions;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static SessionKpiResponseSource_EnumTypeTransformer? _instance;
}


