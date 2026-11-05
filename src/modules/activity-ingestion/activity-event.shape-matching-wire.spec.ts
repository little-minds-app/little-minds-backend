import { validateActivityEvent } from './activity-event.validator';
import {
  loadShapeMatchingWireJson,
  SHAPE_MATCHING_CLIENT_INCOMPATIBLE_PAYLOAD_KEYS,
  SHAPE_MATCHING_PRODUCTION_EVENT_TYPES,
  type ShapeMatchingWireEventsFile,
} from './shape-matching-production-wire.fixture';

describe('LMP-134 Shape Matching production wire vs activity-event-v1.schema.json', () => {
  const client = loadShapeMatchingWireJson<ShapeMatchingWireEventsFile>(
    'lmp-134-client-production-wire.events.json',
  );
  const aligned = loadShapeMatchingWireJson<ShapeMatchingWireEventsFile>(
    'lmp-134-schema-aligned-production-wire.events.json',
  );

  it('documents client-only payload keys per event type (client must align, not schema)', () => {
    expect(SHAPE_MATCHING_CLIENT_INCOMPATIBLE_PAYLOAD_KEYS.activity_started).toContain(
      'activity_variant_id',
    );
    expect(SHAPE_MATCHING_CLIENT_INCOMPATIBLE_PAYLOAD_KEYS.activity_attempted).toEqual([
      'shape_id',
      'correct',
      'round_index',
    ]);
  });

  describe.each(SHAPE_MATCHING_PRODUCTION_EVENT_TYPES)('%s', (eventType) => {
    const clientEvent = client.events.find((e) => e.event_type === eventType);
    const alignedEvent = aligned.events.find((e) => e.event_type === eventType);

    it('has paired client + schema-aligned fixtures', () => {
      expect(clientEvent).toBeDefined();
      expect(alignedEvent).toBeDefined();
    });

    it('rejects current client production payload at validateActivityEvent', () => {
      const incompatibleKeys =
        SHAPE_MATCHING_CLIENT_INCOMPATIBLE_PAYLOAD_KEYS[
          eventType as keyof typeof SHAPE_MATCHING_CLIENT_INCOMPATIBLE_PAYLOAD_KEYS
        ];
      if (!incompatibleKeys?.length) {
        const result = validateActivityEvent(clientEvent);
        expect(result.ok).toBe(true);
        return;
      }
      const result = validateActivityEvent(clientEvent);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.issues.some((i) => i.path.startsWith('payload'))).toBe(true);
    });

    it('accepts schema-aligned Shape Matching payload at validateActivityEvent', () => {
      const result = validateActivityEvent(alignedEvent);
      expect(result.ok).toBe(true);
    });
  });
});
