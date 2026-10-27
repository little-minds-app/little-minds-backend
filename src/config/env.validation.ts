import { z } from 'zod';

/**
 * Startup env schema for Nest bootstrap.
 * Fail-fast on invalid values. Compose service URLs live in `.env.example` (LMP-21)
 * but are not required here until Prisma/adapters wire them (LMP-22+).
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(
  config: Record<string, unknown>,
): AppEnv {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Environment validation failed: ${details}`);
  }
  return result.data;
}
