import { createClient } from "redis";

const cache = createClient({
  url: process.env.REDIS_URL,
});

cache.on("error", err => console.log("Redis cache Error", err));

await cache.connect();

export default cache;