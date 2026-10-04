import redis from "../../../shared/redis/redis.js";

const WINDOW_SECONDS = 60;

const Limits = {
  chat: 20,
  coding: 5,
  pdf: 1,
  ppt: 5,
  image: 5,
  search: 5,
};

export const checkLimit = async (userId, agent) => {
  const max = Limits[agent] ?? Limits.chat;
  const key = `Rate:${userId}:${agent}`;

  // incr + expire in one round trip, expire only when the key is new
  const results = await redis.multi().incr(key).ttl(key).exec();

  // ioredis returns [[err, value], ...]; node-redis returns [value, ...]
  const count = Array.isArray(results[0]) ? results[0][1] : results[0];
  let ttl = Array.isArray(results[1]) ? results[1][1] : results[1];

  if (count === 1 || ttl === -1) {
    await redis.expire(key, WINDOW_SECONDS);
    ttl = WINDOW_SECONDS;
  }

  if (count > max) {
    const error = new Error(`Rate limit exceeded for ${agent}`);
    error.status = 429;
    error.data = {
      success: false,
      agent,
      limit: max,
      remaining: 0,
      retryAfter: ttl,
      message: `You have reached the ${agent} limit (${max} requests/minute). Try again in ${ttl}s.`,
    };
    throw error;
  }

  return { remaining: max - count, limit: max };
};
