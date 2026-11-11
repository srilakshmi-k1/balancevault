const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Verifies the Bearer JWT and attaches `req.user` with the full DB record.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
      }
      return errorResponse(res, 'Invalid token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return errorResponse(res, 'User not found', 401);
    if (!user.isActive) return errorResponse(res, 'Account deactivated', 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
