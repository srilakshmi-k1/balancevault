const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../utils/redis');

const isDev = process.env.NODE_ENV !== 'production';

function createLimiter(options) {
  const redis = getRedisClient();

  const limiterOptions = {
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting entirely in development
    skip: () => isDev,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    },
    ...options,
  };

  // Use Redis store when available in production
  if (!isDev && redis) {
    try {
      const { RedisStore } = require('rate-limit-redis');
      limiterOptions.store = new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      });
    } catch {
      // fall back to memory store
    }
  }

  return rateLimit(limiterOptions);
}

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per 15 min in production
  keyGenerator: (req) => `auth:${req.ip}`,
});

const transferLimiter = createLimiter({
  windowMs: 60 * 1000,       // 1 minute
  max: 20,                   // 20 transfers per minute in production
  keyGenerator: (req) => `transfer:${req.user?.id || req.ip}`,
});

const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

module.exports = { authLimiter, transferLimiter, generalLimiter };
