// lib/redis.ts
import { createClient, RedisClientType } from "redis";

const globalForRedis = global as typeof global & {
  redisClient?: RedisClientType;
};

function getRedisUrl(): string | undefined {
  // Upstash Redis REST URL (preferred for serverless)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return process.env.UPSTASH_REDIS_REST_URL.replace("https://", "rediss://");
  }
  // Fallback to REDIS_URL
  return process.env.REDIS_URL;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (!globalForRedis.redisClient) {
    const url = getRedisUrl();
    if (!url) {
      throw new Error("Redis URL not configured. Set UPSTASH_REDIS_REST_URL or REDIS_URL environment variable.");
    }

    const client = createClient({
      url,
    }) as RedisClientType;

    client.on("error", (err) => console.error("Redis Error:", err));
    await client.connect();

    globalForRedis.redisClient = client;
  }

  return globalForRedis.redisClient;
}