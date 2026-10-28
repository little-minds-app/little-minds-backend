import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const schemaPath = join(__dirname, '..', 'prisma', 'schema.prisma');
const mappingPath = join(__dirname, '..', 'prisma', 'MAPPING.md');

const REQUIRED_MODELS = [
  'ParentAccount',
  'ParentIdentity',
  'ParentSession',
  'ParentProfile',
  'ProfileDraft',
  'ChildProfile',
  'ConsentRecord',
  'Device',
  'KidsModeAuthorization',
  'ActivityDefinition',
  'ActivityVariant',
  'ActivitySession',
  'ActivityEvent',
  'ScreenTimePolicy',
  'ScreenTimeResetHistory',
  'Subscription',
  'Entitlement',
  'OfflineEntitlementGrant',
  'AuditLog',
  'DeletionRequest',
] as const;

describe('Prisma schema contract (LMP-22)', () => {
  const schema = readFileSync(schemaPath, 'utf8');
  const mapping = readFileSync(mappingPath, 'utf8');

  it('declares PostgreSQL datasource via DATABASE_URL', () => {
    expect(schema).toMatch(/provider\s*=\s*"postgresql"/);
    expect(schema).toMatch(/env\("DATABASE_URL"\)/);
  });

  it('includes canonical Day-1 models from Blueprint §13/§38', () => {
    for (const model of REQUIRED_MODELS) {
      expect(schema).toContain(`model ${model} `);
    }
  });

  it('uses §38 naming for play sessions and content versions', () => {
    expect(schema).toContain('content_version_id');
    expect(schema).toContain('play_session_id');
    expect(schema).toContain('@@map("parent_profiles")');
    expect(schema).not.toContain('@@map("parent_demographics")');
  });

  it('documents mapping and unresolved decisions', () => {
    expect(mapping).toContain('Unresolved decisions');
    expect(mapping).toContain('ParentProfile');
    expect(mapping).toContain('KidsModeAuthorization');
    expect(mapping).toContain('content_cache_index');
  });
});
