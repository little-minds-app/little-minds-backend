import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  SEED_IDS,
  SHAPE_MATCHING_PUBLICATION,
} from '../prisma/seed-data';

describe('Shape Matching publication manifest (LMP-134)', () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        'content/fixtures/activity-publications/shape-matching.v1.json',
      ),
      'utf8',
    ),
  ) as Record<string, unknown>;

  it('matches seeded catalog UUIDs and editorial codes', () => {
    expect(manifest.content_version_id).toBe(
      SEED_IDS.shapeMatching.contentVersionId,
    );
    expect(manifest.activity_definition_id).toBe(
      SEED_IDS.shapeMatching.activityDefinition,
    );
    expect(manifest.hub_activity_id).toBe(
      SHAPE_MATCHING_PUBLICATION.hubActivityId,
    );
    expect(manifest.mechanic_code).toBe(
      SHAPE_MATCHING_PUBLICATION.mechanicCode,
    );
    expect(manifest.consent_policy_version).toBe(
      SHAPE_MATCHING_PUBLICATION.policyVersion,
    );
  });

  it('uses RFC-4122 UUID for content_version_id', () => {
    expect(String(manifest.content_version_id)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
