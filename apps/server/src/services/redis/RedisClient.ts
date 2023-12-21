import { Redis, RedisOptions } from "ioredis";
require("dotenv").config();

class RedisConfig {
  private redis: Redis;
  private subscriber: Redis;
  private static instance: RedisConfig;
  private isSubscribed: boolean = false;

  private constructor(options?: RedisOptions) {
    const PORT = 14613;
    const HOST = "redis-a9593a3-abhishekverman3459-978c.a.aivencloud.com";
    const password = process.env.REDIS_PASSWORD || "AVNS_n5torHAeNiZrXXGwKmX";
    this.redis = new Redis(PORT, HOST, { password });
    this.subscriber = new Redis(PORT, HOST, { password });
    console.log("🟢 Connecting to production_redis");
  }

  static getInstance(options?: RedisOptions): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig(options);
    }
    RedisConfig.instance.redis.on("connect", () => {
      console.log("🟢 Connected to production_redis");
    });
    RedisConfig.instance.redis.on("error", (err) => {
      console.log("🔴 Error connecting to production_redis:", err);
    });
    return RedisConfig.instance;
  }

  async consume(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    if (!this.isSubscribed) {
      await this.subscriber.subscribe(channel);
      this.isSubscribed = true;
      console.log(`🟢 Subscribed to ${channel} inside consume`);
    }

    this.subscriber.on("message", (ch, message) => {
      if (channel === ch) {
        console.log(`🟢 Received message: ${message}`);
        callback(message);
      }
    });
  }

  async produce(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message);
    console.log(`🟢 Sent ${message} to ${channel}`);
  }

  async push_queue(queue: string, message: string): Promise<void> {
    await this.redis.rpush(queue, message);
  }

  async pop_queue(queue: string): Promise<string | null> {
    return await this.redis.lpop(queue);
  }

  get_QueueLength(queue: string): Promise<number> {
    return this.redis.llen(queue);
  }
}

export default RedisConfig;
