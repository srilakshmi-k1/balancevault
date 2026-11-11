const { getLedgerForUser, getLedgerForTransaction, verifyLedgerIntegrity } = require('../services/ledgerService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

async function getMyLedger(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getLedgerForUser(req.user.id, { page: Number(page), limit: Number(limit) });
    return paginatedResponse(res, result.entries, {
      total: result.total, page: result.page, limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getLedgerByTransaction(req, res, next) {
  try {
    const entries = await getLedgerForTransaction(req.params.transactionId, req.user.id, req.user.role);
    return successResponse(res, entries, 'Ledger entries retrieved');
  } catch (err) {
    next(err);
  }
}

async function verifyIntegrity(req, res, next) {
  try {
    const result = await verifyLedgerIntegrity();
    return successResponse(res, result, result.verified ? 'Ledger integrity verified' : 'Ledger issues found');
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyLedger, getLedgerByTransaction, verifyIntegrity };
