//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class LinkIdentityResponse {
  /// Returns a new [LinkIdentityResponse] instance.
  LinkIdentityResponse({
    required this.parentId,
    required this.provider,
    required this.identityId,
    required this.linkedAt,
    required this.alreadyLinked,
  });

  String parentId;

  LinkIdentityResponseProviderEnum provider;

  String identityId;

  DateTime linkedAt;

  /// True when subject was already linked to this parent (idempotent)
  bool alreadyLinked;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LinkIdentityResponse &&
    other.parentId == parentId &&
    other.provider == provider &&
    other.identityId == identityId &&
    other.linkedAt == linkedAt &&
    other.alreadyLinked == alreadyLinked;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (parentId.hashCode) +
    (provider.hashCode) +
    (identityId.hashCode) +
    (linkedAt.hashCode) +
    (alreadyLinked.hashCode);

  @override
  String toString() => 'LinkIdentityResponse[parentId=$parentId, provider=$provider, identityId=$identityId, linkedAt=$linkedAt, alreadyLinked=$alreadyLinked]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'parent_id'] = this.parentId;
      json[r'provider'] = this.provider;
      json[r'identity_id'] = this.identityId;
      json[r'linked_at'] = this.linkedAt.toUtc().toIso8601String();
      json[r'already_linked'] = this.alreadyLinked;
    return json;
  }

  /// Returns a new [LinkIdentityResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LinkIdentityResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'parent_id'), 'Required key "LinkIdentityResponse[parent_id]" is missing from JSON.');
        assert(json[r'parent_id'] != null, 'Required key "LinkIdentityResponse[parent_id]" has a null value in JSON.');
        assert(json.containsKey(r'provider'), 'Required key "LinkIdentityResponse[provider]" is missing from JSON.');
        assert(json[r'provider'] != null, 'Required key "LinkIdentityResponse[provider]" has a null value in JSON.');
        assert(json.containsKey(r'identity_id'), 'Required key "LinkIdentityResponse[identity_id]" is missing from JSON.');
        assert(json[r'identity_id'] != null, 'Required key "LinkIdentityResponse[identity_id]" has a null value in JSON.');
        assert(json.containsKey(r'linked_at'), 'Required key "LinkIdentityResponse[linked_at]" is missing from JSON.');
        assert(json[r'linked_at'] != null, 'Required key "LinkIdentityResponse[linked_at]" has a null value in JSON.');
        assert(json.containsKey(r'already_linked'), 'Required key "LinkIdentityResponse[already_linked]" is missing from JSON.');
        assert(json[r'already_linked'] != null, 'Required key "LinkIdentityResponse[already_linked]" has a null value in JSON.');
        return true;
      }());

      return LinkIdentityResponse(
        parentId: mapValueOfType<String>(json, r'parent_id')!,
        provider: LinkIdentityResponseProviderEnum.fromJson(json[r'provider'])!,
        identityId: mapValueOfType<String>(json, r'identity_id')!,
        linkedAt: mapDateTime(json, r'linked_at', r'')!,
        alreadyLinked: mapValueOfType<bool>(json, r'already_linked')!,
      );
    }
    return null;
  }

  static List<LinkIdentityResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LinkIdentityResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LinkIdentityResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LinkIdentityResponse> mapFromJson(dynamic json) {
    final map = <String, LinkIdentityResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LinkIdentityResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LinkIdentityResponse-objects as value to a dart map
  static Map<String, List<LinkIdentityResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LinkIdentityResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LinkIdentityResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'parent_id',
    'provider',
    'identity_id',
    'linked_at',
    'already_linked',
  };
}


enum LinkIdentityResponseProviderEnum {
  apple._(r'apple'),
  google._(r'google'),
  email._(r'email'),
  phone._(r'phone'),
  ;

  /// Instantiate a new enum with the provided value.
  const LinkIdentityResponseProviderEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [LinkIdentityResponseProviderEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static LinkIdentityResponseProviderEnum? fromJson(dynamic value) => LinkIdentityResponseProviderEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [LinkIdentityResponseProviderEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<LinkIdentityResponseProviderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LinkIdentityResponseProviderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LinkIdentityResponseProviderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [LinkIdentityResponseProviderEnum] to String,
/// and [decode] dynamic data back to [LinkIdentityResponseProviderEnum].
class LinkIdentityResponseProviderEnumTypeTransformer {
  factory LinkIdentityResponseProviderEnumTypeTransformer() => _instance ??= const LinkIdentityResponseProviderEnumTypeTransformer._();

  const LinkIdentityResponseProviderEnumTypeTransformer._();

  String encode(LinkIdentityResponseProviderEnum data) => data._value;

  /// Returns the instance of [LinkIdentityResponseProviderEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  LinkIdentityResponseProviderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is LinkIdentityResponseProviderEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'apple': return LinkIdentityResponseProviderEnum.apple;
        case r'google': return LinkIdentityResponseProviderEnum.google;
        case r'email': return LinkIdentityResponseProviderEnum.email;
        case r'phone': return LinkIdentityResponseProviderEnum.phone;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static LinkIdentityResponseProviderEnumTypeTransformer? _instance;
}


