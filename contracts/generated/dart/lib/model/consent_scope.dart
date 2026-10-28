//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

/// Purpose-specific consent scope (draft placeholders until legal sign-off)
enum ConsentScope {
  essentialPlayEvents._(r'essential_play_events'),
  essentialServiceTelemetry._(r'essential_service_telemetry'),
  optionalProductAnalytics._(r'optional_product_analytics'),
  ;

  /// Instantiate a new enum with the provided value.
  const ConsentScope._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ConsentScope] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ConsentScope? fromJson(dynamic value) => ConsentScopeTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ConsentScope]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ConsentScope> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ConsentScope>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ConsentScope.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ConsentScope] to String,
/// and [decode] dynamic data back to [ConsentScope].
class ConsentScopeTypeTransformer {
  factory ConsentScopeTypeTransformer() => _instance ??= const ConsentScopeTypeTransformer._();

  const ConsentScopeTypeTransformer._();

  /// Encodes this enum as a value suitable for JSON.
  String encode(ConsentScope data) => data._value;

  /// Returns the instance of [ConsentScope] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ConsentScope? decode(dynamic data, {bool allowNull = true}) {
    if (data is ConsentScope) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'essential_play_events': return ConsentScope.essentialPlayEvents;
        case r'essential_service_telemetry': return ConsentScope.essentialServiceTelemetry;
        case r'optional_product_analytics': return ConsentScope.optionalProductAnalytics;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ConsentScopeTypeTransformer? _instance;
}

