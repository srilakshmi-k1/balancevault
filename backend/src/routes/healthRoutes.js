const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { getRedisClient } = require('../utils/redis');

// GET /health
router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /health/ready  or  GET /api/ready
router.get('/ready', async (req, res) => {
  const checks = { database: false, redis: 'not configured' };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {}

  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      checks.redis = true;
    }
  } catch {}

  const allReady = checks.database === true;
  res.status(allReady ? 200 : 503).json({
    status: allReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
