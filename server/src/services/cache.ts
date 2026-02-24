import redisClient from '../config/redis';
import prisma from '../config/database';

const CACHE_TTL = 300; // 5 minutes in seconds
const CACHE_PREFIX = 'flag:';

/**
 * Generate cache key for a flag
 */
function getCacheKey(projectId: string, flagKey: string): string {
  return `${CACHE_PREFIX}${projectId}:${flagKey}`;
}

/**
 * Get flag from cache or database
 * Implements cache-aside pattern
 */
export async function getFlag(projectId: string, flagKey: string) {
  const cacheKey = getCacheKey(projectId, flagKey);

  if (redisClient) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
  }

  // Cache miss or no Redis - fetch from database
  const flag = await prisma.flag.findUnique({
    where: {
      projectId_key_environment: {
        projectId,
        key: flagKey,
        environment: 'Production',
      },
    },
  });

  if (flag && redisClient) {
    try {
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(flag));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  return flag;
}

/**
 * Invalidate flag cache when it's updated
 */
export async function invalidateFlag(projectId: string, flagKey: string): Promise<void> {
  if (!redisClient) return;
  const cacheKey = getCacheKey(projectId, flagKey);

  try {
    await redisClient.del(cacheKey);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Warm cache by loading all flags for a project
 */
export async function warmCache(projectId: string): Promise<void> {
  if (!redisClient) return;

  const flags = await prisma.flag.findMany({
    where: { projectId },
  });

  for (const flag of flags) {
    const cacheKey = getCacheKey(projectId, flag.key);
    try {
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(flag));
    } catch (error) {
      console.error(`Failed to warm cache for flag ${flag.key}:`, error);
    }
  }

  console.log(`✅ Cache warmed for project ${projectId} with ${flags.length} flags`);
}
