const { getDashboardStats, getAllUsers, getAuditLogs } = require('../services/adminService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

async function dashboard(req, res, next) {
  try {
    const stats = await getDashboardStats();
    return successResponse(res, stats, 'Dashboard data retrieved');
  } catch (err) {
    next(err);
  }
}

async function users(req, res, next) {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const result = await getAllUsers({ page: Number(page), limit: Number(limit), role, search });
    return paginatedResponse(res, result.users, {
      total: result.total, page: result.page, limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

async function auditLogs(req, res, next) {
  try {
    const { page = 1, limit = 20, action, actorId } = req.query;
    const result = await getAuditLogs({ page: Number(page), limit: Number(limit), action, actorId });
    return paginatedResponse(res, result.logs, {
      total: result.total, page: result.page, limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard, users, auditLogs };
