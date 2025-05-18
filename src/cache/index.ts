import "server-only";

import * as redis from "redis";

const cache = redis.createClient({
  url: process.env.REDIS_URL,
});

cache.on("error", (err) => console.error("Redis Client Error:", err));

(async () => {
  await cache.connect();
})();


export default cache;
