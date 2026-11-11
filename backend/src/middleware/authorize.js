const { errorResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');

/**
 * Checks that the authenticated user holds one of the allowed roles.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'UNAUTHORIZED_ACCESS',
          targetType: 'Route',
          targetId: req.path,
          outcome: 'DENIED',
          requestId: req.requestId,
          ipAddress: req.ip,
          metadata: { method: req.method, requiredRoles: roles },
        },
      }).catch(() => {}); // fire-and-forget – don't break the request

      return errorResponse(res, 'Access forbidden', 403);
    }
    next();
  };
}

module.exports = authorize;
