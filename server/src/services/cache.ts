import redisClient from '../config/redis';
import prisma from '../config/database';

/**
 * Cache-aside layer in front of PostgreSQL.
 *
 * What gets cached (all with a 5 minute TTL as a safety net):
 *   apikey:<apiKey>                  -> { id } of the project that owns the key
 *   flags:<projectId>:<env>          -> all flags the SDKs download for an environment
 *   flag:<projectId>:<env>:<flagKey> -> a single flag, used by server-side evaluation
 *
 * Every write to a flag must call invalidateFlag() AFTER the database write,
 * otherwise a concurrent read can put the old value back into the cache.
 * If Redis is down or not configured, everything falls back to PostgreSQL.
 */

const CACHE_TTL = 300; // seconds

export const VALID_ENVIRONMENTS = ['Development', 'Staging', 'Production'];

export function isValidEnvironment(env: unknown): env is string {
  return typeof env === 'string' && VALID_ENVIRONMENTS.includes(env);
}

const keys = {
  apiKey: (apiKey: string) => `apikey:${apiKey}`,
  flagList: (projectId: string, env: string) => `flags:${projectId}:${env}`,
  flag: (projectId: string, env: string, flagKey: string) => `flag:${projectId}:${env}:${flagKey}`,
};

// Fields the SDKs need. Kept in one place so the cached and uncached
// responses are always identical.
const SDK_FLAG_FIELDS = {
  id: true,
  key: true,
  description: true,
  status: true,
  type: true,
  rolloutPercentage: true,
  targetingRules: true,
  variants: true,
  defaultVariantId: true,
  offVariantId: true,
  environment: true,
} as const;

// ---------- Low-level helpers (never throw; a cache failure is not an outage) ----------

async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value === null ? null : (JSON.parse(value) as T);
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

async function cacheSet(key: string, value: unknown): Promise<void> {
  if (!redisClient) return;
  try {
    await redisClient.setex(key, CACHE_TTL, JSON.stringify(value));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

async function cacheDel(...cacheKeys: string[]): Promise<void> {
  if (!redisClient || cacheKeys.length === 0) return;
  try {
    await redisClient.del(...cacheKeys);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// ---------- Reads ----------

/**
 * Resolve an API key to its project. Called on every SDK request,
 * so caching it removes a database query from the hot path.
 */
export async function getProjectByApiKey(apiKey: string): Promise<{ id: string } | null> {
  const cacheKey = keys.apiKey(apiKey);
  const cached = await cacheGet<{ id: string }>(cacheKey);
  if (cached) return cached;

  const project = await prisma.project.findUnique({
    where: { apiKey },
    select: { id: true },
  });

  // Unknown keys are not cached, so random keys can't fill up Redis.
  if (project) await cacheSet(cacheKey, project);
  return project;
}

/**
 * All flags for one environment: the payload the SDKs poll.
 * Returns hit=true when served from Redis (exposed as the X-Cache header).
 */
export async function getSdkFlags(projectId: string, environment: string) {
  const cacheKey = keys.flagList(projectId, environment);
  const cached = await cacheGet<unknown[]>(cacheKey);
  if (cached) return { flags: cached, hit: true };

  const flags = await prisma.flag.findMany({
    where: { projectId, environment },
    select: SDK_FLAG_FIELDS,
  });

  await cacheSet(cacheKey, flags);
  return { flags, hit: false };
}

/**
 * A single flag, used by server-side evaluation.
 */
export async function getFlag(projectId: string, flagKey: string, environment = 'Production') {
  const cacheKey = keys.flag(projectId, environment, flagKey);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  const flag = await prisma.flag.findUnique({
    where: {
      projectId_key_environment: { projectId, key: flagKey, environment },
    },
  });

  if (flag) await cacheSet(cacheKey, flag);
  return flag;
}

// ---------- Invalidation ----------

/**
 * Remove a flag and its environment's flag list from the cache.
 * Call this AFTER the database write has finished.
 */
export async function invalidateFlag(projectId: string, environment: string, flagKey: string): Promise<void> {
  await cacheDel(keys.flag(projectId, environment, flagKey), keys.flagList(projectId, environment));
}

/**
 * Remove every cached flag list for a project (e.g. when the project is deleted).
 */
export async function invalidateProjectFlags(projectId: string): Promise<void> {
  await cacheDel(...VALID_ENVIRONMENTS.map(env => keys.flagList(projectId, env)));
}

/**
 * Call when a project is deleted or its API key is regenerated,
 * so the old key stops working immediately instead of after the TTL.
 */
export async function invalidateApiKey(apiKey: string): Promise<void> {
  await cacheDel(keys.apiKey(apiKey));
}

/**
 * Pre-load every flag for a project into the cache.
 */
export async function warmCache(projectId: string): Promise<void> {
  if (!redisClient) return;

  const flags = await prisma.flag.findMany({ where: { projectId } });

  for (const flag of flags) {
    await cacheSet(keys.flag(projectId, flag.environment, flag.key), flag);
  }
  for (const env of VALID_ENVIRONMENTS) {
    await getSdkFlags(projectId, env); // fills the flag-list cache on a miss
  }

  console.log(`Cache warmed for project ${projectId} with ${flags.length} flags`);
}
