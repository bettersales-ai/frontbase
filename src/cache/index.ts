import { createClient } from "redis";

let connected = false;

const cache = createClient({
  url: process.env.REDIS_URL,
});

cache.on("error", err => console.log("Redis cache Error", err));

(async () => {
  if (!connected) {
    try {
      await cache.connect();
      console.log("Connected to Redis cache");
      connected = true;
    } catch (error) {
      console.error("Error connecting to Redis cache", error);
    }
  }
})();

export const redis = cache;

export default cache;