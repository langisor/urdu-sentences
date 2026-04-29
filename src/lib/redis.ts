// lib/redis.ts
import { createClient, RedisClientType } from "redis";

const globalForRedis = global as typeof global & {
  redisClient?: RedisClientType;
};

export async function getRedisClient(): Promise<RedisClientType> {
  if (!globalForRedis.redisClient) {
    const client = createClient({
      url: process.env.REDIS_URL,
    }) as RedisClientType;

    client.on("error", (err) => console.error("Redis Error:", err));
    await client.connect();

    globalForRedis.redisClient = client;
  }

  return globalForRedis.redisClient;
}