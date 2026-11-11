const { getAccountsForUser, getAccountById, getAllAccounts, updateAccountStatus } = require('../services/accountService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

function getRequestContext(req) {
  return { requestId: req.requestId, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

async function getMyAccounts(req, res, next) {
  try {
    const accounts = await getAccountsForUser(req.user.id);
    return successResponse(res, accounts, 'Accounts retrieved');
  } catch (err) {
    next(err);
  }
}

async function getAccount(req, res, next) {
  try {
    const account = await getAccountById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, account, 'Account details retrieved');
  } catch (err) {
    next(err);
  }
}

async function listAllAccounts(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const result = await getAllAccounts({ status, page: Number(page), limit: Number(limit) });
    return paginatedResponse(res, result.accounts, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

async function changeAccountStatus(req, res, next) {
  try {
    const account = await updateAccountStatus(req.params.id, req.user.id, req.body, getRequestContext(req));
    return successResponse(res, account, 'Account status updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyAccounts, getAccount, listAllAccounts, changeAccountStatus };
