import Redis from 'ioredis';

let redisClient: Redis | null = null;

// DISABLE_CACHE=true runs the server without Redis, even if REDIS_URL is set.
// Used to benchmark the API with and without caching.
const cacheDisabled = process.env.DISABLE_CACHE === 'true';

if (process.env.REDIS_URL && !cacheDisabled) {
  redisClient = new Redis(process.env.REDIS_URL, {
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
} else if (cacheDisabled) {
  console.log('Cache disabled (DISABLE_CACHE=true), running without Redis');
} else {
  console.log('Redis not configured, running without cache');
}

export default redisClient;
