const { registerUser, loginUser, getCurrentUser } = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function getRequestContext(req) {
  return { requestId: req.requestId, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

async function register(req, res, next) {
  try {
    const user = await registerUser(req.body, getRequestContext(req));
    return successResponse(res, user, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await loginUser(req.body, getRequestContext(req));
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // JWT is stateless; client removes the token. We just confirm.
  return successResponse(res, null, 'Logged out successfully');
}

async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    return successResponse(res, user, 'User details retrieved');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
