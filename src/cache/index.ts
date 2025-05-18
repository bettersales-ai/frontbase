import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      // Maximum retry delay of 3 seconds
      return Math.min(retries * 50, 3000);
    }
  },
});

redis.on("error", (err) => console.error("Redis Client Error:", err));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    try {
      await redis.connect();
      console.log("Connected to Redis redis");
    } catch (error) {
      console.error("Error connecting to Redis", error);
      throw error;
    }
  }
  return redis;
};

// Initialize connection
connectRedis().catch(console.error);

export default redis;
