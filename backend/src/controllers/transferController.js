const { executeTransfer, getTransactionsForUser, getTransactionById, getAllTransactions } = require('../services/transferService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

function getRequestContext(req) {
  return { requestId: req.requestId, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

async function transfer(req, res, next) {
  try {
    const result = await executeTransfer(
      { ...req.body, senderId: req.user.id },
      getRequestContext(req)
    );
    return successResponse(res, result, 'Transfer completed successfully', result.cached ? 200 : 201);
  } catch (err) {
    next(err);
  }
}

async function getMyTransactions(req, res, next) {
  try {
    const { page = 1, limit = 20, accountId } = req.query;
    const result = await getTransactionsForUser(req.user.id, { page: Number(page), limit: Number(limit), accountId });
    return paginatedResponse(res, result.transactions, {
      total: result.total, page: result.page, limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getTransaction(req, res, next) {
  try {
    const transaction = await getTransactionById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, transaction, 'Transaction retrieved');
  } catch (err) {
    next(err);
  }
}

async function listAllTransactions(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getAllTransactions({ page: Number(page), limit: Number(limit) });
    return paginatedResponse(res, result.transactions, {
      total: result.total, page: result.page, limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { transfer, getMyTransactions, getTransaction, listAllTransactions };
