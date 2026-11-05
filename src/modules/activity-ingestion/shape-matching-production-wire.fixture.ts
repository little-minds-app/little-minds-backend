import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const SHAPE_MATCHING_WIRE_FIXTURE_DIR = resolve(
  process.cwd(),
  'contracts/fixtures/activity/shape-matching',
);

export type ShapeMatchingWireEventsFile = {
  deviceId: string;
  contentVersionId: string;
  events: Record<string, unknown>[];
};

export type ShapeMatchingWireBatchFile = {
  sessions: Record<string, unknown>[];
  events: Record<string, unknown>[];
};

export function loadShapeMatchingWireJson<T>(filename: string): T {
  return JSON.parse(
    readFileSync(resolve(SHAPE_MATCHING_WIRE_FIXTURE_DIR, filename), 'utf8'),
  ) as T;
}

/** Event types emitted by Shape Matching production buffer (client PR #40). */
export const SHAPE_MATCHING_PRODUCTION_EVENT_TYPES = [
  'activity_started',
  'activity_attempted',
  'activity_hint_used',
  'activity_completed',
  'activity_abandoned',
] as const;

/** Client `_canonicalPayload` keys that ActivityEventV1 rejects (no schema change). */
export const SHAPE_MATCHING_CLIENT_INCOMPATIBLE_PAYLOAD_KEYS: Readonly<
  Record<string, readonly string[]>
> = {
  activity_started: ['activity_variant_id'],
  activity_attempted: ['shape_id', 'correct', 'round_index'],
};
