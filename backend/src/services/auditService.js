const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

/**
 * Records an audit event. Never throws – audit failure must not break the main flow.
 */
async function recordAudit({ actorId, action, targetType, targetId, outcome, requestId, ipAddress, userAgent, metadata }) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        targetType: targetType || null,
        targetId: targetId || null,
        outcome,
        requestId: requestId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: metadata || null,
      },
    });
  } catch (err) {
    logger.error('Audit log write failed', { error: err.message, action, actorId });
  }
}

module.exports = { recordAudit };
